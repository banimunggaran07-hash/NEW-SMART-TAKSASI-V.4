import React, { useMemo, useState } from 'react';
import { calculateInstallment, formatIDR } from '../../data/mockData';
import { BrandLogo, ContextualHeader, Icon } from '../ui/Primitives';

interface PriceListScreenProps {
  onBack: () => void;
  onToast: (msg: string) => void;
}

const TENOR_ROWS: (6 | 8 | 12 | 18 | 24 | 36)[] = [6, 8, 12, 18, 24, 36];

export const PriceListScreen: React.FC<PriceListScreenProps> = ({
  onBack,
  onToast,
}) => {
  const [tier, setTier] = useState<'Reguler' | 'Awda'>('Reguler');
  const [amountInput, setAmountInput] = useState('3000000');
  const [activeAmount, setActiveAmount] = useState(3000000);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Number(amountInput.replace(/[^\d]/g, '')) || 3000000;
    setActiveAmount(Math.max(500000, parsed));
    onToast(`Price List ${tier} diperbarui`);
  };

  const rows = useMemo(() => {
    // Exact reference numbers when activeAmount === 3000000 && tier === 'Reguler'
    const refReguler3M: Record<number, number> = {
      6: 821000,
      8: 638000,
      12: 455000,
      18: 335000,
      24: 277000,
      36: 221000,
    };

    return TENOR_ROWS.map((t) => ({
      tenor: t,
      installment:
        activeAmount === 3000000 && tier === 'Reguler'
          ? refReguler3M[t]
          : calculateInstallment(activeAmount, t, tier),
    }));
  }, [activeAmount, tier]);

  const handleShareWa = () => {
    const lines = rows
      .map((r) => `• ${r.tenor} bln: ${formatIDR(r.installment)}/bln`)
      .join('\n');
    const msg = encodeURIComponent(
      `*PRICE LIST ANGSURAN · ${tier.toUpperCase()}*\nDana Cair: ${formatIDR(activeAmount)}\n\n${lines}\n\n_Angsuran dapat berubah sesuai survey & ketentuan berlaku._`
    );
    window.open(`https://wa.me/?text=${msg}`, '_blank', 'noopener');
    onToast('Membagikan Price List ke WhatsApp');
  };

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <ContextualHeader
        title="Price List Angsuran"
        subtitle="Reguler & Awda · bagikan ke WhatsApp"
        onBack={onBack}
      />

      <main className="px-4 py-4 pb-10 flex flex-col gap-4 max-w-3xl w-full mx-auto">
        {/* Tier Segmented Buttons */}
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { id: 'Reguler' as const, icon: 'check_circle' },
            { id: 'Awda' as const, icon: 'verified' },
          ].map((item) => {
            const active = tier === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTier(item.id)}
                className={`min-h-[44px] rounded-md border border-b-2 shadow-sm px-3 py-2 flex items-center justify-center gap-2 font-label text-label-lg tactile-press ${
                  active
                    ? 'bg-light-primary dark:bg-dark-primary border-light-primary dark:border-dark-primary text-light-on-primary dark:text-dark-on-primary'
                    : 'bg-light-surface-container-lowest dark:bg-dark-surface-container-low border-light-outline-variant dark:border-dark-outline-variant text-light-on-surface dark:text-dark-on-surface'
                }`}
              >
                <Icon name={item.icon} size={18} filled={active} />
                <span>{item.id}</span>
              </button>
            );
          })}
        </div>

        {/* Nominal Pinjaman Form */}
        <form
          onSubmit={handleSearch}
          className="rounded-lg bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-md p-3.5 flex flex-col gap-2.5"
        >
          <span className="font-label text-label-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
            Nominal Pinjaman
          </span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step={250000}
              min={500000}
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              className="flex-1 min-h-[44px] rounded-md bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant px-3 py-2 font-mono text-body-md text-light-on-surface dark:text-dark-on-surface focus:border-light-primary dark:focus:border-dark-primary focus:outline-none"
            />
            <button
              type="submit"
              className="min-h-[44px] rounded-md bg-light-primary dark:bg-dark-primary border border-light-primary dark:border-dark-primary border-b-2 px-5 py-2 font-label text-label-lg text-light-on-primary dark:text-dark-on-primary tactile-press shrink-0"
            >
              Cari
            </button>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
            {[2000000, 3000000, 5000000, 7500000, 10000000].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setAmountInput(String(preset));
                  setActiveAmount(preset);
                }}
                className={`px-3 py-1 rounded-full border font-mono text-label-sm whitespace-nowrap shrink-0 tactile-press ${
                  activeAmount === preset
                    ? 'bg-light-secondary-container dark:bg-dark-secondary-container border-light-primary dark:border-dark-primary text-light-on-secondary-container dark:text-dark-on-secondary-container'
                    : 'bg-light-surface-container-low dark:bg-dark-surface-container border-light-outline-variant dark:border-dark-outline-variant text-light-on-surface-variant dark:text-dark-on-surface-variant'
                }`}
              >
                {formatIDR(preset)}
              </button>
            ))}
          </div>
        </form>

        {/* Shareable Price List Card */}
        <article className="rounded-lg bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-md overflow-hidden">
          <header className="bg-light-primary dark:bg-dark-primary-container px-4 py-3.5 flex items-center justify-between gap-3 text-light-on-primary">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-md bg-white p-0.5 shrink-0 overflow-hidden">
                <BrandLogo />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-label text-label-sm text-light-on-primary-container">
                  DANA CAIR · {tier.toUpperCase()}
                </span>
                <span className="font-headline text-headline-md tabular-nums">
                  {formatIDR(activeAmount)}
                </span>
              </div>
            </div>
            <span className="rounded-full bg-light-primary-container border border-light-inverse-primary/50 px-2.5 py-1 font-label text-label-sm shrink-0">
              PRICE LIST
            </span>
          </header>

          <div className="divide-y divide-light-outline-variant dark:divide-dark-outline-variant">
            <div className="px-4 py-2 bg-light-surface-container dark:bg-dark-surface-container flex items-center justify-between">
              <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                TENOR
              </span>
              <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                ANGSURAN / BULAN
              </span>
            </div>
            {rows.map((row) => (
              <div
                key={row.tenor}
                className="px-4 py-2.5 flex items-center justify-between"
              >
                <span className="font-label text-label-lg text-light-on-surface dark:text-dark-on-surface tabular-nums">
                  {row.tenor} bln
                </span>
                <span className="font-mono text-title-sm text-light-primary dark:text-dark-primary tabular-nums">
                  {formatIDR(row.installment)}
                </span>
              </div>
            ))}
          </div>

          <footer className="px-4 py-3 bg-light-surface-container-low dark:bg-dark-surface-container border-t border-light-outline-variant dark:border-dark-outline-variant">
            <p className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant text-center">
              Angsuran dapat berubah sesuai survey dan ketentuan yang berlaku.
            </p>
          </footer>
        </article>

        <button
          type="button"
          onClick={handleShareWa}
          className="w-full min-h-[48px] rounded-md bg-success border border-success border-b-2 shadow-md px-4 py-3 flex items-center justify-center gap-2 font-label text-label-lg text-on-success tactile-press"
        >
          <Icon name="share" size={18} />
          <span>Bagikan ke WhatsApp (JPG / Teks)</span>
        </button>
      </main>
    </div>
  );
};
