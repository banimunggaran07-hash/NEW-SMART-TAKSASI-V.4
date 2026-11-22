import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CLOP_DISTRIBUTION, CLOP_RECORDS, formatNumber } from '../../data/mockData';
import { ClopRecord } from '../../types';
import { ContextualHeader, Icon } from '../ui/Primitives';

interface CekClopScreenProps {
  onBack: () => void;
  onToast: (msg: string) => void;
}

export const CekClopScreen: React.FC<CekClopScreenProps> = ({
  onBack,
  onToast,
}) => {
  const [contractInput, setContractInput] = useState('');
  const [result, setResult] = useState<ClopRecord | null>(null);
  const [notFoundCode, setNotFoundCode] = useState<string | null>(null);

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = contractInput.trim();
    if (!cleaned) {
      onToast('Masukkan nomor kontrak terlebih dahulu');
      return;
    }

    const exact = CLOP_RECORDS.find((r) => r.contractNumber === cleaned);
    if (exact) {
      setResult(exact);
      setNotFoundCode(null);
      return;
    }

    // Deterministic lookup for any 10-12 digit contract number so testing any number works smoothly
    if (/^\d{8,14}$/.test(cleaned)) {
      const idx = Number(cleaned.slice(-2)) % CLOP_DISTRIBUTION.length;
      const cat = CLOP_DISTRIBUTION[idx].label as ClopRecord['category'];
      setResult({
        contractNumber: cleaned,
        customerName: 'NASABAH TERVERIFIKASI HO',
        category: cat,
        branch: 'PARUNG PANJANG · 15576',
        status: cat === 'ABADI' || cat === 'EX ABODEMENT' ? 'VALID' : 'REVIEW',
        lastPaymentDate: '15 Nov 2026',
        maxLtvBoost: cat === 'ABADI' ? '+10% LTV' : 'Standar',
        note: `Data sinkronisasi CLOP HO kategori ${cat}.`,
      });
      setNotFoundCode(null);
    } else {
      setResult(null);
      setNotFoundCode(cleaned);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <ContextualHeader
        title="Cek CLOP"
        subtitle="Verifikasi status kontrak CLOP HO"
        onBack={onBack}
      />

      <main className="px-4 py-4 pb-10 flex flex-col gap-4 max-w-4xl w-full mx-auto">
        {/* Input Lookup Card */}
        <form
          onSubmit={handleCheck}
          className="rounded-lg bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-md p-4 flex flex-col gap-3"
        >
          <label className="flex flex-col gap-1.5">
            <span className="font-label text-label-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
              Masukkan Nomor Kontrak
            </span>
            <div className="relative">
              <Icon
                name="receipt_long"
                size={18}
                className="text-light-on-surface-variant dark:text-dark-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              />
              <input
                type="text"
                inputMode="numeric"
                value={contractInput}
                onChange={(e) => setContractInput(e.target.value)}
                placeholder="Contoh: 155234633626"
                className="w-full min-h-[44px] rounded-md bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant pl-10 pr-4 py-2 font-mono text-body-md text-light-on-surface dark:text-dark-on-surface focus:border-light-primary dark:focus:border-dark-primary focus:outline-none"
              />
            </div>
          </label>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
              Contoh cepat:
            </span>
            {CLOP_RECORDS.map((rec) => (
              <button
                key={rec.contractNumber}
                type="button"
                onClick={() => {
                  setContractInput(rec.contractNumber);
                  setResult(rec);
                  setNotFoundCode(null);
                }}
                className="px-2.5 py-1 rounded-full bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant font-mono text-label-sm text-light-primary dark:text-dark-primary tactile-press"
              >
                {rec.contractNumber}
              </button>
            ))}
          </div>

          <button
            type="submit"
            className="w-full min-h-[46px] rounded-md bg-light-primary dark:bg-dark-primary border border-light-primary dark:border-dark-primary border-b-2 shadow-md px-4 py-2.5 flex items-center justify-center gap-2 font-label text-label-lg text-light-on-primary dark:text-dark-on-primary tactile-press"
          >
            <Icon name="search" size={18} />
            <span>Cek Kontrak</span>
          </button>
        </form>

        {/* Verification Result */}
        {result && (
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-primary dark:border-dark-primary border-b-2 shadow-md p-4 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Icon
                  name="verified_user"
                  size={20}
                  className="text-success dark:text-dark-success"
                />
                <span className="font-title text-title-sm text-light-on-surface dark:text-dark-on-surface">
                  {result.customerName}
                </span>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full font-label text-label-sm ${
                  result.status === 'VALID'
                    ? 'bg-success-container dark:bg-dark-success-container text-on-success-container dark:text-dark-on-success-container'
                    : 'bg-warning-container dark:bg-dark-warning-container text-on-warning-container dark:text-dark-on-warning-container'
                }`}
              >
                {result.status} · {result.category}
              </span>
            </div>

            <div className="rounded-md bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant divide-y divide-light-outline-variant dark:divide-dark-outline-variant overflow-hidden">
              <div className="px-3 py-2 flex items-center justify-between">
                <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                  No. Kontrak
                </span>
                <span className="font-mono text-mono-sm text-light-on-surface dark:text-dark-on-surface tabular-nums">
                  {result.contractNumber}
                </span>
              </div>
              <div className="px-3 py-2 flex items-center justify-between">
                <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                  Cabang / Kios
                </span>
                <span className="font-label text-label-md text-light-on-surface dark:text-dark-on-surface">
                  {result.branch}
                </span>
              </div>
              <div className="px-3 py-2 flex items-center justify-between">
                <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                  Pembayaran Terakhir
                </span>
                <span className="font-label text-label-md text-light-on-surface dark:text-dark-on-surface">
                  {result.lastPaymentDate}
                </span>
              </div>
              <div className="px-3 py-2 flex items-center justify-between">
                <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                  Benefit LTV
                </span>
                <span className="font-label text-label-md text-light-primary dark:text-dark-primary">
                  {result.maxLtvBoost}
                </span>
              </div>
            </div>

            <p className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
              {result.note}
            </p>
          </motion.section>
        )}

        {notFoundCode && (
          <div className="rounded-lg bg-light-error-container dark:bg-dark-error-container border border-light-error/30 p-4 flex items-center gap-3 text-light-on-error-container dark:text-dark-on-error-container">
            <Icon name="error" size={20} />
            <span className="font-body text-body-sm">
              Format nomor kontrak "{notFoundCode}" tidak valid (gunakan 8–14 digit angka).
            </span>
          </div>
        )}

        {/* Sebaran CLOP HO */}
        <section className="rounded-lg bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-md p-4 flex flex-col gap-3.5">
          <header className="flex items-center justify-between gap-2">
            <div>
              <h2 className="font-title text-title-sm text-light-on-surface dark:text-dark-on-surface">
                Sebaran CLOP HO
              </h2>
              <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant tabular-nums">
                48.496 kontrak terdaftar
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-light-secondary-container dark:bg-dark-secondary-container font-label text-label-sm text-light-on-secondary-container dark:text-dark-on-secondary-container">
              Database HO
            </span>
          </header>

          <div className="flex flex-col gap-3">
            {CLOP_DISTRIBUTION.map((item) => (
              <div key={item.label} className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-label text-label-md text-light-on-surface dark:text-dark-on-surface">
                    {item.label}
                  </span>
                  <span className="font-mono text-mono-sm text-light-on-surface-variant dark:text-dark-on-surface-variant tabular-nums">
                    {formatNumber(item.count)} ·{' '}
                    {item.percent.toFixed(1).replace('.', ',')}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-light-surface-container-high dark:bg-dark-surface-container-high overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percent}%` }}
                    transition={{ duration: 0.6 }}
                    className={`h-full rounded-full ${item.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
