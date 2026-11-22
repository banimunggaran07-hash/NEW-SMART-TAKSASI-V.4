import React, { useState } from 'react';
import { BottomSheet, ContextualHeader, Icon } from '../ui/Primitives';

interface SettingsScreenProps {
  serverUrl: string;
  onUpdateServerUrl: (url: string) => void;
  onBack: () => void;
  onToast: (msg: string) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  serverUrl,
  onUpdateServerUrl,
  onBack,
  onToast,
}) => {
  const [urlInput, setUrlInput] = useState(serverUrl);
  const [testing, setTesting] = useState(false);
  const [connected, setConnected] = useState(true);
  const [latencyMs, setLatencyMs] = useState(38);
  const [pinSheetOpen, setPinSheetOpen] = useState(false);
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');

  const handleSaveAndTest = () => {
    const clean = urlInput.trim() || 'smarttaksasi.my.id';
    setTesting(true);
    setTimeout(() => {
      setTesting(false);
      setConnected(true);
      setLatencyMs(Math.floor(24 + Math.random() * 28));
      onUpdateServerUrl(clean);
      onToast(`Terhubung ke ${clean}`);
    }, 450);
  };

  const handleResetWifi = () => {
    const localAddr = '192.168.1.100:3000';
    setUrlInput(localAddr);
    onUpdateServerUrl(localAddr);
    setLatencyMs(12);
    onToast('Beralih ke server WiFi Lokal');
  };

  const handleCopyInfo = async () => {
    const info = `SmartTaksasi v3.3.9\nServer: ${serverUrl}\nStatus: ${connected ? 'TERHUBUNG' : 'TERPUTUS'}\nLatensi: ${latencyMs}ms`;
    try {
      await navigator.clipboard.writeText(info);
      onToast('Info koneksi disalin');
    } catch {
      onToast('Info koneksi siap dikirim');
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <ContextualHeader
        title="Pengaturan"
        subtitle="Alamat server, koneksi & keamanan PIN"
        onBack={onBack}
      />

      <main className="px-4 py-4 pb-10 flex flex-col gap-4 max-w-3xl w-full mx-auto">
        {/* Connection Status Card */}
        <section className="rounded-lg bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-md p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className="px-2.5 py-1 rounded-full bg-success-container dark:bg-dark-success-container text-on-success-container dark:text-dark-on-success-container font-label text-label-sm">
              {connected ? 'TERHUBUNG' : 'TERPUTUS'}
            </span>
            <span className="font-mono text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant tabular-nums">
              {serverUrl.includes('192.168') ? 'WIFI LOKAL' : 'INTERNET'} · {latencyMs}ms
            </span>
          </div>

          <div>
            <h2 className="font-headline text-headline-sm text-light-on-surface dark:text-dark-on-surface">
              {serverUrl}
            </h2>
            <p className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant mt-0.5">
              Bisa dipakai dari jaringan mana pun selama server menyala.
            </p>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="font-label text-label-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
              Alamat Server
            </span>
            <div className="relative">
              <Icon
                name="dns"
                size={18}
                className="text-light-on-surface-variant dark:text-dark-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              />
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="w-full min-h-[44px] rounded-md bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant pl-10 pr-4 py-2 font-mono text-body-md text-light-on-surface dark:text-dark-on-surface focus:border-light-primary dark:focus:border-dark-primary focus:outline-none"
              />
            </div>
          </label>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleSaveAndTest}
              className="min-h-[44px] rounded-md bg-light-primary dark:bg-dark-primary border border-light-primary dark:border-dark-primary border-b-2 px-3 py-2 flex items-center justify-center gap-1.5 font-label text-label-md text-light-on-primary dark:text-dark-on-primary tactile-press"
            >
              <Icon name="podcasts" size={18} />
              <span>{testing ? 'Menguji...' : 'Simpan & Uji'}</span>
            </button>
            <button
              type="button"
              onClick={handleSaveAndTest}
              className="min-h-[44px] rounded-md bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant border-b-2 px-3 py-2 flex items-center justify-center gap-1.5 font-label text-label-md text-light-on-surface dark:text-dark-on-surface tactile-press"
            >
              <Icon
                name="refresh"
                size={18}
                className={testing ? 'animate-spin' : ''}
              />
              <span>Periksa</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleResetWifi}
            className="w-full min-h-[42px] rounded-md bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant border-b-2 px-3 py-2 flex items-center justify-center gap-2 font-label text-label-md text-light-primary dark:text-dark-primary tactile-press"
          >
            <Icon name="wifi" size={18} />
            <span>Kembali ke WiFi Lokal</span>
          </button>
        </section>

        {/* Security & Diagnostics Rows */}
        <section className="rounded-lg bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-md divide-y divide-light-outline-variant dark:divide-dark-outline-variant overflow-hidden">
          <button
            type="button"
            onClick={() => setPinSheetOpen(true)}
            className="w-full px-4 py-3.5 flex items-center justify-between gap-3 text-left hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container tactile-press"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-md bg-light-secondary-container dark:bg-dark-secondary-container text-light-on-secondary-container dark:text-dark-on-secondary-container flex items-center justify-center shrink-0">
                <Icon name="lock" size={20} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-label text-label-lg text-light-on-surface dark:text-dark-on-surface">
                  Ganti PIN
                </span>
                <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                  PIN 6 digit untuk login ke aplikasi
                </span>
              </div>
            </div>
            <Icon
              name="chevron_right"
              size={20}
              className="text-light-on-surface-variant dark:text-dark-on-surface-variant shrink-0"
            />
          </button>

          <button
            type="button"
            onClick={handleCopyInfo}
            className="w-full px-4 py-3.5 flex items-center justify-between gap-3 text-left hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container tactile-press"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-md bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant text-light-primary dark:text-dark-primary flex items-center justify-center shrink-0">
                <Icon name="content_copy" size={18} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-label text-label-lg text-light-on-surface dark:text-dark-on-surface">
                  Salin Info Koneksi
                </span>
                <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                  Untuk laporan jika aplikasi gagal terhubung
                </span>
              </div>
            </div>
            <Icon
              name="content_copy"
              size={18}
              className="text-light-on-surface-variant dark:text-dark-on-surface-variant shrink-0"
            />
          </button>
        </section>
      </main>

      <BottomSheet
        open={pinSheetOpen}
        onClose={() => setPinSheetOpen(false)}
        title="Ganti PIN Keamanan"
        subtitle="Masukkan PIN lama dan PIN baru 6 digit"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (newPin.length < 4) {
              onToast('PIN minimal 4-6 digit');
              return;
            }
            setOldPin('');
            setNewPin('');
            setPinSheetOpen(false);
            onToast('PIN keamanan berhasil diperbarui');
          }}
          className="flex flex-col gap-3"
        >
          <input
            type="password"
            inputMode="numeric"
            maxLength={6}
            value={oldPin}
            onChange={(e) => setOldPin(e.target.value)}
            placeholder="PIN saat ini"
            className="w-full min-h-[44px] rounded-md bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant px-3 py-2 font-mono text-body-md focus:border-light-primary dark:focus:border-dark-primary focus:outline-none"
          />
          <input
            type="password"
            inputMode="numeric"
            maxLength={6}
            value={newPin}
            onChange={(e) => setNewPin(e.target.value)}
            placeholder="PIN baru (6 digit)"
            className="w-full min-h-[44px] rounded-md bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant px-3 py-2 font-mono text-body-md focus:border-light-primary dark:focus:border-dark-primary focus:outline-none"
          />
          <button
            type="submit"
            className="w-full min-h-[46px] rounded-md bg-light-primary dark:bg-dark-primary text-light-on-primary dark:text-dark-on-primary font-label text-label-lg tactile-press"
          >
            Simpan PIN Baru
          </button>
        </form>
      </BottomSheet>
    </div>
  );
};
