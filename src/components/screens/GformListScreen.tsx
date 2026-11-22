import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { GformProspect, GformStatus } from '../../types';
import { BottomSheet, Icon } from '../ui/Primitives';

interface GformListScreenProps {
  prospects: GformProspect[];
  initialFilter?: string;
  onUpdateStatus: (id: string, status: GformStatus, notes?: string) => void;
  onToast: (msg: string) => void;
  onStartTaksasi?: (prospect: GformProspect) => void;
}

export const GformListScreen: React.FC<GformListScreenProps> = ({
  prospects,
  initialFilter,
  onUpdateStatus,
  onToast,
  onStartTaksasi,
}) => {
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState<
    'Semua' | 'Baru' | 'Proses' | GformStatus
  >(
    initialFilter === 'Baru' ||
      initialFilter === 'Kontak' ||
      initialFilter === 'Minat' ||
      initialFilter === 'Tolak' ||
      initialFilter === 'RO'
      ? initialFilter
      : 'Semua'
  );
  const [selectedMarketing, setSelectedMarketing] = useState('Semua marketing');
  const [marketingSheetOpen, setMarketingSheetOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeProspect, setActiveProspect] = useState<GformProspect | null>(null);
  const [noteInput, setNoteInput] = useState('');

  const marketingNames = useMemo(() => {
    const names = Array.from(new Set(prospects.map((p) => p.marketingName)));
    return ['Semua marketing', ...names];
  }, [prospects]);

  const totalCount = 171 + prospects.length;
  const baruCount = 171 + prospects.filter((p) => p.status === 'Baru').length;
  const prosesCount = prospects.filter((p) => p.status !== 'Baru').length;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return prospects.filter((p) => {
      if (filterMode === 'Baru' && p.status !== 'Baru') return false;
      if (filterMode === 'Proses' && p.status === 'Baru') return false;
      if (
        (filterMode === 'Kontak' ||
          filterMode === 'Minat' ||
          filterMode === 'Tolak' ||
          filterMode === 'RO') &&
        p.status !== filterMode
      ) {
        return false;
      }
      if (
        selectedMarketing !== 'Semua marketing' &&
        p.marketingName !== selectedMarketing
      ) {
        return false;
      }
      if (!q) return true;
      return (
        p.customerName.toLowerCase().includes(q) ||
        p.contractNumber.toLowerCase().includes(q) ||
        p.unitName.toLowerCase().includes(q) ||
        p.plateNumber.toLowerCase().includes(q) ||
        p.marketingName.toLowerCase().includes(q)
      );
    });
  }, [prospects, search, filterMode, selectedMarketing]);

  const openGformSheet = (p: GformProspect) => {
    setActiveProspect(p);
    setNoteInput(p.notes || '');
  };

  const handleSaveFollowUp = (status: GformStatus) => {
    if (!activeProspect) return;
    onUpdateStatus(activeProspect.id, status, noteInput);
    onToast(`Prospek ${activeProspect.customerName} diperbarui → ${status}`);
    setActiveProspect(null);
  };

  const getBadgeProps = (status: GformStatus) => {
    switch (status) {
      case 'RO':
        return 'bg-success-container dark:bg-dark-success-container text-on-success-container dark:text-dark-on-success-container';
      case 'Minat':
        return 'bg-light-secondary-container dark:bg-dark-secondary-container text-light-on-secondary-container dark:text-dark-on-secondary-container';
      case 'Kontak':
        return 'bg-warning-container dark:bg-dark-warning-container text-on-warning-container dark:text-dark-on-warning-container';
      case 'Tolak':
        return 'bg-light-error-container dark:bg-dark-error-container text-light-on-error-container dark:text-dark-on-error-container';
      default:
        return 'bg-light-surface-container-high dark:bg-dark-surface-container-high text-light-on-surface-variant dark:text-dark-on-surface-variant';
    }
  };

  return (
    <main className="px-4 py-4 pb-safe-content lg:pb-8 flex flex-col gap-4">
      {/* Search & Filter Controls */}
      <section className="flex flex-col gap-2.5">
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
            placeholder="Cari prospek, unit motor, nopol..."
            className="w-full min-h-[44px] rounded-lg bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-sm pl-10 pr-4 py-2 font-body text-body-md text-light-on-surface dark:text-dark-on-surface placeholder:text-light-on-surface-variant dark:placeholder:text-dark-on-surface-variant focus:border-light-primary dark:focus:border-dark-primary focus:outline-none"
          />
        </div>

        {/* Raised Status Option Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: 'Semua' as const, label: `Semua (${totalCount})` },
            { id: 'Baru' as const, label: `Baru (${baruCount})` },
            { id: 'Proses' as const, label: `Proses (${prosesCount})` },
          ].map((pill) => {
            const active = filterMode === pill.id;
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => setFilterMode(pill.id)}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-full border border-b-2 shadow-sm font-label text-label-md whitespace-nowrap shrink-0 tactile-press ${
                  active
                    ? 'bg-light-primary dark:bg-dark-primary border-light-primary dark:border-dark-primary text-light-on-primary dark:text-dark-on-primary'
                    : 'bg-light-surface-container-lowest dark:bg-dark-surface-container-low border-light-outline-variant dark:border-dark-outline-variant text-light-on-surface-variant dark:text-dark-on-surface-variant hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container'
                }`}
              >
                {pill.label}
              </button>
            );
          })}
          {(['Kontak', 'Minat', 'RO', 'Tolak'] as GformStatus[]).map((st) => {
            const active = filterMode === st;
            return (
              <button
                key={st}
                type="button"
                onClick={() => setFilterMode(st)}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-full border border-b-2 shadow-sm font-label text-label-md whitespace-nowrap shrink-0 tactile-press ${
                  active
                    ? 'bg-light-primary dark:bg-dark-primary border-light-primary dark:border-dark-primary text-light-on-primary dark:text-dark-on-primary'
                    : 'bg-light-surface-container-lowest dark:bg-dark-surface-container-low border-light-outline-variant dark:border-dark-outline-variant text-light-on-surface-variant dark:text-dark-on-surface-variant hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container'
                }`}
              >
                {st}
              </button>
            );
          })}
        </div>

        {/* Marketing Selector Bar */}
        <button
          type="button"
          onClick={() => setMarketingSheetOpen(true)}
          className="w-full min-h-[44px] rounded-md bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-sm px-3.5 py-2 flex items-center justify-between gap-2 tactile-press"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Icon
              name="filter_list"
              size={18}
              className="text-light-primary dark:text-dark-primary shrink-0"
            />
            <span className="font-label text-label-md text-light-on-surface dark:text-dark-on-surface truncate">
              {selectedMarketing}
            </span>
          </div>
          <Icon
            name="expand_more"
            size={18}
            className="text-light-on-surface-variant dark:text-dark-on-surface-variant shrink-0"
          />
        </button>
      </section>

      {/* Prospect Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.length === 0 ? (
          <div className="col-span-full rounded-lg bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant p-8 text-center flex flex-col items-center gap-2">
            <Icon
              name="assignment_late"
              size={32}
              className="text-light-on-surface-variant dark:text-dark-on-surface-variant"
            />
            <p className="font-title text-title-sm text-light-on-surface dark:text-dark-on-surface">
              Belum ada prospek di tahap ini
            </p>
            <p className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
              Ketuk tombol Gform pada prospek untuk mencatat progres follow-up.
            </p>
          </div>
        ) : (
          filtered.map((prospect) => {
            const isExpanded = expandedId === prospect.id;
            return (
              <motion.article
                layout
                key={prospect.id}
                className="rounded-lg bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-md p-3.5 flex flex-col gap-3"
              >
                <button
                  type="button"
                  onClick={() =>
                    setExpandedId(isExpanded ? null : prospect.id)
                  }
                  className="w-full text-left flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant flex items-center justify-center text-light-primary dark:text-dark-primary shrink-0">
                      <Icon name="person" size={18} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                        Marketing
                      </span>
                      <span className="font-label text-label-lg text-light-on-surface dark:text-dark-on-surface truncate">
                        {prospect.marketingName}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`px-2.5 py-1 rounded-full font-label text-label-sm whitespace-nowrap ${getBadgeProps(
                        prospect.status
                      )}`}
                    >
                      {prospect.status === 'Baru' ? 'Belum Dihubungi' : prospect.status}
                    </span>
                    <Icon
                      name={isExpanded ? 'expand_less' : 'expand_more'}
                      size={20}
                      className="text-light-on-surface-variant dark:text-dark-on-surface-variant"
                    />
                  </div>
                </button>

                {/* Raised Customer Detail Card */}
                <div className="rounded-md bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant divide-y divide-light-outline-variant dark:divide-dark-outline-variant overflow-hidden">
                  <div className="px-3 py-2 flex items-center justify-between gap-2">
                    <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                      Nasabah
                    </span>
                    <span className="font-label text-label-lg text-light-on-surface dark:text-dark-on-surface truncate">
                      {prospect.customerName}
                    </span>
                  </div>
                  <div className="px-3 py-2 flex items-center justify-between gap-2">
                    <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                      No. Kontrak
                    </span>
                    <span className="font-mono text-mono-sm text-light-on-surface dark:text-dark-on-surface tabular-nums">
                      {prospect.contractNumber}
                    </span>
                  </div>
                  <div className="px-3 py-2 flex items-center justify-between gap-2">
                    <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                      Unit Motor
                    </span>
                    <span className="font-label text-label-md text-light-on-surface dark:text-dark-on-surface truncate">
                      {prospect.unitName}
                    </span>
                  </div>
                  <div className="px-3 py-2 flex items-center justify-between gap-2">
                    <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                      Nopol
                    </span>
                    <span className="font-mono text-mono-sm text-light-on-surface dark:text-dark-on-surface">
                      {prospect.plateNumber}
                    </span>
                  </div>
                  <div className="px-3 py-2 flex items-center justify-between gap-2">
                    <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                      Grade
                    </span>
                    <span className="font-label text-label-md text-success dark:text-dark-success">
                      {prospect.grade}
                    </span>
                  </div>
                  <div className="px-3 py-2 flex items-center justify-between gap-2">
                    <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                      Sisa Tenor
                    </span>
                    <span className="font-label text-label-md text-light-primary dark:text-dark-primary tabular-nums">
                      {prospect.remainingTenor} bulan
                    </span>
                  </div>
                  {isExpanded && prospect.notes && (
                    <div className="px-3 py-2 flex items-center justify-between gap-2 bg-light-surface-container dark:bg-dark-surface-container-high">
                      <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                        Catatan
                      </span>
                      <span className="font-body text-body-sm text-light-on-surface dark:text-dark-on-surface text-right">
                        {prospect.notes}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Row */}
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${prospect.phone.replace(/-/g, '')}`}
                    onClick={() => onToast(`Menghubungi ${prospect.phone}`)}
                    className="flex-1 min-h-[42px] rounded-md bg-light-surface-container-lowest dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-sm px-2.5 py-2 flex items-center justify-center gap-1.5 font-mono text-label-sm text-light-on-surface dark:text-dark-on-surface hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container-high tactile-press truncate"
                  >
                    <Icon
                      name="call"
                      size={16}
                      className="text-light-primary dark:text-dark-primary shrink-0"
                    />
                    <span className="truncate">{prospect.phone}</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      const waNum = prospect.phone
                        .replace(/-/g, '')
                        .replace(/^0/, '62');
                      const msg = encodeURIComponent(
                        `Halo ${prospect.customerName}, kami dari SmartTaksasi menawarkan promo RO/Top Up khusus nasabah ${prospect.grade} untuk unit ${prospect.unitName}.`
                      );
                      window.open(`https://wa.me/${waNum}?text=${msg}`, '_blank', 'noopener');
                      onToast(`Membuka WhatsApp ${prospect.customerName}`);
                    }}
                    className="min-h-[42px] rounded-md bg-success border border-success border-b-2 shadow-sm px-3 py-2 flex items-center justify-center gap-1 font-label text-label-md text-on-success tactile-press shrink-0"
                  >
                    <Icon name="chat" size={16} />
                    <span>WA</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openGformSheet(prospect)}
                    className="min-h-[42px] rounded-md bg-light-primary dark:bg-dark-primary border border-light-primary dark:border-dark-primary border-b-2 shadow-sm px-3 py-2 flex items-center justify-center gap-1 font-label text-label-md text-light-on-primary dark:text-dark-on-primary tactile-press shrink-0"
                  >
                    <Icon name="assignment" size={16} />
                    <span>Gform</span>
                  </button>
                </div>
              </motion.article>
            );
          })
        )}
      </section>

      {/* Marketing Selector Sheet */}
      <BottomSheet
        open={marketingSheetOpen}
        onClose={() => setMarketingSheetOpen(false)}
        title="Pilih Marketing"
        subtitle="Filter prospek Gform RO berdasarkan marketing"
      >
        <div className="flex flex-col gap-2">
          {marketingNames.map((name) => {
            const active = selectedMarketing === name;
            return (
              <button
                key={name}
                type="button"
                onClick={() => {
                  setSelectedMarketing(name);
                  setMarketingSheetOpen(false);
                }}
                className={`w-full min-h-[44px] rounded-md px-3.5 py-2.5 flex items-center justify-between border border-b-2 tactile-press ${
                  active
                    ? 'bg-light-secondary-container dark:bg-dark-secondary-container border-light-primary dark:border-dark-primary text-light-on-secondary-container dark:text-dark-on-secondary-container'
                    : 'bg-light-surface-container-low dark:bg-dark-surface-container border-light-outline-variant dark:border-dark-outline-variant text-light-on-surface dark:text-dark-on-surface'
                }`}
              >
                <span className="font-label text-label-lg">{name}</span>
                {active && <Icon name="check_circle" size={18} filled />}
              </button>
            );
          })}
        </div>
      </BottomSheet>

      {/* Gform Follow-up Bottom Sheet */}
      <BottomSheet
        open={Boolean(activeProspect)}
        onClose={() => setActiveProspect(null)}
        title={`Gform · ${activeProspect?.customerName || ''}`}
        subtitle={
          activeProspect
            ? `${activeProspect.unitName} · Grade ${activeProspect.grade}`
            : ''
        }
      >
        {activeProspect && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-label text-label-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
                Catatan Follow-Up Gform
              </label>
              <textarea
                rows={3}
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="Catat respon nasabah, estimasi pencairan, atau jadwal survey..."
                className="w-full rounded-md bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant p-3 font-body text-body-md text-light-on-surface dark:text-dark-on-surface focus:border-light-primary dark:focus:border-dark-primary focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <span className="font-label text-label-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
                Pilih Tahap Pipeline
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(['Baru', 'Kontak', 'Minat', 'Tolak', 'RO'] as GformStatus[]).map(
                  (st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleSaveFollowUp(st)}
                      className={`min-h-[44px] rounded-md border border-b-2 px-3 py-2 font-label text-label-md tactile-press ${
                        activeProspect.status === st
                          ? 'bg-light-primary dark:bg-dark-primary border-light-primary dark:border-dark-primary text-light-on-primary dark:text-dark-on-primary'
                          : 'bg-light-surface-container-lowest dark:bg-dark-surface-container border-light-outline-variant dark:border-dark-outline-variant text-light-on-surface dark:text-dark-on-surface'
                      }`}
                    >
                      {st}
                    </button>
                  )
                )}
              </div>
            </div>

            {onStartTaksasi && (
              <button
                type="button"
                onClick={() => {
                  const target = activeProspect;
                  setActiveProspect(null);
                  onStartTaksasi(target);
                }}
                className="w-full min-h-[44px] rounded-md bg-light-secondary-container dark:bg-dark-secondary-container border border-light-primary dark:border-dark-primary border-b-2 px-4 py-2.5 flex items-center justify-center gap-2 font-label text-label-lg text-light-on-secondary-container dark:text-dark-on-secondary-container tactile-press"
              >
                <Icon name="calculate" size={18} />
                <span>Simulasikan Taksasi RO</span>
              </button>
            )}
          </div>
        )}
      </BottomSheet>
    </main>
  );
};
