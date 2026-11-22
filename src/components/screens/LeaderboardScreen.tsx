import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { MarketingTarget } from '../../types';
import { ContextualHeader, Icon } from '../ui/Primitives';

interface LeaderboardScreenProps {
  targets: MarketingTarget[];
  onBack: () => void;
  onToast: (msg: string) => void;
}

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({
  targets,
  onBack,
  onToast,
}) => {
  const [period, setPeriod] = useState<'Nov 2026' | 'Okt 2026'>('Nov 2026');
  const [refreshing, setRefreshing] = useState(false);

  const ranked = useMemo(() => {
    const base = [...targets];
    if (period === 'Okt 2026') {
      return base
        .map((m) => ({
          ...m,
          score: Math.max(5, Math.round(m.score * 0.82)),
          bqDone: Math.max(1, Math.round(m.bqDone * 0.85)),
        }))
        .sort((a, b) => b.score - a.score);
    }
    return base.sort((a, b) => b.score - a.score);
  }, [targets, period]);

  const top1 = ranked[0];
  const top2 = ranked[1];
  const top3 = ranked[2];

  const shortName = (name: string) => {
    const parts = name.split(' ');
    if (parts.length <= 2) return name;
    return `${parts[0]} ${parts[1][0]}.`;
  };

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <ContextualHeader
        title="Leaderboard"
        subtitle="Peringkat capaian marketing"
        onBack={onBack}
        rightSlot={
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() =>
                setPeriod((p) => (p === 'Nov 2026' ? 'Okt 2026' : 'Nov 2026'))
              }
              className="min-h-[38px] rounded-full bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant border-b-2 px-3 py-1 flex items-center gap-1 font-label text-label-sm text-light-on-surface dark:text-dark-on-surface tactile-press"
            >
              <Icon name="calendar_month" size={16} />
              <span>{period}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setRefreshing(true);
                setTimeout(() => {
                  setRefreshing(false);
                  onToast('Peringkat diperbarui');
                }, 400);
              }}
              aria-label="Segarkan peringkat"
              className="w-10 h-10 rounded-full bg-light-surface-container-lowest dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-sm flex items-center justify-center text-light-on-surface-variant dark:text-dark-on-surface-variant tactile-press"
            >
              <Icon
                name="refresh"
                size={18}
                className={refreshing ? 'animate-spin' : ''}
              />
            </button>
          </div>
        }
      />

      <main className="px-4 py-4 pb-10 flex flex-col gap-4 max-w-4xl w-full mx-auto">
        {/* Top 3 Podium Cards (Raised) */}
        {top1 && top2 && top3 && (
          <section
            aria-label="Peringkat 3 Besar"
            className="grid grid-cols-3 gap-2 items-end pt-2"
          >
            {/* Rank 2 */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="rounded-lg bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-md p-3 flex flex-col items-center gap-1 text-center"
            >
              <span className="w-6 h-6 rounded-full bg-light-secondary-container dark:bg-dark-secondary-container border border-light-outline-variant dark:border-dark-outline-variant shadow-sm flex items-center justify-center font-label text-label-sm text-light-on-secondary-container dark:text-dark-on-secondary-container tabular-nums">
                2
              </span>
              <span className="font-label text-label-md text-light-on-surface dark:text-dark-on-surface truncate w-full">
                {shortName(top2.name)}
              </span>
              <span className="font-headline text-headline-sm text-light-primary dark:text-dark-primary tabular-nums">
                {top2.score}
              </span>
              <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                skor
              </span>
            </motion.div>

            {/* Rank 1 */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg bg-light-primary dark:bg-dark-primary-container border border-light-primary border-b-2 shadow-md p-4 flex flex-col items-center gap-1 text-center text-light-on-primary"
            >
              <span className="w-7 h-7 rounded-full bg-warning-container border border-light-outline-variant shadow-sm flex items-center justify-center font-label text-label-md text-on-warning-container tabular-nums">
                1
              </span>
              <span className="font-label text-label-lg truncate w-full">
                {shortName(top1.name)}
              </span>
              <span className="font-headline text-display-md-mobile tabular-nums">
                {top1.score}
              </span>
              <span className="font-label text-label-sm text-light-on-primary-container">
                skor tertinggi
              </span>
            </motion.div>

            {/* Rank 3 */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-lg bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-md p-3 flex flex-col items-center gap-1 text-center"
            >
              <span className="w-6 h-6 rounded-full bg-light-tertiary-container dark:bg-dark-tertiary-container border border-light-outline-variant dark:border-dark-outline-variant shadow-sm flex items-center justify-center font-label text-label-sm text-light-on-tertiary-container dark:text-dark-on-tertiary-container tabular-nums">
                3
              </span>
              <span className="font-label text-label-md text-light-on-surface dark:text-dark-on-surface truncate w-full">
                {shortName(top3.name)}
              </span>
              <span className="font-headline text-headline-sm text-light-primary dark:text-dark-primary tabular-nums">
                {top3.score}
              </span>
              <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                skor
              </span>
            </motion.div>
          </section>
        )}

        {/* Full Ranking List */}
        <section className="flex flex-col gap-2.5">
          {ranked.map((m, idx) => (
            <article
              key={m.id}
              className="rounded-lg bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-md px-3.5 py-3 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`w-8 h-8 rounded-full font-label text-label-lg flex items-center justify-center shrink-0 tabular-nums ${
                    idx === 0
                      ? 'bg-light-primary dark:bg-dark-primary text-light-on-primary dark:text-dark-on-primary'
                      : 'bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant text-light-on-surface dark:text-dark-on-surface'
                  }`}
                >
                  {idx + 1}
                </span>
                <div className="flex flex-col min-w-0">
                  <span className="font-label text-label-lg text-light-on-surface dark:text-dark-on-surface truncate">
                    {m.name}
                  </span>
                  <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant tabular-nums">
                    BQ {m.bqDone} · RO {m.roCount} · Prospek {m.prospectCount}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end shrink-0">
                <span className="font-headline text-headline-sm text-light-primary dark:text-dark-primary tabular-nums">
                  {m.score}
                </span>
                <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                  skor
                </span>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
};
