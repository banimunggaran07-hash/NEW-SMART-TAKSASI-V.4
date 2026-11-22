import React, { useState } from 'react';
import { BottomSheet, ContextualHeader, Icon } from '../ui/Primitives';

interface DonateScreenProps {
  onBack: () => void;
  onToast: (msg: string) => void;
}

export const DonateScreen: React.FC<DonateScreenProps> = ({
  onBack,
  onToast,
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const [selectedNominal, setSelectedNominal] = useState(25000);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleCopyNmid = async () => {
    try {
      await navigator.clipboard.writeText('ID1026641670108');
      onToast('ID QRIS ID1026641670108 disalin');
    } catch {
      onToast('ID QRIS: ID1026641670108');
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <ContextualHeader
        title="Donate, buat ngopi"
        subtitle="Dukungan pengembangan SmartTaksasi"
        onBack={onBack}
      />

      <main className="px-4 py-4 pb-10 flex flex-col gap-4 max-w-xl w-full mx-auto">
        {/* Hero Gratitude Card */}
        <section className="rounded-lg bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-md p-5 flex flex-col items-center text-center gap-2.5">
          <div className="w-12 h-12 rounded-2xl bg-warning-container dark:bg-dark-warning-container text-on-warning-container dark:text-dark-on-warning-container flex items-center justify-center">
            <Icon name="local_cafe" size={26} />
          </div>
          <h2 className="font-title text-title-md text-light-on-surface dark:text-dark-on-surface">
            Terima kasih telah menggunakan aplikasi ini
          </h2>
          <p className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant leading-relaxed">
            Dukungan Anda sangat berarti untuk menjaga server tetap aktif dan pengembangan fitur baru SmartTaksasi.
          </p>
        </section>

        {/* QRIS Card */}
        <section className="rounded-lg bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-md p-4 flex flex-col items-center gap-3">
          <div className="w-full flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Icon
                name="qr_code_2"
                size={20}
                className="text-light-primary dark:text-dark-primary"
              />
              <span className="font-title text-title-sm text-light-on-surface dark:text-dark-on-surface">
                QRIS SmartTaksasi
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyNmid}
              className="font-mono text-label-sm text-light-primary dark:text-dark-primary hover:underline"
            >
              ID1026641670108
            </button>
          </div>

          <div className="w-full max-w-[300px] rounded-xl bg-white p-3 border border-light-outline-variant shadow-sm flex items-center justify-center overflow-hidden">
            {imgFailed ? (
              <div className="w-full aspect-[3/4] flex flex-col items-center justify-center gap-2 bg-light-surface-container-low text-light-on-surface-variant rounded-lg p-4 text-center">
                <Icon name="qr_code_2" size={56} className="text-light-primary" />
                <span className="font-mono text-mono-sm">ID1026641670108</span>
                <span className="font-body text-body-sm">
                  QRIS SmartTaksasi
                </span>
              </div>
            ) : (
              <img
                src="/assets/images/qris-smarttaksasi.png"
                alt="QRIS SmartTaksasi untuk Donate buat ngopi"
                referrerPolicy="no-referrer"
                onError={() => setImgFailed(true)}
                className="w-full h-auto object-contain rounded-lg"
              />
            )}
          </div>

          {/* Action Tiles */}
          <div className="w-full grid grid-cols-3 gap-2 pt-1">
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="min-h-[60px] rounded-md bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant border-b-2 px-2 py-2 flex flex-col items-center justify-center gap-1 tactile-press"
            >
              <Icon
                name="account_balance_wallet"
                size={18}
                className="text-light-primary dark:text-dark-primary"
              />
              <span className="font-label text-label-sm text-light-on-surface dark:text-dark-on-surface">
                Buka E-Wallet
              </span>
            </button>
            <button
              type="button"
              onClick={handleCopyNmid}
              className="min-h-[60px] rounded-md bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant border-b-2 px-2 py-2 flex flex-col items-center justify-center gap-1 tactile-press"
            >
              <Icon
                name="qr_code_scanner"
                size={18}
                className="text-light-primary dark:text-dark-primary"
              />
              <span className="font-label text-label-sm text-light-on-surface dark:text-dark-on-surface">
                Salin ID QRIS
              </span>
            </button>
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="min-h-[60px] rounded-md bg-success-container dark:bg-dark-success-container border border-success/30 border-b-2 px-2 py-2 flex flex-col items-center justify-center gap-1 tactile-press"
            >
              <Icon
                name="favorite"
                size={18}
                className="text-success dark:text-dark-success"
                filled
              />
              <span className="font-label text-label-sm text-on-success-container dark:text-dark-on-success-container">
                Kirim Donasi
              </span>
            </button>
          </div>
        </section>
      </main>

      <BottomSheet
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Pilih Nominal Dukungan"
        subtitle="Dukungan sukarela untuk server SmartTaksasi"
      >
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-3 gap-2">
            {[15000, 25000, 50000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setSelectedNominal(amt)}
                className={`min-h-[44px] rounded-md border border-b-2 font-mono text-label-md tabular-nums tactile-press ${
                  selectedNominal === amt
                    ? 'bg-light-primary dark:bg-dark-primary border-light-primary text-light-on-primary dark:text-dark-on-primary'
                    : 'bg-light-surface-container-low dark:bg-dark-surface-container border-light-outline-variant dark:border-dark-outline-variant'
                }`}
              >
                Rp {(amt / 1000).toFixed(0)}rb
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              setConfirmOpen(false);
              onToast(`Terima kasih atas dukungan Rp ${selectedNominal.toLocaleString('id-ID')}!`);
            }}
            className="w-full min-h-[46px] rounded-md bg-success text-on-success font-label text-label-lg tactile-press"
          >
            Konfirmasi Selesai Donasi
          </button>
        </div>
      </BottomSheet>
    </div>
  );
};
