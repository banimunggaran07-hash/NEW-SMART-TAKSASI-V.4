import React from 'react';
import { formatIDR } from '../../data/mockData';
import { TaksasiCalculation } from '../../types';
import { ContextualHeader, Icon } from '../ui/Primitives';

interface RiwayatTaksasiScreenProps {
  history: TaksasiCalculation[];
  onBack: () => void;
  onNewCalc: () => void;
  onDelete: (id: string) => void;
}

export const RiwayatTaksasiScreen: React.FC<RiwayatTaksasiScreenProps> = ({
  history,
  onBack,
  onNewCalc,
  onDelete,
}) => {
  return (
    <div className="min-h-[100dvh] flex flex-col">
      <ContextualHeader
        title="Riwayat Taksasi"
        subtitle={`${history.length} simulasi tersimpan`}
        onBack={onBack}
        rightSlot={
          <button
            type="button"
            onClick={onNewCalc}
            className="min-h-[38px] rounded-full bg-light-primary dark:bg-dark-primary px-3.5 py-1.5 flex items-center gap-1 font-label text-label-md text-light-on-primary dark:text-dark-on-primary shadow-sm tactile-press"
          >
            <Icon name="add" size={16} />
            <span>Baru</span>
          </button>
        }
      />

      <main className="px-4 py-4 pb-10 flex flex-col gap-3 max-w-4xl w-full mx-auto">
        {history.length === 0 ? (
          <div className="rounded-lg bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant p-8 text-center flex flex-col items-center gap-2">
            <Icon
              name="history"
              size={32}
              className="text-light-on-surface-variant dark:text-dark-on-surface-variant"
            />
            <p className="font-title text-title-sm text-light-on-surface dark:text-dark-on-surface">
              Belum ada riwayat taksasi
            </p>
            <p className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
              Simulasi yang Anda simpan dari Kalkulator Taksasi akan muncul di sini.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {history.map((item) => (
              <article
                key={item.id}
                className="rounded-lg bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-md p-4 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                      {item.createdAt}
                    </span>
                    <h3 className="font-title text-title-sm text-light-on-surface dark:text-dark-on-surface truncate">
                      {item.customerName}
                    </h3>
                    <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                      {item.brandType} ({item.year}) · {item.mode}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDelete(item.id)}
                    aria-label="Hapus riwayat"
                    className="w-9 h-9 rounded-md bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant flex items-center justify-center text-light-error dark:text-dark-error tactile-press shrink-0"
                  >
                    <Icon name="delete" size={18} />
                  </button>
                </div>

                <div className="rounded-md bg-light-primary dark:bg-dark-primary-container px-3 py-2.5 flex items-center justify-between text-light-on-primary">
                  <div className="flex flex-col">
                    <span className="font-label text-label-sm text-light-on-primary-container">
                      Terima Bersih
                    </span>
                    <span className="font-headline text-headline-sm tabular-nums">
                      {formatIDR(item.netDisbursement)}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-label text-label-sm text-light-on-primary-container">
                      Angsuran {item.tenor}x
                    </span>
                    <span className="font-mono text-mono-sm tabular-nums">
                      {formatIDR(item.installment)}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
