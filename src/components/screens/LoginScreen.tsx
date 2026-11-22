import React, { useState } from 'react';
import { motion } from 'motion/react';
import { AuthSession } from '../../types';
import { BottomSheet, BrandLogo, Icon } from '../ui/Primitives';

interface LoginScreenProps {
  serverUrl: string;
  onUpdateServerUrl: (url: string) => void;
  onLogin: (session: AuthSession) => void;
  isDark: boolean;
  onToggleTheme: (dark: boolean) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  serverUrl,
  onUpdateServerUrl,
  onLogin,
  isDark,
  onToggleTheme,
}) => {
  const [csId, setCsId] = useState('68343');
  const [pin, setPin] = useState('123456');
  const [showPin, setShowPin] = useState(false);
  const [serverModalOpen, setServerModalOpen] = useState(false);
  const [serverDraft, setServerDraft] = useState(serverUrl);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = csId.trim().toUpperCase();
    if (!cleaned || !pin.trim()) {
      setErrorMsg('Masukkan CS ID dan PIN Anda');
      return;
    }

    const isSpv = cleaned === '68343' || cleaned === '61598';
    onLogin({
      csId: cleaned,
      name:
        cleaned === '68343'
          ? 'BANI MUNGGARAN'
          : cleaned === 'S000068864'
            ? 'DEDE LIA SUSANTI'
            : `USER ${cleaned}`,
      role: isSpv ? 'SUPERVISOR' : 'MARKETING',
      kiosName: cleaned === '61598' ? 'BABAKAN' : 'PARUNG PANJANG',
      kiosCode: cleaned === '61598' ? '15578' : '15576',
      serverUrl,
    });
  };

  return (
    <div className="min-h-[100dvh] bg-light-surface dark:bg-dark-surface text-light-on-surface dark:text-dark-on-surface flex flex-col justify-between p-4 pt-safe pb-[max(20px,env(safe-area-inset-bottom))]">
      {/* Top Theme Switch */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => onToggleTheme(!isDark)}
          aria-label="Ubah tema"
          className="w-10 h-10 rounded-full bg-light-surface-container-lowest dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-sm flex items-center justify-center text-light-on-surface-variant dark:text-dark-on-surface-variant tactile-press"
        >
          <Icon name={isDark ? 'light_mode' : 'dark_mode'} size={18} />
        </button>
      </div>

      {/* Centered Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[390px] mx-auto my-auto flex flex-col gap-6"
      >
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-20 h-20 rounded-2xl bg-light-surface-container-lowest dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-md p-2 flex items-center justify-center overflow-hidden">
            <BrandLogo />
          </div>
          <div>
            <h1 className="font-display text-display-md-mobile text-light-on-surface dark:text-dark-on-surface">
              SmartTaksasi
            </h1>
            <p className="font-body text-body-md text-light-on-surface-variant dark:text-dark-on-surface-variant mt-0.5">
              Masuk untuk menyinkronkan data tim
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-md p-5 flex flex-col gap-4"
        >
          <label className="flex flex-col gap-1.5">
            <span className="font-label text-label-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
              CS ID
            </span>
            <div className="relative">
              <Icon
                name="badge"
                size={18}
                className="text-light-on-surface-variant dark:text-dark-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              />
              <input
                type="text"
                value={csId}
                onChange={(e) => {
                  setCsId(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="Contoh: 68343"
                className="w-full min-h-[46px] rounded-md bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant pl-10 pr-4 py-2 font-mono text-body-md text-light-on-surface dark:text-dark-on-surface focus:border-light-primary dark:focus:border-dark-primary focus:outline-none"
              />
            </div>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="font-label text-label-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
              PIN atau Kata Sandi
            </span>
            <div className="relative">
              <Icon
                name="lock"
                size={18}
                className="text-light-on-surface-variant dark:text-dark-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              />
              <input
                type={showPin ? 'text' : 'password'}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="Masukkan PIN 6 digit"
                className="w-full min-h-[46px] rounded-md bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant pl-10 pr-11 py-2 font-mono text-body-md text-light-on-surface dark:text-dark-on-surface focus:border-light-primary dark:focus:border-dark-primary focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPin((v) => !v)}
                aria-label={showPin ? 'Sembunyikan PIN' : 'Lihat PIN'}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center text-light-on-surface-variant dark:text-dark-on-surface-variant"
              >
                <Icon
                  name={showPin ? 'visibility_off' : 'visibility'}
                  size={18}
                />
              </button>
            </div>
          </label>

          {errorMsg && (
            <p className="font-body text-body-sm text-light-error dark:text-dark-error">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            className="w-full min-h-[48px] rounded-md bg-light-primary dark:bg-dark-primary border border-light-primary dark:border-dark-primary border-b-2 shadow-md px-4 py-2.5 flex items-center justify-center gap-2 font-label text-label-lg text-light-on-primary dark:text-dark-on-primary hover:brightness-110 tactile-press"
          >
            <span>Masuk</span>
            <Icon name="arrow_forward" size={18} />
          </button>

          <p className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant text-center leading-relaxed">
            Gunakan CS ID yang didaftarkan admin. Peran (Marketing atau Supervisor) mengikuti akun Anda.
          </p>
        </form>
      </motion.div>

      {/* Bottom Server Indicator */}
      <div className="w-full max-w-[390px] mx-auto pt-4 flex items-center justify-center">
        <button
          type="button"
          onClick={() => {
            setServerDraft(serverUrl);
            setServerModalOpen(true);
          }}
          className="rounded-full bg-light-surface-container-lowest dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-sm px-4 py-2 flex items-center gap-2 font-mono text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant tactile-press"
        >
          <span className="w-2 h-2 rounded-full bg-success dark:bg-dark-success" />
          <span>Server: {serverUrl}</span>
          <Icon name="tune" size={16} />
        </button>
      </div>

      <BottomSheet
        open={serverModalOpen}
        onClose={() => setServerModalOpen(false)}
        title="Konfigurasi Alamat Server"
        subtitle="Ubah alamat server sinkronisasi SmartTaksasi"
      >
        <div className="flex flex-col gap-3">
          <input
            type="text"
            value={serverDraft}
            onChange={(e) => setServerDraft(e.target.value)}
            className="w-full min-h-[44px] rounded-md bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant px-3 py-2 font-mono text-body-md focus:border-light-primary dark:focus:border-dark-primary focus:outline-none"
          />
          <button
            type="button"
            onClick={() => {
              onUpdateServerUrl(serverDraft.trim() || 'smarttaksasi.my.id');
              setServerModalOpen(false);
            }}
            className="w-full min-h-[46px] rounded-md bg-light-primary dark:bg-dark-primary text-light-on-primary dark:text-dark-on-primary font-label text-label-lg tactile-press"
          >
            Simpan Server
          </button>
        </div>
      </BottomSheet>
    </div>
  );
};
