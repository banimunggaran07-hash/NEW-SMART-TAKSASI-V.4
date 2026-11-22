import React, { useState } from 'react';
import { motion } from 'motion/react';
import { formatIDR } from '../../data/mockData';
import { BqContract, GformProspect, MarketingTarget, ScreenId } from '../../types';
import { Icon } from '../ui/Primitives';

interface DashboardScreenProps {
  bqContracts: BqContract[];
  gformProspects: GformProspect[];
  targets: MarketingTarget[];
  onNavigate: (screen: ScreenId, presetFilter?: string) => void;
}

const BOOKING_TREND_POINTS = [
  { label: 'Tgl 2', x: 8, y: 30, count: 6 },
  { label: 'Tgl 5', x: 52, y: 28, count: 7 },
  { label: 'Tgl 7', x: 92, y: 30, count: 6 },
  { label: 'Tgl 10', x: 136, y: 58, count: 3 },
  { label: 'Tgl 12', x: 176, y: 58, count: 3 },
  { label: 'Tgl 13', x: 204, y: 14, count: 10 },
  { label: 'Tgl 16', x: 254, y: 58, count: 3 },
  { label: 'Tgl 20', x: 312, y: 58, count: 5 },
];

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  bqContracts,
  gformProspects,
  targets,
  onNavigate,
}) => {
  const [selectedTrendIdx, setSelectedTrendIdx] = useState<number | null>(5);

  // Baseline historical synced counts + interactive contract records = 251 total initially
  const liveSudah = bqContracts.filter((c) => c.status === 'Sudah Bayar').length;
  const liveJanji = bqContracts.filter((c) => c.status === 'Janji Bayar').length;
  const liveBelum = bqContracts.filter((c) => c.status === 'Belum Bayar').length;

  const totalBq = 244 + bqContracts.length;
  const sudahBayar = 143 + liveSudah;
  const janjiBayar = liveJanji;
  const belumBayar = 101 + liveBelum;

  const paidPct = totalBq > 0 ? Math.round((sudahBayar / totalBq) * 100) : 0;
  const paidPctDecimal = totalBq > 0 ? ((sudahBayar / totalBq) * 100).toFixed(1).replace('.', ',') : '0,0';
  const janjiPctDecimal = totalBq > 0 ? ((janjiBayar / totalBq) * 100).toFixed(1).replace('.', ',') : '0,0';
  const belumPctDecimal = totalBq > 0 ? ((belumBayar / totalBq) * 100).toFixed(1).replace('.', ',') : '0,0';

  const circumference = 2 * Math.PI * 38; // ~238.76
  const paidStroke = (sudahBayar / Math.max(1, totalBq)) * circumference;
  const janjiStroke = (janjiBayar / Math.max(1, totalBq)) * circumference;

  // Gform RO funnel counts (171 baseline + 6 interactive = 177 initially)
  const gfTotal = 171 + gformProspects.length;
  const gfBaru = 171 + gformProspects.filter((g) => g.status === 'Baru').length;
  const gfKontak = gformProspects.filter((g) => g.status === 'Kontak').length;
  const gfMinat = gformProspects.filter((g) => g.status === 'Minat').length;
  const gfTolak = gformProspects.filter((g) => g.status === 'Tolak').length;
  const gfRo = gformProspects.filter((g) => g.status === 'RO').length;

  // Target Tim summary
  const teamDone = targets.reduce((acc, t) => acc + t.bqDone, 0);
  const teamTotal = targets.reduce((acc, t) => acc + t.bqTotal, 0);
  const teamPct = teamTotal > 0 ? Math.round((teamDone / teamTotal) * 100) : 0;

  const overdueCount = 42 + bqContracts.filter((c) => c.status === 'Belum Bayar').length;
  const totalTunggakan =
    260553000 +
    bqContracts
      .filter((c) => c.status !== 'Sudah Bayar')
      .reduce((acc, c) => acc + c.installmentAmount, 0);

  return (
    <main className="px-4 py-4 pb-safe-content lg:pb-8 flex flex-col gap-5">
      {/* Pengingat Penagihan Alert Strip */}
      <motion.button
        type="button"
        onClick={() => onNavigate('bq', 'Belum Bayar')}
        whileTap={{ scale: 0.99 }}
        className="w-full text-left rounded-md bg-light-error-container dark:bg-dark-error-container border border-light-error/30 dark:border-dark-error/30 border-b-2 shadow-sm px-4 py-2.5 flex items-center justify-between gap-3 hover:brightness-95 transition-all"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-md bg-light-error dark:bg-dark-error text-light-on-error dark:text-dark-on-error flex items-center justify-center shrink-0">
            <Icon name="notifications_active" size={18} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-label text-label-lg text-light-on-error-container dark:text-dark-on-error-container">
              Pengingat Penagihan
            </span>
            <span className="font-body text-body-sm text-light-on-error-container/90 dark:text-dark-on-error-container/90 tabular-nums truncate">
              {overdueCount} kontrak jatuh tempo · telat terlama 1.349 hr
            </span>
          </div>
        </div>
        <Icon
          name="chevron_right"
          size={20}
          className="text-light-on-error-container dark:text-dark-on-error-container shrink-0"
        />
      </motion.button>

      {/* Ringkasan Operasional (Compact Raised KPI Matrix) */}
      <section aria-label="Ringkasan Operasional" className="flex flex-col gap-2.5">
        {/* Row 1: Primary Volume Cards */}
        <div className="grid grid-cols-3 gap-2.5 items-stretch">
          <button
            type="button"
            onClick={() => onNavigate('bq')}
            className="h-full text-left rounded-md bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-md p-3 flex flex-col justify-between gap-1 hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container tactile-press"
          >
            <div className="flex items-center justify-between gap-1">
              <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                Total BQ
              </span>
              <Icon
                name="fact_check"
                size={16}
                className="text-light-primary dark:text-dark-primary"
              />
            </div>
            <p className="font-headline text-display-md-mobile text-light-on-surface dark:text-dark-on-surface tabular-nums">
              {totalBq}
            </p>
            <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
              Kontrak aktif
            </span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('gform')}
            className="h-full text-left rounded-md bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-md p-3 flex flex-col justify-between gap-1 hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container tactile-press"
          >
            <div className="flex items-center justify-between gap-1">
              <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                Gform RO
              </span>
              <Icon
                name="sync_alt"
                size={16}
                className="text-warning dark:text-dark-warning"
              />
            </div>
            <p className="font-headline text-display-md-mobile text-light-on-surface dark:text-dark-on-surface tabular-nums">
              {gfTotal}
            </p>
            <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
              Prospek baru
            </span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('riwayat')}
            className="h-full text-left rounded-md bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-md p-3 flex flex-col justify-between gap-1 hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container tactile-press"
          >
            <div className="flex items-center justify-between gap-1">
              <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                Taksasi
              </span>
              <Icon
                name="history"
                size={16}
                className="text-light-secondary dark:text-dark-secondary"
              />
            </div>
            <p className="font-title text-title-md text-light-primary dark:text-dark-primary">
              Riwayat
            </p>
            <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
              Lihat daftar
            </span>
          </button>
        </div>

        {/* Row 2: Raised Payment Status Table Strip */}
        <div className="rounded-md bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-md grid grid-cols-3 divide-x divide-light-outline-variant dark:divide-dark-outline-variant overflow-hidden">
          <button
            type="button"
            onClick={() => onNavigate('bq', 'Sudah Bayar')}
            className="px-3 py-2.5 flex flex-col items-start gap-1 hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container transition-colors tactile-press"
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-success dark:bg-dark-success shrink-0" />
              <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant whitespace-nowrap">
                Sudah Bayar
              </span>
            </div>
            <span className="font-headline text-headline-sm text-success dark:text-dark-success tabular-nums">
              {sudahBayar}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('bq', 'Janji Bayar')}
            className="px-3 py-2.5 flex flex-col items-start gap-1 hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container transition-colors tactile-press"
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-warning dark:bg-dark-warning shrink-0" />
              <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant whitespace-nowrap">
                Janji Bayar
              </span>
            </div>
            <span className="font-headline text-headline-sm text-warning dark:text-dark-warning tabular-nums">
              {janjiBayar}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('bq', 'Belum Bayar')}
            className="px-3 py-2.5 flex flex-col items-start gap-1 hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container transition-colors tactile-press"
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-light-error dark:bg-dark-error shrink-0" />
              <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant whitespace-nowrap">
                Belum Bayar
              </span>
            </div>
            <span className="font-headline text-headline-sm text-light-error dark:text-dark-error tabular-nums">
              {belumBayar}
            </span>
          </button>
        </div>
      </section>

      {/* Aksi Cepat (Raised Option Buttons) */}
      <section aria-label="Aksi Cepat" className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="font-title text-title-sm text-light-on-surface dark:text-dark-on-surface">
            Aksi Cepat
          </h2>
          <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
            Alat kerja lapangan
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2.5 items-stretch">
          <button
            type="button"
            onClick={() => onNavigate('kalkulator')}
            className="min-h-[68px] rounded-md bg-light-primary dark:bg-dark-primary border border-light-primary dark:border-dark-primary border-b-2 shadow-md text-light-on-primary dark:text-dark-on-primary px-2 py-2.5 flex flex-col items-center justify-center gap-1 hover:brightness-110 tactile-press"
          >
            <Icon name="calculate" size={20} />
            <span className="font-label text-label-md whitespace-nowrap">
              Kalkulator
            </span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('cari-otr')}
            className="min-h-[68px] rounded-md bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-md text-light-on-surface dark:text-dark-on-surface px-2 py-2.5 flex flex-col items-center justify-center gap-1 hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container tactile-press"
          >
            <Icon
              name="search"
              size={20}
              className="text-light-primary dark:text-dark-primary"
            />
            <span className="font-label text-label-md whitespace-nowrap">
              Cari OTR
            </span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('cek-clop')}
            className="min-h-[68px] rounded-md bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-md text-light-on-surface dark:text-dark-on-surface px-2 py-2.5 flex flex-col items-center justify-center gap-1 hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container tactile-press"
          >
            <Icon
              name="verified_user"
              size={20}
              className="text-warning dark:text-dark-warning"
            />
            <span className="font-label text-label-md whitespace-nowrap">
              Cek CLOP
            </span>
          </button>
        </div>
      </section>

      {/* Analitik Section */}
      <section aria-label="Analitik Bulanan" className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-title text-title-sm text-light-on-surface dark:text-dark-on-surface">
            Analitik
          </h2>
          <span className="font-label text-label-sm text-light-on-secondary-container dark:text-dark-on-secondary-container bg-light-secondary-container dark:bg-dark-secondary-container border border-light-outline-variant dark:border-dark-outline-variant shadow-sm px-2.5 py-1 rounded-full">
            Nov 2026
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 items-stretch">
          {/* Card 1: Booking Quality & Tunggakan */}
          <article className="rounded-lg bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-md p-4 flex flex-col justify-between gap-4">
            <header className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Icon
                  name="donut_large"
                  size={20}
                  className="text-light-primary dark:text-dark-primary"
                />
                <h3 className="font-title text-title-sm text-light-on-surface dark:text-dark-on-surface">
                  Booking Quality
                </h3>
              </div>
              <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant tabular-nums">
                {totalBq} kontrak
              </span>
            </header>

            <div className="flex items-center gap-4">
              {/* SVG Donut Chart */}
              <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                <svg
                  viewBox="0 0 100 100"
                  className="w-24 h-24 -rotate-90"
                  aria-hidden="true"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    className="stroke-light-surface-container-high dark:stroke-dark-surface-container-high"
                    strokeWidth="12"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    className="stroke-light-error dark:stroke-dark-error"
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={0}
                  />
                  {janjiStroke > 0 && (
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="none"
                      className="stroke-warning dark:stroke-dark-warning"
                      strokeWidth="12"
                      strokeDasharray={`${janjiStroke} ${circumference}`}
                      strokeDashoffset={-paidStroke}
                    />
                  )}
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    className="stroke-success dark:stroke-dark-success"
                    strokeWidth="12"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: `0 ${circumference}` }}
                    animate={{ strokeDasharray: `${paidStroke} ${circumference}` }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-headline text-headline-sm text-light-on-surface dark:text-dark-on-surface tabular-nums">
                    {paidPct}%
                  </span>
                  <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                    selesai
                  </span>
                </div>
              </div>

              {/* Raised Table-like Legend Rows */}
              <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                <div className="rounded-sm bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant px-2.5 py-1.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-success dark:bg-dark-success shrink-0" />
                    <span className="font-body text-body-sm text-light-on-surface dark:text-dark-on-surface truncate">
                      Sudah Bayar
                    </span>
                  </div>
                  <span className="font-label text-label-md text-light-on-surface dark:text-dark-on-surface tabular-nums shrink-0">
                    {sudahBayar} ({paidPctDecimal}%)
                  </span>
                </div>

                <div className="rounded-sm bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant px-2.5 py-1.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-warning dark:bg-dark-warning shrink-0" />
                    <span className="font-body text-body-sm text-light-on-surface dark:text-dark-on-surface truncate">
                      Janji Bayar
                    </span>
                  </div>
                  <span className="font-label text-label-md text-light-on-surface-variant dark:text-dark-on-surface-variant tabular-nums shrink-0">
                    {janjiBayar} ({janjiPctDecimal}%)
                  </span>
                </div>

                <div className="rounded-sm bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant px-2.5 py-1.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-light-error dark:bg-dark-error shrink-0" />
                    <span className="font-body text-body-sm text-light-on-surface dark:text-dark-on-surface truncate">
                      Belum Bayar
                    </span>
                  </div>
                  <span className="font-label text-label-md text-light-error dark:text-dark-error tabular-nums shrink-0">
                    {belumBayar} ({belumPctDecimal}%)
                  </span>
                </div>
              </div>
            </div>

            <footer className="rounded-md bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant shadow-sm px-3 py-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Icon
                  name="account_balance_wallet"
                  size={16}
                  className="text-light-on-surface-variant dark:text-dark-on-surface-variant"
                />
                <span className="font-label text-label-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
                  Total Tunggakan
                </span>
              </div>
              <span className="font-mono text-mono-sm text-light-primary dark:text-dark-primary tabular-nums">
                {formatIDR(totalTunggakan)}
              </span>
            </footer>
          </article>

          {/* Card 2: Tren Capaian Booking */}
          <article className="rounded-lg bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-md p-4 flex flex-col justify-between gap-4">
            <header className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Icon
                  name="trending_up"
                  size={20}
                  className="text-light-primary dark:text-dark-primary"
                />
                <div className="flex flex-col">
                  <h3 className="font-title text-title-sm text-light-on-surface dark:text-dark-on-surface">
                    Tren Capaian Booking
                  </h3>
                  <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant tabular-nums">
                    Nov: 43 kontrak · Okt: 0
                  </span>
                </div>
              </div>
              <span
                role="status"
                className="inline-flex items-center px-2.5 py-1 rounded-full bg-success-container dark:bg-dark-success-container text-on-success-container dark:text-dark-on-success-container shadow-sm font-label text-label-sm tabular-nums"
              >
                +43
              </span>
            </header>

            <div className="w-full">
              <svg
                viewBox="0 0 320 105"
                className="w-full h-28 overflow-visible"
                role="img"
                aria-label="Grafik tren capaian booking November 2026"
              >
                <defs>
                  <linearGradient id="bookingFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1565C0" stopOpacity="0.24" />
                    <stop offset="100%" stopColor="#1565C0" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <line
                  x1="0"
                  y1="20"
                  x2="320"
                  y2="20"
                  className="stroke-light-surface-variant dark:stroke-dark-surface-variant"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <line
                  x1="0"
                  y1="50"
                  x2="320"
                  y2="50"
                  className="stroke-light-surface-variant dark:stroke-dark-surface-variant"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <line
                  x1="0"
                  y1="80"
                  x2="320"
                  y2="80"
                  className="stroke-light-surface-variant dark:stroke-dark-surface-variant"
                  strokeWidth="1"
                />
                <path
                  d="M 8 30 C 26 48, 34 48, 52 28 C 70 16, 76 62, 92 30 C 108 16, 120 62, 136 58 C 152 54, 162 76, 176 58 C 190 36, 200 12, 214 68 C 228 32, 240 24, 254 58 C 268 58, 286 58, 312 58 L 312 80 L 8 80 Z"
                  fill="url(#bookingFill)"
                />
                <motion.path
                  d="M 8 30 C 26 48, 34 48, 52 28 C 70 16, 76 62, 92 30 C 108 16, 120 62, 136 58 C 152 54, 162 76, 176 58 C 190 36, 200 12, 214 68 C 228 32, 240 24, 254 58 C 268 58, 286 58, 312 58"
                  fill="none"
                  className="stroke-light-primary-container dark:stroke-dark-primary"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                />

                {BOOKING_TREND_POINTS.map((pt, idx) => {
                  const isSelected = selectedTrendIdx === idx;
                  return (
                    <g
                      key={pt.label}
                      className="cursor-pointer"
                      onClick={() => setSelectedTrendIdx(idx)}
                    >
                      <circle cx={pt.x} cy={pt.y} r="12" fill="transparent" />
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isSelected ? 4.5 : 3}
                        className={
                          isSelected
                            ? 'fill-light-primary dark:fill-dark-primary stroke-white dark:stroke-dark-surface'
                            : 'fill-light-primary-container dark:fill-dark-primary-container'
                        }
                        strokeWidth={isSelected ? 1.5 : 0}
                      />
                    </g>
                  );
                })}

                <text
                  x="8"
                  y="98"
                  className="fill-light-on-surface-variant dark:fill-dark-on-surface-variant text-[10px] font-label"
                >
                  Tgl 2
                </text>
                <text
                  x="88"
                  y="98"
                  className="fill-light-on-surface-variant dark:fill-dark-on-surface-variant text-[10px] font-label"
                >
                  Tgl 7
                </text>
                <text
                  x="194"
                  y="98"
                  className="fill-light-on-surface-variant dark:fill-dark-on-surface-variant text-[10px] font-label"
                >
                  Tgl 13
                </text>
                <text
                  x="290"
                  y="98"
                  className="fill-light-on-surface-variant dark:fill-dark-on-surface-variant text-[10px] font-label"
                >
                  Tgl 20
                </text>
              </svg>
            </div>

            {selectedTrendIdx !== null && (
              <div className="rounded-md bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant px-3 py-1.5 flex items-center justify-between text-body-sm">
                <span className="text-light-on-surface-variant dark:text-dark-on-surface-variant">
                  {BOOKING_TREND_POINTS[selectedTrendIdx].label} Nov 2026
                </span>
                <span className="font-mono text-mono-sm text-light-primary dark:text-dark-primary tabular-nums">
                  {BOOKING_TREND_POINTS[selectedTrendIdx].count} kontrak booking
                </span>
              </div>
            )}
          </article>

          {/* Card 3: Pipeline Bahan Gform */}
          <article className="rounded-lg bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-md p-4 flex flex-col justify-between gap-4">
            <header className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Icon
                  name="bar_chart"
                  size={20}
                  className="text-light-primary dark:text-dark-primary"
                />
                <h3 className="font-title text-title-sm text-light-on-surface dark:text-dark-on-surface">
                  Pipeline Bahan Gform
                </h3>
              </div>
              <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant tabular-nums">
                {gfTotal} nasabah
              </span>
            </header>

            <div className="grid grid-cols-5 gap-1.5">
              {[
                { label: 'Baru', count: gfBaru, active: true },
                { label: 'Kontak', count: gfKontak, active: gfKontak > 0 },
                { label: 'Minat', count: gfMinat, active: gfMinat > 0 },
                { label: 'Tolak', count: gfTolak, active: gfTolak > 0 },
                { label: 'RO', count: gfRo, active: gfRo > 0 },
              ].map((cell) => (
                <button
                  key={cell.label}
                  type="button"
                  onClick={() => onNavigate('gform', cell.label)}
                  className={`rounded-sm border border-b-2 shadow-sm p-2 flex flex-col items-center gap-1 tactile-press ${
                    cell.active
                      ? 'bg-light-secondary-container/70 dark:bg-dark-secondary-container/70 border-light-primary dark:border-dark-primary'
                      : 'bg-light-surface-container-low dark:bg-dark-surface-container border-light-outline-variant dark:border-dark-outline-variant'
                  }`}
                >
                  <span
                    className={`font-title text-title-md tabular-nums ${
                      cell.active
                        ? 'text-light-primary dark:text-dark-primary'
                        : 'text-light-on-surface-variant dark:text-dark-on-surface-variant'
                    }`}
                  >
                    {cell.count}
                  </span>
                  <span
                    className={`font-label text-label-sm ${
                      cell.active
                        ? 'text-light-on-secondary-container dark:text-dark-on-secondary-container'
                        : 'text-light-on-surface-variant dark:text-dark-on-surface-variant'
                    }`}
                  >
                    {cell.label}
                  </span>
                </button>
              ))}
            </div>

            <footer className="flex items-center justify-between pt-2 border-t border-light-surface-variant dark:border-dark-outline-variant">
              <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                Ketuk tahap untuk filter prospek
              </span>
              <button
                type="button"
                onClick={() => onNavigate('gform')}
                className="inline-flex items-center gap-1 font-label text-label-lg text-light-primary dark:text-dark-primary hover:underline"
              >
                <span>Buka Gform</span>
                <Icon name="arrow_forward" size={16} />
              </button>
            </footer>
          </article>

          {/* Card 4: Capaian Target Tim */}
          <article className="rounded-lg bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-md p-4 flex flex-col justify-between gap-4">
            <header className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Icon
                  name="flag"
                  size={20}
                  className="text-warning dark:text-dark-warning"
                />
                <div className="flex flex-col">
                  <h3 className="font-title text-title-sm text-light-on-surface dark:text-dark-on-surface">
                    Capaian Target Tim
                  </h3>
                  <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant tabular-nums">
                    {teamDone} dari {teamTotal} kontrak
                  </span>
                </div>
              </div>
              <span
                role="status"
                className="inline-flex items-center px-2.5 py-1 rounded-full bg-warning-container dark:bg-dark-warning-container text-on-warning-container dark:text-dark-on-warning-container shadow-sm font-label text-label-sm tabular-nums"
              >
                {teamPct}% tim
              </span>
            </header>

            <div className="flex flex-col gap-2.5">
              {targets.map((member) => {
                const pct =
                  member.bqTotal > 0
                    ? Math.round((member.bqDone / member.bqTotal) * 100)
                    : 0;
                const barColor =
                  pct >= 45
                    ? 'bg-light-primary-container dark:bg-dark-primary'
                    : pct >= 17
                      ? 'bg-warning dark:bg-dark-warning'
                      : 'bg-light-error dark:bg-dark-error';

                return (
                  <div key={member.id} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-label text-label-md text-light-on-surface dark:text-dark-on-surface truncate">
                        {member.name}
                      </span>
                      <span
                        className={`font-label text-label-md tabular-nums shrink-0 ${
                          pct >= 45
                            ? 'text-light-on-surface dark:text-dark-on-surface'
                            : 'text-light-on-surface-variant dark:text-dark-on-surface-variant'
                        }`}
                      >
                        {pct}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-light-surface-container-high dark:bg-dark-surface-container-high overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, pct)}%` }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className={`h-full rounded-full ${barColor}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <footer className="flex items-center justify-between pt-2 border-t border-light-surface-variant dark:border-dark-outline-variant">
              <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                {targets.length} marketing aktif
              </span>
              <button
                type="button"
                onClick={() => onNavigate('target')}
                className="inline-flex items-center gap-1 font-label text-label-lg text-light-primary dark:text-dark-primary hover:underline"
              >
                <span>Atur Target</span>
                <Icon name="arrow_forward" size={16} />
              </button>
            </footer>
          </article>
        </div>
      </section>
    </main>
  );
};
