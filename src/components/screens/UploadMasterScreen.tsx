import React, { useState } from 'react';
import { ContextualHeader, Icon } from '../ui/Primitives';

interface UploadMasterScreenProps {
  onBack: () => void;
  onToast: (msg: string) => void;
}

export const UploadMasterScreen: React.FC<UploadMasterScreenProps> = ({
  onBack,
  onToast,
}) => {
  const [datasets, setDatasets] = useState([
    { id: 'bq', title: 'Data Booking Quality (BQ)', count: '251 baris', updated: '22 Nov 2026 · 07:45' },
    { id: 'gform', title: 'Data Bahan Gform RO', count: '177 baris', updated: '22 Nov 2026 · 07:42' },
    { id: 'otr', title: 'Master OTR Kendaraan', count: '4.650 unit', updated: '20 Nov 2026 · 18:00' },
    { id: 'clop', title: 'Database CLOP HO', count: '48.496 kontrak', updated: '19 Nov 2026 · 14:15' },
  ]);

  const handleSimulatedUpload = (id: string, title: string) => {
    setDatasets((prev) =>
      prev.map((d) => (d.id === id ? { ...d, updated: 'Baru saja disinkronkan' } : d))
    );
    onToast(`${title} berhasil diperbarui`);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <ContextualHeader
        title="Upload Data Master"
        subtitle="Sinkronisasi file Excel / CSV operasional"
        onBack={onBack}
      />

      <main className="px-4 py-4 pb-10 flex flex-col gap-3 max-w-3xl w-full mx-auto">
        {datasets.map((item) => (
          <article
            key={item.id}
            className="rounded-lg bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-md p-4 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-md bg-light-secondary-container dark:bg-dark-secondary-container text-light-on-secondary-container dark:text-dark-on-secondary-container flex items-center justify-center shrink-0">
                <Icon name="table_chart" size={20} />
              </div>
              <div className="flex flex-col min-w-0">
                <h2 className="font-title text-title-sm text-light-on-surface dark:text-dark-on-surface truncate">
                  {item.title}
                </h2>
                <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                  {item.count} · {item.updated}
                </span>
              </div>
            </div>
            <label className="min-h-[40px] rounded-md bg-light-primary dark:bg-dark-primary border border-light-primary border-b-2 px-3 py-2 flex items-center gap-1.5 font-label text-label-md text-light-on-primary dark:text-dark-on-primary cursor-pointer tactile-press shrink-0">
              <Icon name="cloud_upload" size={16} />
              <span>Upload</span>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={() => handleSimulatedUpload(item.id, item.title)}
              />
            </label>
          </article>
        ))}
      </main>
    </div>
  );
};
