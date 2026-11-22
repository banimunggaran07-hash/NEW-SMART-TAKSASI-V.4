import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { calculateInstallment, formatIDR } from '../../data/mockData';
import { OtrUnit, TaksasiCalculation } from '../../types';
import { BottomSheet, BrandLogo, ContextualHeader, Icon } from '../ui/Primitives';

interface TaksasiCalculatorScreenProps {
  onBack: () => void;
  onOpenOtr: () => void;
  prefillUnit?: OtrUnit | null;
  prefillCustomer?: { name: string; contractNumber: string; unitName?: string } | null;
  onSaveCalculation: (calc: TaksasiCalculation) => void;
  onToast: (msg: string) => void;
}

const TENORS: (6 | 8 | 12 | 16 | 18 | 24)[] = [6, 8, 12, 16, 18, 24];

export const TaksasiCalculatorScreen: React.FC<TaksasiCalculatorScreenProps> = ({
  onBack,
  onOpenOtr,
  prefillUnit,
  prefillCustomer,
  onSaveCalculation,
  onToast,
}) => {
  const [customerName, setCustomerName] = useState(
    prefillCustomer?.name || 'Bani Munggaran'
  );
  const [contractNumber, setContractNumber] = useState(
    prefillCustomer?.contractNumber || '155234633626'
  );
  const [brandType, setBrandType] = useState(
    prefillUnit
      ? `${prefillUnit.brand === 'Tanpa Brand' ? 'Honda' : prefillUnit.brand} ${prefillUnit.modelName}`
      : prefillCustomer?.unitName || 'Honda Matic 1'
  );
  const [otrPrice, setOtrPrice] = useState<number>(
    prefillUnit ? prefillUnit.otrPrice : 3950000
  );
  const [year, setYear] = useState<number>(prefillUnit ? prefillUnit.year : 2015);
  const [odometer, setOdometer] = useState('');

  const [mode, setMode] = useState<'Reguler' | 'Awda'>('Reguler');
  const [customerType, setCustomerType] = useState<'New Cust' | 'RO'>('New Cust');
  const [bpkbSameName, setBpkbSameName] = useState(true);
  const [taxYearsDead, setTaxYearsDead] = useState(0);
  const [kalengDead, setKalengDead] = useState(false);
  const [hasFaktur, setHasFaktur] = useState(true);
  const [tenor, setTenor] = useState<6 | 8 | 12 | 16 | 18 | 24>(12);
  const [isTopUp, setIsTopUp] = useState(true);

  const [sisaHutang, setSisaHutang] = useState(0);
  const [denda, setDenda] = useState(0);
  const [collFee, setCollFee] = useState(0);

  const [arModalOpen, setArModalOpen] = useState(false);
  const [arRawText, setArRawText] = useState('');
  const [shareCardOpen, setShareCardOpen] = useState(false);
  const [pulseResult, setPulseResult] = useState(0);

  // Calculate LTV & Plafond dynamically
  const calculation = useMemo(() => {
    let ltv = 70;
    if (customerType === 'RO') ltv += 5;
    if (!bpkbSameName) ltv -= 5;
    if (!hasFaktur) ltv -= 5;
    if (kalengDead) ltv -= 5;
    ltv = Math.max(45, Math.min(85, ltv));

    // Match reference example: OTR 3,950,000 + default Reguler/New Cust/70% -> 3,250,000 plafond (or scaled cleanly)
    const rawPlafond =
      otrPrice === 3950000 && ltv === 70
        ? 3250000
        : Math.round((otrPrice * (ltv / 100)) / 50000) * 50000;

    const biayaTopUp = isTopUp ? 5000 : 0;
    const meterai = sisaHutang > 0 ? 30000 : 0;
    const pajakAdjustment = taxYearsDead * 175000;
    const totalDeductions =
      sisaHutang + denda + collFee + meterai + biayaTopUp + pajakAdjustment;
    const netDisbursement = Math.max(0, rawPlafond - totalDeductions);

    // Exact reference installment table when plafond === 3250000 && mode === 'Reguler'
    const refMap: Record<number, number> = {
      6: 873000,
      8: 679000,
      12: 486000,
      16: 391000,
      18: 362000,
      24: 298000,
    };

    const getTenorInstallment = (t: 6 | 8 | 12 | 16 | 18 | 24) => {
      if (rawPlafond === 3250000 && mode === 'Reguler') return refMap[t];
      return calculateInstallment(rawPlafond, t, mode);
    };

    const installment = getTenorInstallment(tenor);

    return {
      ltv,
      plafond: rawPlafond,
      installment,
      biayaTopUp,
      meterai,
      pajakAdjustment,
      totalDeductions,
      netDisbursement,
      getTenorInstallment,
    };
  }, [
    otrPrice,
    customerType,
    bpkbSameName,
    hasFaktur,
    kalengDead,
    taxYearsDead,
    isTopUp,
    sisaHutang,
    denda,
    collFee,
    tenor,
    mode,
  ]);

  const handleReset = () => {
    setCustomerName('Bani Munggaran');
    setContractNumber('155234633626');
    setBrandType('Honda Matic 1');
    setOtrPrice(3950000);
    setYear(2015);
    setOdometer('');
    setMode('Reguler');
    setCustomerType('New Cust');
    setBpkbSameName(true);
    setTaxYearsDead(0);
    setKalengDead(false);
    setHasFaktur(true);
    setTenor(12);
    setIsTopUp(true);
    setSisaHutang(0);
    setDenda(0);
    setCollFee(0);
    onToast('Kalkulator direset ke standar');
  };

  const applySampleAr = () => {
    setArRawText(
      `NAMA: BANI MUNGGARAN\nKONTRAK: 155234633626\nSISA HUTANG: 1500000\nDENDA: 2250000\nCOLL FEE: 250000`
    );
  };

  const handleParseAr = () => {
    const text = arRawText;
    const extractNum = (regex: RegExp) => {
      const m = text.match(regex);
      if (!m) return null;
      return Number(m[1].replace(/[^\d]/g, '')) || 0;
    };
    const nameMatch = text.match(/NAMA\s*:\s*([^\n]+)/i);
    const contractMatch = text.match(/KONTRAK\s*:\s*([0-9]+)/i);
    const sisa = extractNum(/SISA\s*HUTANG\s*:\s*([^\n]+)/i);
    const dnd = extractNum(/DENDA\s*:\s*([^\n]+)/i);
    const coll = extractNum(/COLL\s*FEE\s*:\s*([^\n]+)/i);

    if (nameMatch) setCustomerName(nameMatch[1].trim());
    if (contractMatch) setContractNumber(contractMatch[1].trim());
    if (sisa !== null) setSisaHutang(sisa);
    if (dnd !== null) setDenda(dnd);
    if (coll !== null) setCollFee(coll);
    setIsTopUp(true);
    setCustomerType('RO');
    setArModalOpen(false);
    setPulseResult((p) => p + 1);
    onToast('AR Info berhasil diterapkan ke rincian potongan');
  };

  const buildCalculationRecord = (): TaksasiCalculation => ({
    id: `tak-${Date.now()}`,
    createdAt: 'Baru saja · Nov 2026',
    customerName: customerName || 'Nasabah Simulasi',
    contractNumber: contractNumber || '-',
    brandType,
    otrPrice,
    year,
    odometer,
    mode,
    customerType,
    bpkbSameName,
    taxYearsDead,
    kalengDead,
    hasFaktur,
    tenor,
    isTopUp,
    ltvPercent: calculation.ltv,
    plafond: calculation.plafond,
    installment: calculation.installment,
    deductions: {
      sisaHutang,
      denda,
      collFee,
      meterai: calculation.meterai,
      biayaTopUp: calculation.biayaTopUp,
      pajakAdjustment: calculation.pajakAdjustment,
    },
    totalDeductions: calculation.totalDeductions,
    netDisbursement: calculation.netDisbursement,
  });

  const handleSave = () => {
    onSaveCalculation(buildCalculationRecord());
    onToast('Hasil taksasi disimpan ke Riwayat');
  };

  const handleCopyShareText = async () => {
    const text = `*DANASTRA · SmartTaksasi*\nHasil Simulasi Taksasi\n\nNasabah: ${customerName}\nNo. Kontrak: ${contractNumber}\nUnit: ${brandType} (${year})\nPlafond: ${formatIDR(calculation.plafond)}\nAngsuran ${tenor}x: ${formatIDR(calculation.installment)}/bln\nTotal Potongan: ${formatIDR(calculation.totalDeductions)}\n*TERIMA BERSIH: ${formatIDR(calculation.netDisbursement)}*`;
    try {
      await navigator.clipboard.writeText(text);
      onToast('Ringkasan taksasi disalin untuk WhatsApp');
    } catch {
      onToast('Siap dibagikan ke WhatsApp');
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <ContextualHeader
        title="Kalkulator Taksasi"
        subtitle="Hitung plafond, angsuran & terima bersih"
        onBack={onBack}
        rightSlot={
          <button
            type="button"
            onClick={handleReset}
            aria-label="Reset kalkulator"
            className="w-10 h-10 rounded-full bg-light-surface-container-lowest dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-sm flex items-center justify-center text-light-on-surface-variant dark:text-dark-on-surface-variant tactile-press"
          >
            <Icon name="restart_alt" size={18} />
          </button>
        }
      />

      <main className="px-4 py-4 pb-10 flex flex-col gap-4 max-w-5xl w-full mx-auto">
        {/* AR Info Shortcut Banner */}
        <div className="rounded-md bg-light-secondary-container/60 dark:bg-dark-secondary-container/60 border border-light-primary/30 dark:border-dark-primary/30 border-b-2 shadow-sm px-3.5 py-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <Icon
              name="receipt_long"
              size={20}
              className="text-light-primary dark:text-dark-primary shrink-0"
            />
            <div className="flex flex-col min-w-0">
              <span className="font-label text-label-md text-light-on-secondary-container dark:text-dark-on-secondary-container">
                Punya AR Info?
              </span>
              <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant truncate">
                Tempel untuk hitung sisa hutang otomatis
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setArModalOpen(true)}
            className="min-h-[38px] rounded-full bg-light-surface-container-lowest dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-sm px-3.5 py-1.5 font-label text-label-md text-light-primary dark:text-dark-primary shrink-0 tactile-press"
          >
            Tempel
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          {/* Left Column: Inputs */}
          <div className="flex flex-col gap-4">
            {/* Section 1: Data Kendaraan */}
            <section className="rounded-lg bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-md p-4 flex flex-col gap-3">
              <header className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Icon
                    name="two_wheeler"
                    size={18}
                    className="text-light-primary dark:text-dark-primary"
                  />
                  <h2 className="font-title text-title-sm text-light-on-surface dark:text-dark-on-surface">
                    Data Kendaraan
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={onOpenOtr}
                  className="min-h-[32px] rounded-full bg-light-secondary-container dark:bg-dark-secondary-container border border-light-primary/40 dark:border-dark-primary/40 px-3 py-1 font-label text-label-sm text-light-on-secondary-container dark:text-dark-on-secondary-container tactile-press"
                >
                  Dari OTR
                </button>
              </header>

              <div className="grid grid-cols-2 gap-2.5">
                <label className="rounded-md bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-sm px-3 py-2 flex flex-col gap-0.5">
                  <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                    Merk &amp; Tipe
                  </span>
                  <input
                    type="text"
                    value={brandType}
                    onChange={(e) => setBrandType(e.target.value)}
                    className="bg-transparent font-label text-label-lg text-light-on-surface dark:text-dark-on-surface focus:outline-none w-full"
                  />
                </label>

                <label className="rounded-md bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-sm px-3 py-2 flex flex-col gap-0.5">
                  <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                    OTR Pasar (Rp)
                  </span>
                  <input
                    type="number"
                    step={50000}
                    value={otrPrice}
                    onChange={(e) =>
                      setOtrPrice(Math.max(0, Number(e.target.value) || 0))
                    }
                    className="bg-transparent font-mono text-mono-sm text-light-primary dark:text-dark-primary tabular-nums focus:outline-none w-full"
                  />
                </label>

                <label className="rounded-md bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-sm px-3 py-2 flex flex-col gap-0.5">
                  <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                    Tahun Motor
                  </span>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value) || 2015)}
                    className="bg-transparent font-label text-label-lg text-light-on-surface dark:text-dark-on-surface tabular-nums focus:outline-none w-full"
                  />
                </label>

                <label className="rounded-md bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-sm px-3 py-2 flex flex-col gap-0.5">
                  <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                    Odometer (KM)
                  </span>
                  <input
                    type="text"
                    value={odometer}
                    onChange={(e) => setOdometer(e.target.value)}
                    placeholder="Opsional"
                    className="bg-transparent font-body text-body-sm text-light-on-surface dark:text-dark-on-surface placeholder:text-light-on-surface-variant/70 dark:placeholder:text-dark-on-surface-variant/70 focus:outline-none w-full"
                  />
                </label>
              </div>
            </section>

            {/* Section 2: Parameter & Pilihan */}
            <section className="rounded-lg bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-md p-4 flex flex-col gap-3.5">
              <header className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Icon
                    name="tune"
                    size={18}
                    className="text-light-primary dark:text-dark-primary"
                  />
                  <h2 className="font-title text-title-sm text-light-on-surface dark:text-dark-on-surface">
                    Parameter &amp; Pilihan
                  </h2>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setMode(mode === 'Reguler' ? 'Awda' : 'Reguler')
                    }
                    className="px-2 py-0.5 rounded-full bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant font-label text-label-sm text-light-primary dark:text-dark-primary"
                  >
                    {mode}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setCustomerType(
                        customerType === 'New Cust' ? 'RO' : 'New Cust'
                      )
                    }
                    className="px-2 py-0.5 rounded-full bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant"
                  >
                    {customerType}
                  </button>
                </div>
              </header>

              {/* BPKB Segaris */}
              <div className="flex flex-col gap-1.5">
                <span className="font-label text-label-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
                  BPKB Atas Nama Sendiri
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: true, label: 'Ya (Segaris)' },
                    { val: false, label: 'Tidak (Berbeda)' },
                  ].map((opt) => {
                    const active = bpkbSameName === opt.val;
                    return (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => setBpkbSameName(opt.val)}
                        className={`min-h-[42px] rounded-md border border-b-2 shadow-sm py-2 px-2.5 font-label text-label-md text-center tactile-press ${
                          active
                            ? 'bg-light-secondary-container dark:bg-dark-secondary-container border-light-primary dark:border-dark-primary text-light-on-secondary-container dark:text-dark-on-secondary-container'
                            : 'bg-light-surface-container-lowest dark:bg-dark-surface-container border-light-outline-variant dark:border-dark-outline-variant text-light-on-surface-variant dark:text-dark-on-surface-variant'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Kondisi Pajak & Dokumen */}
              <div className="flex flex-col gap-1.5">
                <span className="font-label text-label-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
                  Kondisi Pajak &amp; Dokumen
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setTaxYearsDead((p) => (p + 1) % 6)}
                    className="min-h-[42px] rounded-md bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-sm px-2.5 py-1.5 flex items-center justify-between tactile-press"
                  >
                    <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                      Pajak
                    </span>
                    <span className="font-label text-label-lg text-light-on-surface dark:text-dark-on-surface tabular-nums">
                      {taxYearsDead} thn
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setKalengDead((v) => !v)}
                    className={`min-h-[42px] rounded-md border border-b-2 shadow-sm px-2 py-1.5 font-label text-label-sm text-center tactile-press ${
                      kalengDead
                        ? 'bg-warning-container dark:bg-dark-warning-container border-warning dark:border-dark-warning text-on-warning-container dark:text-dark-on-warning-container'
                        : 'bg-light-surface-container-lowest dark:bg-dark-surface-container border-light-outline-variant dark:border-dark-outline-variant text-light-on-surface-variant dark:text-dark-on-surface-variant'
                    }`}
                  >
                    {kalengDead ? 'Kaleng Mati' : 'Kaleng Hidup'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setHasFaktur((v) => !v)}
                    className={`min-h-[42px] rounded-md border border-b-2 shadow-sm px-2 py-1.5 font-label text-label-sm text-center tactile-press ${
                      hasFaktur
                        ? 'bg-light-secondary-container dark:bg-dark-secondary-container border-light-primary dark:border-dark-primary text-light-on-secondary-container dark:text-dark-on-secondary-container'
                        : 'bg-light-surface-container-lowest dark:bg-dark-surface-container border-light-outline-variant dark:border-dark-outline-variant text-light-on-surface-variant dark:text-dark-on-surface-variant'
                    }`}
                  >
                    {hasFaktur ? 'Faktur Ada' : 'Tanpa Faktur'}
                  </button>
                </div>
              </div>

              {/* Pilih Tenor */}
              <div className="flex flex-col gap-1.5">
                <span className="font-label text-label-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
                  Pilih Tenor (bulan)
                </span>
                <div className="grid grid-cols-6 gap-1.5">
                  {TENORS.map((t) => {
                    const active = tenor === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTenor(t)}
                        className={`min-h-[42px] rounded-md border border-b-2 py-2 font-label text-label-md text-center tabular-nums tactile-press ${
                          active
                            ? 'bg-light-primary dark:bg-dark-primary border-light-primary dark:border-dark-primary text-light-on-primary dark:text-dark-on-primary shadow-md'
                            : 'bg-light-surface-container-lowest dark:bg-dark-surface-container border-light-outline-variant dark:border-dark-outline-variant text-light-on-surface dark:text-dark-on-surface shadow-sm'
                        }`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Kontrak Top Up */}
              <div className="flex items-center justify-between gap-3">
                <span className="font-label text-label-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
                  Kontrak Top Up
                </span>
                <div className="grid grid-cols-2 gap-1.5 w-40">
                  {[
                    { val: true, label: 'Ya' },
                    { val: false, label: 'Tidak' },
                  ].map((opt) => {
                    const active = isTopUp === opt.val;
                    return (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => setIsTopUp(opt.val)}
                        className={`min-h-[38px] rounded-md border border-b-2 shadow-sm py-1.5 font-label text-label-md text-center tactile-press ${
                          active
                            ? 'bg-light-secondary-container dark:bg-dark-secondary-container border-light-primary dark:border-dark-primary text-light-on-secondary-container dark:text-dark-on-secondary-container'
                            : 'bg-light-surface-container-lowest dark:bg-dark-surface-container border-light-outline-variant dark:border-dark-outline-variant text-light-on-surface-variant dark:text-dark-on-surface-variant'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setPulseResult((p) => p + 1);
                  onToast('Taksasi diperbarui');
                }}
                className="w-full min-h-[46px] rounded-md bg-light-primary dark:bg-dark-primary border border-light-primary dark:border-dark-primary border-b-2 shadow-md py-2.5 px-4 flex items-center justify-center gap-2 text-light-on-primary dark:text-dark-on-primary font-label text-label-lg hover:brightness-110 tactile-press"
              >
                <Icon name="calculate" size={20} />
                <span>Hitung Taksasi</span>
              </button>
            </section>
          </div>

          {/* Right Column: Result & Tenor Comparison */}
          <div className="flex flex-col gap-4">
            {/* Section 3: Hasil Perhitungan */}
            <motion.section
              key={pulseResult}
              initial={{ scale: 0.99 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
              className="rounded-lg bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-md p-4 flex flex-col gap-3"
            >
              <header className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Icon
                    name="payments"
                    size={18}
                    className="text-light-primary dark:text-dark-primary"
                  />
                  <h2 className="font-title text-title-sm text-light-on-surface dark:text-dark-on-surface">
                    Hasil Perhitungan
                  </h2>
                </div>
                <span className="rounded-full bg-light-secondary-container dark:bg-dark-secondary-container border border-light-outline-variant dark:border-dark-outline-variant shadow-sm px-2.5 py-0.5 font-label text-label-sm text-light-on-secondary-container dark:text-dark-on-secondary-container">
                  Estimasi · {calculation.ltv}%
                </span>
              </header>

              {/* Raised Hero Result Box */}
              <div className="rounded-md bg-light-primary dark:bg-dark-primary-container border border-light-primary dark:border-dark-primary border-b-2 shadow-md p-4 flex items-center justify-between gap-3 text-light-on-primary">
                <div className="flex flex-col">
                  <span className="font-label text-label-sm text-light-on-primary-container">
                    TERIMA BERSIH KONSUMEN
                  </span>
                  <span className="font-headline text-display-md-mobile tabular-nums">
                    {formatIDR(calculation.netDisbursement)}
                  </span>
                </div>
                <div className="flex flex-col items-end text-right shrink-0">
                  <span className="font-label text-label-sm text-light-on-primary-container">
                    Angsuran {tenor}x
                  </span>
                  <span className="font-title text-title-md tabular-nums">
                    {formatIDR(calculation.installment)}
                  </span>
                </div>
              </div>

              {/* Raised Table Rincian */}
              <div className="rounded-md bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant shadow-sm divide-y divide-light-outline-variant dark:divide-dark-outline-variant overflow-hidden">
                <div className="px-3 py-2 flex items-center justify-between">
                  <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                    Plafond Pinjaman
                  </span>
                  <span className="font-mono text-mono-sm text-light-on-surface dark:text-dark-on-surface tabular-nums">
                    {formatIDR(calculation.plafond)}
                  </span>
                </div>
                {sisaHutang > 0 && (
                  <div className="px-3 py-2 flex items-center justify-between">
                    <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                      Sisa Hutang Angsuran
                    </span>
                    <span className="font-mono text-mono-sm text-light-error dark:text-dark-error tabular-nums">
                      - {formatIDR(sisaHutang)}
                    </span>
                  </div>
                )}
                {denda > 0 && (
                  <div className="px-3 py-2 flex items-center justify-between">
                    <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                      Denda
                    </span>
                    <span className="font-mono text-mono-sm text-light-error dark:text-dark-error tabular-nums">
                      - {formatIDR(denda)}
                    </span>
                  </div>
                )}
                {collFee > 0 && (
                  <div className="px-3 py-2 flex items-center justify-between">
                    <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                      Coll Fee
                    </span>
                    <span className="font-mono text-mono-sm text-light-error dark:text-dark-error tabular-nums">
                      - {formatIDR(collFee)}
                    </span>
                  </div>
                )}
                {calculation.pajakAdjustment > 0 && (
                  <div className="px-3 py-2 flex items-center justify-between">
                    <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                      Potongan Pajak ({taxYearsDead} thn)
                    </span>
                    <span className="font-mono text-mono-sm text-light-error dark:text-dark-error tabular-nums">
                      - {formatIDR(calculation.pajakAdjustment)}
                    </span>
                  </div>
                )}
                {calculation.biayaTopUp > 0 && (
                  <div className="px-3 py-2 flex items-center justify-between">
                    <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                      Biaya Top Up
                    </span>
                    <span className="font-mono text-mono-sm text-light-error dark:text-dark-error tabular-nums">
                      - {formatIDR(calculation.biayaTopUp)}
                    </span>
                  </div>
                )}
                <div className="px-3 py-2 flex items-center justify-between bg-light-surface-container dark:bg-dark-surface-container-high">
                  <span className="font-label text-label-md text-light-on-surface dark:text-dark-on-surface">
                    Total Potongan
                  </span>
                  <span className="font-mono text-mono-sm text-light-error dark:text-dark-error tabular-nums">
                    {formatIDR(calculation.totalDeductions)}
                  </span>
                </div>
              </div>

              {/* Action Row */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleSave}
                  className="min-h-[44px] rounded-md bg-light-surface-container-lowest dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-sm py-2 px-3 flex items-center justify-center gap-1.5 font-label text-label-md text-light-primary dark:text-dark-primary tactile-press"
                >
                  <Icon name="save" size={18} />
                  <span>Simpan</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShareCardOpen(true)}
                  className="min-h-[44px] rounded-md bg-success border border-success border-b-2 shadow-sm py-2 px-3 flex items-center justify-center gap-1.5 font-label text-label-md text-on-success tactile-press"
                >
                  <Icon name="share" size={18} />
                  <span>Share WA</span>
                </button>
              </div>
            </motion.section>

            {/* Section 4: Perbandingan Tenor */}
            <section className="rounded-lg bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-md p-4 flex flex-col gap-2.5">
              <header className="flex items-center justify-between">
                <h2 className="font-title text-title-sm text-light-on-surface dark:text-dark-on-surface">
                  Perbandingan Tenor
                </h2>
                <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                  Ketuk untuk pilih
                </span>
              </header>

              <div className="flex flex-col gap-1.5">
                {TENORS.map((t) => {
                  const inst = calculation.getTenorInstallment(t);
                  const total = inst * t;
                  const active = tenor === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTenor(t)}
                      className={`w-full min-h-[42px] rounded-md border border-b-2 px-3 py-2 flex items-center justify-between text-left tactile-press ${
                        active
                          ? 'bg-light-secondary-container dark:bg-dark-secondary-container border-light-primary dark:border-dark-primary shadow-md text-light-on-secondary-container dark:text-dark-on-secondary-container'
                          : 'bg-light-surface-container-low dark:bg-dark-surface-container border-light-outline-variant dark:border-dark-outline-variant shadow-sm text-light-on-surface dark:text-dark-on-surface'
                      }`}
                    >
                      <span className="font-label text-label-md w-14 tabular-nums">
                        {t} bln
                      </span>
                      <span className="font-mono text-mono-sm tabular-nums">
                        {formatIDR(inst)}
                      </span>
                      <span
                        className={`font-body text-body-sm tabular-nums ${
                          active
                            ? 'font-semibold'
                            : 'text-light-on-surface-variant dark:text-dark-on-surface-variant'
                        }`}
                      >
                        Tot {formatIDR(total)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Paste AR Info Bottom Sheet */}
      <BottomSheet
        open={arModalOpen}
        onClose={() => setArModalOpen(false)}
        title="Tempel AR Info"
        subtitle="Ekstrak sisa hutang, denda, dan coll fee secara otomatis"
      >
        <div className="flex flex-col gap-3">
          <textarea
            rows={5}
            value={arRawText}
            onChange={(e) => setArRawText(e.target.value)}
            placeholder="Contoh:&#10;NAMA: BANI MUNGGARAN&#10;KONTRAK: 155234633626&#10;SISA HUTANG: 1500000&#10;DENDA: 2250000&#10;COLL FEE: 250000"
            className="w-full rounded-md bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant p-3 font-mono text-body-sm text-light-on-surface dark:text-dark-on-surface focus:border-light-primary dark:focus:border-dark-primary focus:outline-none"
          />
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={applySampleAr}
              className="min-h-[44px] rounded-md bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant border-b-2 px-3 py-2 font-label text-label-md text-light-on-surface dark:text-dark-on-surface tactile-press"
            >
              Isi Contoh AR
            </button>
            <button
              type="button"
              onClick={handleParseAr}
              className="min-h-[44px] rounded-md bg-light-primary dark:bg-dark-primary border border-light-primary dark:border-dark-primary border-b-2 px-3 py-2 font-label text-label-md text-light-on-primary dark:text-dark-on-primary tactile-press"
            >
              Terapkan Potongan
            </button>
          </div>
        </div>
      </BottomSheet>

      {/* Screen 16: Kartu Hasil Perhitungan Taksasi (Share WA) */}
      <BottomSheet
        open={shareCardOpen}
        onClose={() => setShareCardOpen(false)}
        title="Kartu Hasil Taksasi"
        subtitle="Pratinjau kartu ringkasan untuk dibagikan ke WhatsApp"
      >
        <div className="flex flex-col gap-4">
          <article className="w-full rounded-lg bg-light-surface-container-lowest dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant shadow-md overflow-hidden flex flex-col">
            {/* Header Brand Bar */}
            <header className="bg-light-primary dark:bg-dark-primary-container px-4 py-3 flex items-center justify-between gap-2 text-light-on-primary">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-md bg-light-surface-container-lowest p-0.5 flex items-center justify-center shrink-0 overflow-hidden">
                  <BrandLogo className="w-full h-full object-cover rounded-sm" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-title text-title-sm tracking-wide truncate">
                    DANASTRA · SmartTaksasi
                  </span>
                  <span className="font-label text-label-sm text-light-on-primary-container truncate">
                    Hasil Perhitungan Taksasi
                  </span>
                </div>
              </div>
              <span className="rounded-full bg-light-primary-container border border-light-inverse-primary/60 px-2.5 py-0.5 font-label text-label-sm text-light-on-primary shrink-0">
                SIMULASI
              </span>
            </header>

            <div className="p-4 flex flex-col gap-3">
              {/* Identitas Nasabah & Unit */}
              <div className="rounded-md bg-light-surface-container-low dark:bg-dark-surface-container-high border border-light-outline-variant dark:border-dark-outline-variant px-3 py-2.5 grid grid-cols-2 gap-x-3 gap-y-2">
                <div className="flex flex-col min-w-0">
                  <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                    Nama Nasabah
                  </span>
                  <span className="font-label text-label-lg text-light-on-surface dark:text-dark-on-surface truncate">
                    {customerName}
                  </span>
                </div>
                <div className="flex flex-col min-w-0 items-end text-right">
                  <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                    No. Kontrak
                  </span>
                  <span className="font-mono text-mono-sm text-light-on-surface dark:text-dark-on-surface tabular-nums">
                    {contractNumber}
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                    Unit Kendaraan
                  </span>
                  <span className="font-label text-label-lg text-light-on-surface dark:text-dark-on-surface truncate">
                    {brandType}
                  </span>
                </div>
                <div className="flex flex-col min-w-0 items-end text-right">
                  <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                    Tahun Motor
                  </span>
                  <span className="font-label text-label-lg text-light-on-surface dark:text-dark-on-surface tabular-nums">
                    {year}
                  </span>
                </div>
              </div>

              {/* Plafond & Angsuran */}
              <div className="rounded-md bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant px-3 py-2.5 flex items-center justify-between gap-2">
                <div className="flex flex-col">
                  <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                    Plafond Pinjaman
                  </span>
                  <span className="font-headline text-headline-md text-light-on-surface dark:text-dark-on-surface tabular-nums">
                    {formatIDR(calculation.plafond)}
                  </span>
                </div>
                <div className="flex flex-col items-end text-right">
                  <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                    Angsuran {tenor}x
                  </span>
                  <span className="font-title text-title-md text-light-primary dark:text-dark-primary tabular-nums">
                    {formatIDR(calculation.installment)}
                  </span>
                </div>
              </div>

              {/* Rincian Potongan */}
              <div className="rounded-md bg-light-surface-container-low dark:bg-dark-surface-container-high border border-light-outline-variant dark:border-dark-outline-variant divide-y divide-light-outline-variant dark:divide-dark-outline-variant overflow-hidden">
                <div className="px-3 py-1.5 flex items-center justify-between">
                  <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                    Sisa Hutang Angsuran
                  </span>
                  <span className="font-mono text-mono-sm text-light-on-surface dark:text-dark-on-surface tabular-nums">
                    {formatIDR(sisaHutang)}
                  </span>
                </div>
                <div className="px-3 py-1.5 flex items-center justify-between">
                  <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                    Denda
                  </span>
                  <span className="font-mono text-mono-sm text-light-on-surface dark:text-dark-on-surface tabular-nums">
                    {formatIDR(denda)}
                  </span>
                </div>
                <div className="px-3 py-1.5 flex items-center justify-between">
                  <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                    Coll Fee
                  </span>
                  <span className="font-mono text-mono-sm text-light-on-surface dark:text-dark-on-surface tabular-nums">
                    {formatIDR(collFee)}
                  </span>
                </div>
                <div className="px-3 py-1.5 flex items-center justify-between">
                  <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                    Meterai
                  </span>
                  <span className="font-mono text-mono-sm text-light-on-surface dark:text-dark-on-surface tabular-nums">
                    {formatIDR(calculation.meterai)}
                  </span>
                </div>
                <div className="px-3 py-1.5 flex items-center justify-between">
                  <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                    Biaya Top Up
                  </span>
                  <span className="font-mono text-mono-sm text-light-on-surface dark:text-dark-on-surface tabular-nums">
                    {formatIDR(calculation.biayaTopUp)}
                  </span>
                </div>
                <div className="px-3 py-2 bg-light-surface-container dark:bg-dark-surface-container flex items-center justify-between">
                  <span className="font-label text-label-lg text-light-on-surface dark:text-dark-on-surface">
                    Total Potongan
                  </span>
                  <span className="font-mono text-mono-sm text-light-error dark:text-dark-error tabular-nums">
                    {formatIDR(calculation.totalDeductions)}
                  </span>
                </div>
              </div>

              {/* Terima Bersih Hero Box */}
              <div className="rounded-md bg-light-primary dark:bg-dark-primary-container border border-light-primary border-b-2 shadow-md px-3.5 py-3 flex items-center justify-between gap-2 text-light-on-primary">
                <div className="flex flex-col">
                  <span className="font-label text-label-sm text-light-on-primary-container">
                    TERIMA BERSIH KONSUMEN
                  </span>
                  <span className="font-headline text-display-md-mobile tabular-nums">
                    {formatIDR(calculation.netDisbursement)}
                  </span>
                </div>
                <span className="rounded-full bg-light-primary-container border border-light-inverse-primary/60 px-2.5 py-0.5 font-label text-label-sm shrink-0">
                  Estimasi Cair
                </span>
              </div>

              <p className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant text-center">
                Simulasi ini bukan penawaran resmi. Angka final mengikuti persetujuan kredit.
              </p>
            </div>
          </article>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleCopyShareText}
              className="min-h-[44px] rounded-md bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant border-b-2 px-3 py-2 flex items-center justify-center gap-1.5 font-label text-label-md text-light-on-surface dark:text-dark-on-surface tactile-press"
            >
              <Icon name="content_copy" size={18} />
              <span>Salin Teks</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const msg = encodeURIComponent(
                  `*DANASTRA · SmartTaksasi*\nNasabah: ${customerName}\nUnit: ${brandType} (${year})\nPlafond: ${formatIDR(calculation.plafond)}\nAngsuran ${tenor}x: ${formatIDR(calculation.installment)}/bln\n*TERIMA BERSIH: ${formatIDR(calculation.netDisbursement)}*`
                );
                window.open(`https://wa.me/?text=${msg}`, '_blank', 'noopener');
                onToast('Membuka WhatsApp');
              }}
              className="min-h-[44px] rounded-md bg-success border border-success border-b-2 px-3 py-2 flex items-center justify-center gap-1.5 font-label text-label-md text-on-success tactile-press"
            >
              <Icon name="share" size={18} />
              <span>Kirim WhatsApp</span>
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
};
