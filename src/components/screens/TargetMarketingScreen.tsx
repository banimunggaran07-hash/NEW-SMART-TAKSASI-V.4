import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { MarketingTarget } from '../../types';
import { BottomSheet, ContextualHeader, Icon } from '../ui/Primitives';

interface TargetMarketingScreenProps {
  targets: MarketingTarget[];
  onBack: () => void;
  onOpenLeaderboard: () => void;
  onUpdateTarget: (id: string, bqTotal: number, bookingTarget: number) => void;
  onToast: (msg: string) => void;
}

export const TargetMarketingScreen: React.FC<TargetMarketingScreenProps> = ({
  targets,
  onBack,
  onOpenLeaderboard,
  onUpdateTarget,
  onToast,
}) => {
  const [editing, setEditing] = useState<MarketingTarget | null>(null);
  const [bqTotalInput, setBqTotalInput] = useState(50);
  const [bookingTargetInput, setBookingTargetInput] = useState(16);
  const [refreshing, setRefreshing] = useState(false);

  const sorted = useMemo(
    () =>
      [...targets].sort((a, b) => {
        const pctA = a.bqTotal > 0 ? a.bqDone / a.bqTotal : 0;
        const pctB = b.bqTotal > 0 ? b.bqDone / b.bqTotal : 0;
        return pctB - pctA;
      }),
    [targets]
  );

  const teamDone = targets.reduce((acc, t) => acc + t.bqDone, 0);
  const teamTotal = targets.reduce((acc, t) => acc + t.bqTotal, 0);
  const teamPct = teamTotal > 0 ? Math.round((teamDone / teamTotal) * 100) : 0;

  const openEdit = (m: MarketingTarget) => {
    setEditing(m);
    setBqTotalInput(m.bqTotal);
    setBookingTargetInput(m.bookingTarget);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    onUpdateTarget(
      editing.id,
      Math.max(1, bqTotalInput),
      Math.max(1, bookingTargetInput)
    );
    onToast(`Target ${editing.name} diperbarui`);
    setEditing(null);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <ContextualHeader
        title="Target Marketing"
        subtitle={`Periode 2026-11 · ${targets.length} marketing`}
        onBack={onBack}
        rightSlot={
          <button
            type="button"
            onClick={() => {
              setRefreshing(true);
              setTimeout(() => {
                setRefreshing(false);
                onToast('Data capaian disinkronkan');
              }, 450);
            }}
            aria-label="Segarkan data target"
            className="w-10 h-10 rounded-full bg-light-surface-container-lowest dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-sm flex items-center justify-center text-light-on-surface-variant dark:text-dark-on-surface-variant tactile-press"
          >
            <Icon
              name="refresh"
              size={18}
              className={refreshing ? 'animate-spin' : ''}
            />
          </button>
        }
      />

      <main className="px-4 py-4 pb-10 flex flex-col gap-4 max-w-4xl w-full mx-auto">
        {/* Target Tim Summary Card */}
        <section className="rounded-lg bg-light-primary dark:bg-dark-primary-container border border-light-primary border-b-2 shadow-md p-4 flex items-center justify-between gap-3 text-light-on-primary">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-md bg-light-primary-container/80 border border-light-inverse-primary/40 flex items-center justify-center shrink-0">
              <Icon name="flag" size={22} />
            </div>
            <div className="flex flex-col">
              <span className="font-label text-label-sm text-light-on-primary-container">
                Target Tim
              </span>
              <span className="font-title text-title-md tabular-nums">
                {teamDone} dari {teamTotal} kontrak
              </span>
            </div>
          </div>
          <span className="font-headline text-display-md-mobile tabular-nums">
            {teamPct}%
          </span>
        </section>

        {/* Papan Peringkat Ringkas */}
        <section className="rounded-lg bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-md p-4 flex flex-col gap-3">
          <header className="flex items-center justify-between gap-2">
            <div>
              <h2 className="font-title text-title-sm text-light-on-surface dark:text-dark-on-surface">
                Papan Peringkat
              </h2>
              <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                Capaian tertinggi bulan ini
              </span>
            </div>
            <button
              type="button"
              onClick={onOpenLeaderboard}
              className="inline-flex items-center gap-1 rounded-full bg-light-secondary-container dark:bg-dark-secondary-container px-3 py-1.5 font-label text-label-sm text-light-on-secondary-container dark:text-dark-on-secondary-container tactile-press"
            >
              <Icon name="emoji_events" size={16} />
              <span>Lihat Podium</span>
            </button>
          </header>

          <div className="flex flex-col gap-2">
            {sorted.slice(0, 3).map((m, idx) => {
              const pct =
                m.bqTotal > 0 ? Math.round((m.bqDone / m.bqTotal) * 100) : 0;
              return (
                <div
                  key={m.id}
                  className="rounded-md bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-sm px-3 py-2.5 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-7 h-7 rounded-full bg-light-primary dark:bg-dark-primary text-light-on-primary dark:text-dark-on-primary font-label text-label-md flex items-center justify-center shrink-0 tabular-nums">
                      {idx + 1}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="font-label text-label-lg text-light-on-surface dark:text-dark-on-surface truncate">
                        {m.name}
                      </span>
                      <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant tabular-nums">
                        {m.bqDone}/{m.bqTotal} BQ · {m.bookingDone}/
                        {m.bookingTarget} bkg
                      </span>
                    </div>
                  </div>
                  <span className="font-headline text-headline-sm text-light-primary dark:text-dark-primary tabular-nums shrink-0">
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Target Semua Marketing */}
        <section className="flex flex-col gap-2.5">
          <h2 className="font-title text-title-sm text-light-on-surface dark:text-dark-on-surface">
            Target Semua Marketing
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sorted.map((m) => {
              const pct =
                m.bqTotal > 0 ? Math.round((m.bqDone / m.bqTotal) * 100) : 0;
              const remaining = Math.max(0, m.bqTotal - m.bqDone);
              const barColor =
                pct >= 45
                  ? 'bg-light-primary-container dark:bg-dark-primary'
                  : pct >= 17
                    ? 'bg-warning dark:bg-dark-warning'
                    : 'bg-light-error dark:bg-dark-error';

              return (
                <article
                  key={m.id}
                  className="rounded-lg bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-md p-3.5 flex flex-col gap-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-light-secondary-container dark:bg-dark-secondary-container text-light-on-secondary-container dark:text-dark-on-secondary-container font-title text-title-sm flex items-center justify-center shrink-0">
                        {m.initials}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-label text-label-lg text-light-on-surface dark:text-dark-on-surface truncate">
                          {m.name}
                        </span>
                        <span className="font-mono text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                          {m.csId}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-headline text-headline-sm text-light-on-surface dark:text-dark-on-surface tabular-nums">
                        {pct}%
                      </span>
                      <button
                        type="button"
                        onClick={() => openEdit(m)}
                        aria-label={`Ubah target ${m.name}`}
                        className="w-9 h-9 rounded-md bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant border-b-2 flex items-center justify-center text-light-primary dark:text-dark-primary tactile-press"
                      >
                        <Icon name="edit" size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="w-full h-2 rounded-full bg-light-surface-container-high dark:bg-dark-surface-container-high overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, pct)}%` }}
                      transition={{ duration: 0.5 }}
                      className={`h-full rounded-full ${barColor}`}
                    />
                  </div>

                  <div className="flex items-center justify-between text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant tabular-nums">
                    <span>
                      {m.bqDone} dari {m.bqTotal} kontrak · Target booking:{' '}
                      {m.bookingTarget}
                    </span>
                    <span className="font-label text-label-sm text-light-primary dark:text-dark-primary">
                      sisa {remaining}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>

      {/* Edit Target Bottom Sheet */}
      <BottomSheet
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={`Atur Target · ${editing?.name || ''}`}
        subtitle={editing?.csId}
      >
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="font-label text-label-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
              Target Kontrak BQ
            </span>
            <input
              type="number"
              min={1}
              value={bqTotalInput}
              onChange={(e) => setBqTotalInput(Number(e.target.value) || 1)}
              className="w-full min-h-[44px] rounded-md bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant px-3 py-2 font-mono text-body-md text-light-on-surface dark:text-dark-on-surface focus:border-light-primary dark:focus:border-dark-primary focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-label text-label-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
              Target Booking Bulanan
            </span>
            <input
              type="number"
              min={1}
              value={bookingTargetInput}
              onChange={(e) =>
                setBookingTargetInput(Number(e.target.value) || 1)
              }
              className="w-full min-h-[44px] rounded-md bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant px-3 py-2 font-mono text-body-md text-light-on-surface dark:text-dark-on-surface focus:border-light-primary dark:focus:border-dark-primary focus:outline-none"
            />
          </label>
          <button
            type="submit"
            className="w-full min-h-[46px] rounded-md bg-light-primary dark:bg-dark-primary border border-light-primary dark:border-dark-primary border-b-2 text-light-on-primary dark:text-dark-on-primary font-label text-label-lg tactile-press"
          >
            Simpan Target
          </button>
        </form>
      </BottomSheet>
    </div>
  );
};
