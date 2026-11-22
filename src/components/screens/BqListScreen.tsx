import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { formatIDR } from '../../data/mockData';
import { BqContract, BqStatus } from '../../types';
import { BottomSheet, Icon } from '../ui/Primitives';

interface BqListScreenProps {
  contracts: BqContract[];
  initialFilter?: string;
  onUpdateStatus: (id: string, status: BqStatus, notes?: string) => void;
  onToast: (msg: string) => void;
  onStartTaksasi?: (contract: BqContract) => void;
}

export const BqListScreen: React.FC<BqListScreenProps> = ({
  contracts,
  initialFilter,
  onUpdateStatus,
  onToast,
  onStartTaksasi,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Semua' | BqStatus>(
    initialFilter === 'Sudah Bayar' ||
      initialFilter === 'Belum Bayar' ||
      initialFilter === 'Janji Bayar'
      ? initialFilter
      : 'Semua'
  );
  const [selectedMarketing, setSelectedMarketing] = useState<string>('Semua marketing');
  const [marketingSheetOpen, setMarketingSheetOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detailContract, setDetailContract] = useState<BqContract | null>(null);
  const [noteInput, setNoteInput] = useState('');

  const marketingNames = useMemo(() => {
    const names = Array.from(new Set(contracts.map((c) => c.marketingName)));
    return ['Semua marketing', ...names];
  }, [contracts]);

  const liveBelum = 101 + contracts.filter((c) => c.status === 'Belum Bayar').length;
  const liveSudah = 143 + contracts.filter((c) => c.status === 'Sudah Bayar').length;
  const liveJanji = contracts.filter((c) => c.status === 'Janji Bayar').length;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return contracts.filter((c) => {
      if (statusFilter !== 'Semua' && c.status !== statusFilter) return false;
      if (
        selectedMarketing !== 'Semua marketing' &&
        c.marketingName !== selectedMarketing
      )
        return false;
      if (!q) return true;
      return (
        c.customerName.toLowerCase().includes(q) ||
        c.contractNumber.toLowerCase().includes(q) ||
        c.plateNumber.toLowerCase().includes(q) ||
        c.unitName.toLowerCase().includes(q) ||
        c.marketingName.toLowerCase().includes(q)
      );
    });
  }, [contracts, search, statusFilter, selectedMarketing]);

  const openDetail = (c: BqContract) => {
    setDetailContract(c);
    setNoteInput(c.notes || '');
  };

  const handleStatusSave = (newStatus: BqStatus) => {
    if (!detailContract) return;
    onUpdateStatus(detailContract.id, newStatus, noteInput);
    onToast(`Status ${detailContract.customerName} diubah ke ${newStatus}`);
    setDetailContract(null);
  };

  const getStatusBadgeStyle = (status: BqStatus) => {
    if (status === 'Sudah Bayar') {
      return 'bg-success-container dark:bg-dark-success-container text-on-success-container dark:text-dark-on-success-container';
    }
    if (status === 'Janji Bayar') {
      return 'bg-warning-container dark:bg-dark-warning-container text-on-warning-container dark:text-dark-on-warning-container';
    }
    return 'bg-light-error-container dark:bg-dark-error-container text-light-on-error-container dark:text-dark-on-error-container';
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
            placeholder="Cari nama nasabah, no. kontrak, nopol..."
            className="w-full min-h-[44px] rounded-lg bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-sm pl-10 pr-4 py-2 font-body text-body-md text-light-on-surface dark:text-dark-on-surface placeholder:text-light-on-surface-variant dark:placeholder:text-dark-on-surface-variant focus:border-light-primary dark:focus:border-dark-primary focus:outline-none"
          />
        </div>

        {/* Raised Filter Option Chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: 'Semua' as const, label: 'Semua' },
            { id: 'Belum Bayar' as const, label: `Belum (${liveBelum})` },
            { id: 'Sudah Bayar' as const, label: `Sudah (${liveSudah})` },
            { id: 'Janji Bayar' as const, label: `Janji (${liveJanji})` },
          ].map((chip) => {
            const active = statusFilter === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => setStatusFilter(chip.id)}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-full border border-b-2 shadow-sm font-label text-label-md whitespace-nowrap shrink-0 tactile-press ${
                  active
                    ? 'bg-light-primary dark:bg-dark-primary border-light-primary dark:border-dark-primary text-light-on-primary dark:text-dark-on-primary'
                    : 'bg-light-surface-container-lowest dark:bg-dark-surface-container-low border-light-outline-variant dark:border-dark-outline-variant text-light-on-surface-variant dark:text-dark-on-surface-variant hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container'
                }`}
              >
                {chip.label}
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

      {/* Contract List */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.length === 0 ? (
          <div className="col-span-full rounded-lg bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant p-8 text-center flex flex-col items-center gap-2">
            <Icon
              name="search_off"
              size={32}
              className="text-light-on-surface-variant dark:text-dark-on-surface-variant"
            />
            <p className="font-title text-title-sm text-light-on-surface dark:text-dark-on-surface">
              Tidak ada kontrak ditemukan
            </p>
            <p className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
              Coba ubah kata kunci pencarian atau filter status.
            </p>
          </div>
        ) : (
          filtered.map((contract) => {
            const isExpanded = expandedId === contract.id;
            return (
              <motion.article
                layout
                key={contract.id}
                className="rounded-lg bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-md p-3.5 flex flex-col gap-3"
              >
                {/* Header Row */}
                <button
                  type="button"
                  onClick={() =>
                    setExpandedId(isExpanded ? null : contract.id)
                  }
                  className="w-full text-left flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant flex items-center justify-center text-light-primary dark:text-dark-primary shrink-0">
                      <Icon name="person" size={18} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-mono text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant truncate">
                        CS ID · {contract.csId}
                      </span>
                      <span className="font-label text-label-lg text-light-on-surface dark:text-dark-on-surface truncate">
                        {contract.marketingName}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`px-2.5 py-1 rounded-full font-label text-label-sm whitespace-nowrap ${getStatusBadgeStyle(
                        contract.status
                      )}`}
                    >
                      {contract.status}
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
                      {contract.customerName}
                    </span>
                  </div>
                  <div className="px-3 py-2 flex items-center justify-between gap-2">
                    <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                      No. Kontrak
                    </span>
                    <span className="font-mono text-mono-sm text-light-on-surface dark:text-dark-on-surface tabular-nums">
                      {contract.contractNumber}
                    </span>
                  </div>
                  <div className="px-3 py-2 flex items-center justify-between gap-2">
                    <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                      Jatuh Tempo · Angs
                    </span>
                    <span className="font-label text-label-md text-light-on-surface dark:text-dark-on-surface tabular-nums">
                      {contract.dueDate} · ke-{contract.installmentNumber}
                    </span>
                  </div>
                  <div className="px-3 py-2 flex items-center justify-between gap-2">
                    <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                      Nominal Angsuran
                    </span>
                    <span className="font-mono text-mono-sm text-light-primary dark:text-dark-primary tabular-nums">
                      {formatIDR(contract.installmentAmount)}
                    </span>
                  </div>
                  <div className="px-3 py-2 flex items-center justify-between gap-2">
                    <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                      Unit · Nopol
                    </span>
                    <span className="font-label text-label-md text-light-on-surface dark:text-dark-on-surface tabular-nums truncate">
                      {contract.unitName} · {contract.plateNumber}
                    </span>
                  </div>
                  <div className="px-3 py-2 flex items-center justify-between gap-2">
                    <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                      Keterlambatan
                    </span>
                    <span className="font-label text-label-md text-light-error dark:text-dark-error tabular-nums">
                      {contract.status === 'Sudah Bayar'
                        ? 'Lunas'
                        : `Telat ${contract.daysLate} hari`}
                    </span>
                  </div>
                  {isExpanded && contract.notes && (
                    <div className="px-3 py-2 flex items-center justify-between gap-2 bg-light-surface-container dark:bg-dark-surface-container-high">
                      <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                        Catatan
                      </span>
                      <span className="font-body text-body-sm text-light-on-surface dark:text-dark-on-surface text-right">
                        {contract.notes}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Row */}
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${contract.phone.replace(/-/g, '')}`}
                    onClick={() => onToast(`Menghubungi ${contract.phone}`)}
                    className="flex-1 min-h-[42px] rounded-md bg-light-surface-container-lowest dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-sm px-2.5 py-2 flex items-center justify-center gap-1.5 font-mono text-label-sm text-light-on-surface dark:text-dark-on-surface hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container-high tactile-press truncate"
                  >
                    <Icon
                      name="call"
                      size={16}
                      className="text-light-primary dark:text-dark-primary shrink-0"
                    />
                    <span className="truncate">{contract.phone}</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      const waNum = contract.phone
                        .replace(/-/g, '')
                        .replace(/^0/, '62');
                      const msg = encodeURIComponent(
                        `Halo ${contract.customerName}, pengingat angsuran ke-${contract.installmentNumber} kontrak ${contract.contractNumber} (${contract.unitName}) sebesar ${formatIDR(contract.installmentAmount)}.`
                      );
                      window.open(`https://wa.me/${waNum}?text=${msg}`, '_blank', 'noopener');
                      onToast(`Membuka WhatsApp ${contract.customerName}`);
                    }}
                    className="min-h-[42px] rounded-md bg-success border border-success border-b-2 shadow-sm px-3 py-2 flex items-center justify-center gap-1 font-label text-label-md text-on-success tactile-press shrink-0"
                  >
                    <Icon name="chat" size={16} />
                    <span>WA</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openDetail(contract)}
                    className="min-h-[42px] rounded-md bg-light-primary dark:bg-dark-primary border border-light-primary dark:border-dark-primary border-b-2 shadow-sm px-3 py-2 flex items-center justify-center font-label text-label-md text-light-on-primary dark:text-dark-on-primary tactile-press shrink-0"
                  >
                    Detail
                  </button>
                </div>
              </motion.article>
            );
          })
        )}
      </section>

      {/* Marketing Selector Bottom Sheet */}
      <BottomSheet
        open={marketingSheetOpen}
        onClose={() => setMarketingSheetOpen(false)}
        title="Pilih Marketing"
        subtitle="Filter kontrak berdasarkan nama marketing"
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

      {/* Contract Detail & Update Status Sheet */}
      <BottomSheet
        open={Boolean(detailContract)}
        onClose={() => setDetailContract(null)}
        title={detailContract?.customerName || 'Detail Kontrak'}
        subtitle={
          detailContract
            ? `${detailContract.contractNumber} · ${detailContract.unitName}`
            : ''
        }
      >
        {detailContract && (
          <div className="flex flex-col gap-4">
            <div className="rounded-md bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant p-3 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                  Angsuran ke-{detailContract.installmentNumber}
                </span>
                <span className="font-headline text-headline-sm text-light-primary dark:text-dark-primary tabular-nums">
                  {formatIDR(detailContract.installmentAmount)}
                </span>
              </div>
              <span
                className={`px-3 py-1 rounded-full font-label text-label-sm ${getStatusBadgeStyle(
                  detailContract.status
                )}`}
              >
                {detailContract.status}
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-label text-label-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
                Catatan Penagihan / Janji Bayar
              </label>
              <textarea
                rows={3}
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="Tulis hasil kunjungan atau tanggal janji bayar..."
                className="w-full rounded-md bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant p-3 font-body text-body-md text-light-on-surface dark:text-dark-on-surface focus:border-light-primary dark:focus:border-dark-primary focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <span className="font-label text-label-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
                Perbarui Status BQ
              </span>
              <div className="grid grid-cols-3 gap-2">
                {(['Sudah Bayar', 'Janji Bayar', 'Belum Bayar'] as BqStatus[]).map(
                  (st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleStatusSave(st)}
                      className={`min-h-[44px] rounded-md border border-b-2 px-2 py-2 font-label text-label-md tactile-press ${
                        detailContract.status === st
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
                  const target = detailContract;
                  setDetailContract(null);
                  onStartTaksasi(target);
                }}
                className="w-full min-h-[44px] rounded-md bg-light-secondary-container dark:bg-dark-secondary-container border border-light-primary dark:border-dark-primary border-b-2 px-4 py-2.5 flex items-center justify-center gap-2 font-label text-label-lg text-light-on-secondary-container dark:text-dark-on-secondary-container tactile-press"
              >
                <Icon name="calculate" size={18} />
                <span>Hitung Simulasi Top Up Unit Ini</span>
              </button>
            )}
          </div>
        )}
      </BottomSheet>
    </main>
  );
};
