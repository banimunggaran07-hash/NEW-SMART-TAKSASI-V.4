import React, { useMemo, useState } from 'react';
import { formatIDR, OTR_DATABASE } from '../../data/mockData';
import { OtrUnit } from '../../types';
import { BottomSheet, ContextualHeader, Icon } from '../ui/Primitives';

interface CariOtrScreenProps {
  onBack: () => void;
  onSelectUnitForTaksasi: (unit: OtrUnit) => void;
}

export const CariOtrScreen: React.FC<CariOtrScreenProps> = ({
  onBack,
  onSelectUnitForTaksasi,
}) => {
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState<
    'Semua' | 'Honda' | 'Yamaha' | 'Suzuki'
  >('Semua');
  const [yearFilter, setYearFilter] = useState<'Semua' | number>('Semua');
  const [tuneSheetOpen, setTuneSheetOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return OTR_DATABASE.filter((u) => {
      if (brandFilter !== 'Semua' && u.brand !== brandFilter) return false;
      if (yearFilter !== 'Semua' && u.year !== yearFilter) return false;
      if (!q) return true;
      return (
        u.modelName.toLowerCase().includes(q) ||
        u.description.toLowerCase().includes(q) ||
        u.vehicleCode.toLowerCase().includes(q) ||
        u.groupType.toLowerCase().includes(q) ||
        String(u.year).includes(q)
      );
    });
  }, [search, brandFilter, yearFilter]);

  const years = useMemo(
    () => Array.from(new Set(OTR_DATABASE.map((u) => u.year))).sort((a, b) => b - a),
    []
  );

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <ContextualHeader
        title="Cari OTR"
        subtitle={`4.650 unit · ${filtered.length} tampil`}
        onBack={onBack}
        rightSlot={
          <button
            type="button"
            onClick={() => setTuneSheetOpen(true)}
            aria-label="Filter tahun dan grup"
            className="w-10 h-10 rounded-full bg-light-surface-container-lowest dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-sm flex items-center justify-center text-light-on-surface-variant dark:text-dark-on-surface-variant tactile-press"
          >
            <Icon name="tune" size={18} />
          </button>
        }
      />

      <main className="px-4 py-4 pb-10 flex flex-col gap-3.5 max-w-5xl w-full mx-auto">
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
            placeholder="Cari tipe motor, tahun, atau kode unit..."
            className="w-full min-h-[44px] rounded-lg bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-sm pl-10 pr-4 py-2 font-body text-body-md text-light-on-surface dark:text-dark-on-surface placeholder:text-light-on-surface-variant dark:placeholder:text-dark-on-surface-variant focus:border-light-primary dark:focus:border-dark-primary focus:outline-none"
          />
        </div>

        {/* Brand Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {(['Semua', 'Honda', 'Yamaha', 'Suzuki'] as const).map((brand) => {
            const active = brandFilter === brand;
            return (
              <button
                key={brand}
                type="button"
                onClick={() => setBrandFilter(brand)}
                className={`min-h-[38px] px-4 py-1.5 rounded-full border border-b-2 shadow-sm font-label text-label-md whitespace-nowrap shrink-0 tactile-press ${
                  active
                    ? 'bg-light-primary dark:bg-dark-primary border-light-primary dark:border-dark-primary text-light-on-primary dark:text-dark-on-primary'
                    : 'bg-light-surface-container-lowest dark:bg-dark-surface-container-low border-light-outline-variant dark:border-dark-outline-variant text-light-on-surface-variant dark:text-dark-on-surface-variant'
                }`}
              >
                {brand}
              </button>
            );
          })}
          {yearFilter !== 'Semua' && (
            <button
              type="button"
              onClick={() => setYearFilter('Semua')}
              className="min-h-[38px] px-3 py-1.5 rounded-full bg-light-secondary-container dark:bg-dark-secondary-container border border-light-primary dark:border-dark-primary font-label text-label-sm text-light-on-secondary-container dark:text-dark-on-secondary-container flex items-center gap-1 shrink-0"
            >
              <span>Tahun {yearFilter}</span>
              <Icon name="close" size={14} />
            </button>
          )}
        </div>

        {/* Unit Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((unit) => (
            <article
              key={unit.id}
              className="rounded-lg bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-md p-4 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant uppercase">
                      {unit.brand}
                    </span>
                    <span aria-hidden="true" className="text-light-outline">
                      ·
                    </span>
                    <span className="font-label text-label-sm text-light-primary dark:text-dark-primary tabular-nums">
                      Tahun {unit.year}
                    </span>
                  </div>
                  <h3 className="font-title text-title-md text-light-on-surface dark:text-dark-on-surface truncate">
                    {unit.groupType} · {unit.modelName}
                  </h3>
                </div>
              </div>

              <div className="rounded-md bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant divide-y divide-light-outline-variant dark:divide-dark-outline-variant overflow-hidden">
                <div className="px-3 py-2 flex items-center justify-between gap-2">
                  <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                    Harga OTR
                  </span>
                  <span className="font-headline text-title-md text-light-primary dark:text-dark-primary tabular-nums">
                    {formatIDR(unit.otrPrice)}
                  </span>
                </div>
                <div className="px-3 py-2 flex items-center justify-between gap-2">
                  <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                    Deskripsi
                  </span>
                  <span className="font-label text-label-sm text-light-on-surface dark:text-dark-on-surface text-right truncate">
                    {unit.description}
                  </span>
                </div>
                <div className="px-3 py-2 flex items-center justify-between gap-2">
                  <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                    Object Type
                  </span>
                  <span className="font-mono text-mono-sm text-light-on-surface dark:text-dark-on-surface truncate">
                    {unit.objectType}
                  </span>
                </div>
                <div className="px-3 py-2 flex items-center justify-between gap-2">
                  <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                    Group Type
                  </span>
                  <span className="font-label text-label-md text-light-on-surface dark:text-dark-on-surface">
                    {unit.groupType}
                  </span>
                </div>
                <div className="px-3 py-2 flex items-center justify-between gap-2">
                  <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                    Vehicle Code
                  </span>
                  <span className="font-mono text-mono-sm text-light-primary dark:text-dark-primary">
                    {unit.vehicleCode}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onSelectUnitForTaksasi(unit)}
                className="w-full min-h-[44px] rounded-md bg-light-primary dark:bg-dark-primary border border-light-primary dark:border-dark-primary border-b-2 shadow-sm px-4 py-2 flex items-center justify-center gap-2 font-label text-label-lg text-light-on-primary dark:text-dark-on-primary tactile-press"
              >
                <Icon name="calculate" size={18} />
                <span>Hitung Taksasi Unit Ini</span>
              </button>
            </article>
          ))}
        </div>
      </main>

      <BottomSheet
        open={tuneSheetOpen}
        onClose={() => setTuneSheetOpen(false)}
        title="Filter Tahun Kendaraan"
        subtitle="Pilih tahun produksi unit OTR"
      >
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => {
              setYearFilter('Semua');
              setTuneSheetOpen(false);
            }}
            className={`min-h-[44px] rounded-md border border-b-2 font-label text-label-md tactile-press ${
              yearFilter === 'Semua'
                ? 'bg-light-primary dark:bg-dark-primary border-light-primary dark:border-dark-primary text-light-on-primary dark:text-dark-on-primary'
                : 'bg-light-surface-container-low dark:bg-dark-surface-container border-light-outline-variant dark:border-dark-outline-variant text-light-on-surface dark:text-dark-on-surface'
            }`}
          >
            Semua
          </button>
          {years.map((yr) => (
            <button
              key={yr}
              type="button"
              onClick={() => {
                setYearFilter(yr);
                setTuneSheetOpen(false);
              }}
              className={`min-h-[44px] rounded-md border border-b-2 font-label text-label-md tabular-nums tactile-press ${
                yearFilter === yr
                  ? 'bg-light-primary dark:bg-dark-primary border-light-primary dark:border-dark-primary text-light-on-primary dark:text-dark-on-primary'
                  : 'bg-light-surface-container-low dark:bg-dark-surface-container border-light-outline-variant dark:border-dark-outline-variant text-light-on-surface dark:text-dark-on-surface'
              }`}
            >
              {yr}
            </button>
          ))}
        </div>
      </BottomSheet>
    </div>
  );
};
