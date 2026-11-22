import React, { useMemo, useState } from 'react';
import { ActivityLogEntry } from '../../types';
import { ContextualHeader, Icon } from '../ui/Primitives';

interface ActivityLogScreenProps {
  logs: ActivityLogEntry[];
  onBack: () => void;
  onToast: (msg: string) => void;
}

export const ActivityLogScreen: React.FC<ActivityLogScreenProps> = ({
  logs,
  onBack,
  onToast,
}) => {
  const [search, setSearch] = useState('');
  const [mutationsOnly, setMutationsOnly] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return logs.filter((entry) => {
      if (mutationsOnly && !entry.isMutation) return false;
      if (!q) return true;
      return (
        entry.userName.toLowerCase().includes(q) ||
        entry.csId.toLowerCase().includes(q) ||
        entry.endpoint.toLowerCase().includes(q) ||
        entry.detail.toLowerCase().includes(q)
      );
    });
  }, [logs, search, mutationsOnly]);

  const handleExport = async () => {
    const csv = [
      'Waktu,User,CS ID,Role,Aksi,Endpoint,Detail',
      ...filtered.map(
        (l) =>
          `"${l.timestamp}","${l.userName}","${l.csId}","${l.role}","${l.actionType}","${l.endpoint}","${l.detail}"`
      ),
    ].join('\n');
    try {
      await navigator.clipboard.writeText(csv);
      onToast('Log aktivitas (CSV) disalin ke clipboard');
    } catch {
      onToast('Ringkasan log siap dibagikan');
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <ContextualHeader
        title="Log Aktivitas User"
        subtitle="Riwayat perubahan data tim"
        onBack={onBack}
        rightSlot={
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setRefreshing(true);
                setTimeout(() => {
                  setRefreshing(false);
                  onToast('Log aktivitas disegarkan');
                }, 400);
              }}
              aria-label="Segarkan log"
              className="w-10 h-10 rounded-full bg-light-surface-container-lowest dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-sm flex items-center justify-center text-light-on-surface-variant dark:text-dark-on-surface-variant tactile-press"
            >
              <Icon
                name="refresh"
                size={18}
                className={refreshing ? 'animate-spin' : ''}
              />
            </button>
            <button
              type="button"
              onClick={handleExport}
              aria-label="Ekspor log"
              className="w-10 h-10 rounded-full bg-light-surface-container-lowest dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-sm flex items-center justify-center text-light-primary dark:text-dark-primary tactile-press"
            >
              <Icon name="ios_share" size={18} />
            </button>
          </div>
        }
      />

      <main className="px-4 py-4 pb-10 flex flex-col gap-4 max-w-4xl w-full mx-auto">
        {/* Top Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-md p-3.5 flex flex-col">
            <span className="font-headline text-display-md-mobile text-light-on-surface dark:text-dark-on-surface tabular-nums">
              5
            </span>
            <span className="font-label text-label-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
              User terpantau
            </span>
          </div>
          <div className="rounded-lg bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-md p-3.5 flex flex-col">
            <span className="font-headline text-display-md-mobile text-light-primary dark:text-dark-primary tabular-nums">
              {237 + logs.length}
            </span>
            <span className="font-label text-label-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
              Perubahan data
            </span>
          </div>
        </div>

        {/* Search & Toggle */}
        <div className="flex flex-col gap-2.5">
          <div className="relative">
            <Icon
              name="search"
              size={18}
              className="text-light-on-surface-variant dark:text-dark-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama user, CS ID, atau endpoint..."
              className="w-full min-h-[44px] rounded-lg bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-sm pl-10 pr-4 py-2 font-body text-body-md text-light-on-surface dark:text-dark-on-surface focus:border-light-primary dark:focus:border-dark-primary focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={() => setMutationsOnly((v) => !v)}
            className="w-full min-h-[42px] rounded-md bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant border-b-2 px-3.5 py-2 flex items-center justify-between tactile-press"
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-9 h-5 rounded-full transition-colors p-0.5 flex items-center ${
                  mutationsOnly
                    ? 'bg-light-primary dark:bg-dark-primary justify-end'
                    : 'bg-light-surface-variant dark:bg-dark-surface-variant justify-start'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-white shadow-xs" />
              </div>
              <span className="font-label text-label-md text-light-on-surface dark:text-dark-on-surface">
                Hanya perubahan data
              </span>
            </div>
            <span className="font-mono text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant tabular-nums">
              {237 + filtered.length} baris
            </span>
          </button>
        </div>

        {/* Log Feed */}
        <section className="flex flex-col gap-2.5">
          {filtered.map((entry) => {
            const badgeTone =
              entry.actionType === 'Tambah'
                ? 'bg-success-container dark:bg-dark-success-container text-on-success-container dark:text-dark-on-success-container'
                : entry.actionType === 'Ubah Status'
                  ? 'bg-warning-container dark:bg-dark-warning-container text-on-warning-container dark:text-dark-on-warning-container'
                  : 'bg-light-secondary-container dark:bg-dark-secondary-container text-light-on-secondary-container dark:text-dark-on-secondary-container';

            return (
              <article
                key={entry.id}
                className="rounded-lg bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-md p-3.5 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-light-secondary-container dark:bg-dark-secondary-container text-light-on-secondary-container dark:text-dark-on-secondary-container flex items-center justify-center font-title text-title-sm shrink-0">
                      {entry.actionType[0]}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-label text-label-lg text-light-on-surface dark:text-dark-on-surface truncate">
                        {entry.userName}
                      </span>
                      <span className="font-mono text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                        {entry.csId} · {entry.role}
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant tabular-nums shrink-0">
                    {entry.timestamp}
                  </span>
                </div>

                <div className="rounded-md bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant px-3 py-2 flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full font-label text-label-sm ${badgeTone}`}
                    >
                      {entry.actionType}
                    </span>
                    <span className="font-mono text-label-sm text-light-primary dark:text-dark-primary truncate">
                      {entry.endpoint}
                    </span>
                  </div>
                  <p className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                    {entry.detail}
                  </p>
                </div>
              </article>
            );
          })}
        </section>
      </main>
    </div>
  );
};
