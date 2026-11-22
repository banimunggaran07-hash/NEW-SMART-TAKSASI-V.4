import React, { useMemo, useState } from 'react';
import { AuthSession, ScreenId } from '../../types';
import { BrandLogo, Icon } from '../ui/Primitives';

interface MenuDrawerContentProps {
  activeScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  onClose?: () => void;
  isDark: boolean;
  onToggleTheme: (dark: boolean) => void;
  session: AuthSession;
  onLogout: () => void;
  bqCount: number;
  marketingCount: number;
  isDesktopSidebar?: boolean;
}

interface MenuItem {
  id: ScreenId;
  label: string;
  icon: string;
  badge?: number;
  badgeVariant?: 'primary' | 'error';
  section: 'main' | 'admin';
  subtitle?: string;
}

export const MenuDrawerContent: React.FC<MenuDrawerContentProps> = ({
  activeScreen,
  onNavigate,
  onClose,
  isDark,
  onToggleTheme,
  session,
  onLogout,
  bqCount,
  marketingCount,
  isDesktopSidebar = false,
}) => {
  const [query, setQuery] = useState('');

  const menuItems: MenuItem[] = useMemo(
    () => [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: 'dashboard',
        badge: bqCount,
        badgeVariant: 'primary',
        section: 'main',
      },
      {
        id: 'kalkulator',
        label: 'Kalkulator Taksasi',
        icon: 'calculate',
        section: 'main',
      },
      {
        id: 'cari-otr',
        label: 'Cari OTR',
        icon: 'search',
        section: 'main',
      },
      {
        id: 'cek-clop',
        label: 'Cek CLOP',
        icon: 'verified_user',
        section: 'main',
      },
      {
        id: 'target',
        label: 'Target & Leaderboard',
        icon: 'flag',
        badge: marketingCount,
        badgeVariant: 'error',
        section: 'main',
      },
      {
        id: 'pricelist',
        label: 'Price List Angsuran',
        icon: 'payments',
        section: 'main',
      },
      {
        id: 'upload-master',
        label: 'Upload Data Master',
        icon: 'cloud_upload',
        section: 'admin',
      },
      {
        id: 'log-aktivitas',
        label: 'Rekap Harian & Log',
        icon: 'calendar_today',
        section: 'admin',
      },
      {
        id: 'kelola-user',
        label: 'Kelola User & Distribusi',
        icon: 'manage_accounts',
        section: 'admin',
      },
      {
        id: 'pengaturan',
        label: 'Pengaturan Server & PIN',
        icon: 'settings',
        section: 'admin',
      },
    ],
    [bqCount, marketingCount]
  );

  const filteredMain = menuItems.filter(
    (item) =>
      item.section === 'main' &&
      item.label.toLowerCase().includes(query.trim().toLowerCase())
  );

  const filteredAdmin = menuItems.filter(
    (item) =>
      item.section === 'admin' &&
      item.label.toLowerCase().includes(query.trim().toLowerCase())
  );

  const initials = session.name
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();

  const handleSelect = (id: ScreenId) => {
    onNavigate(id);
    if (onClose) onClose();
  };

  return (
    <div className="h-full flex flex-col justify-between p-4 gap-4 bg-light-surface-container-lowest dark:bg-dark-surface-container-low text-light-on-surface dark:text-dark-on-surface">
      {/* Top Brand Header & Search */}
      <div className="flex flex-col gap-3">
        <header className="flex items-center justify-between gap-2 pt-safe lg:pt-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-md bg-light-surface-container-lowest dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-sm p-0.5 flex items-center justify-center overflow-hidden shrink-0">
              <BrandLogo />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-title text-title-md text-light-on-surface dark:text-dark-on-surface truncate">
                SmartTaksasi
              </span>
              <span className="font-mono text-mono-sm text-light-on-surface-variant dark:text-dark-on-surface-variant truncate">
                v3.3.9 · ONLINE
              </span>
            </div>
          </div>
          {!isDesktopSidebar && onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup menu"
              className="w-9 h-9 rounded-full bg-light-primary dark:bg-dark-primary text-light-on-primary dark:text-dark-on-primary shadow-sm flex items-center justify-center shrink-0 tactile-press"
            >
              <Icon name="chevron_left" size={20} />
            </button>
          )}
        </header>

        {/* Sidebar Search Input */}
        <div className="relative">
          <Icon
            name="search"
            size={18}
            className="text-light-on-surface-variant dark:text-dark-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari menu..."
            aria-label="Cari menu"
            className="w-full rounded-md bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-sm pl-9 pr-3 py-2 font-body text-body-sm text-light-on-surface dark:text-dark-on-surface placeholder:text-light-on-surface-variant dark:placeholder:text-dark-on-surface-variant focus:border-light-primary dark:focus:border-dark-primary focus:outline-none"
          />
        </div>
      </div>

      {/* Scrollable Navigation Groups */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-0.5">
        {filteredMain.length > 0 && (
          <section className="flex flex-col gap-1">
            <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant px-2">
              Menu
            </span>
            <div className="flex flex-col gap-1">
              {filteredMain.map((item) => {
                const isActive =
                  activeScreen === item.id ||
                  (item.id === 'target' && activeScreen === 'leaderboard');
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item.id)}
                    className={`w-full min-h-[42px] rounded-md px-3 py-2 flex items-center justify-between gap-2 text-left transition-colors tactile-press ${
                      isActive
                        ? 'bg-light-secondary-container/70 dark:bg-dark-secondary-container/70 border border-light-primary dark:border-dark-primary border-b-2 shadow-sm text-light-primary dark:text-dark-primary'
                        : 'text-light-on-surface dark:text-dark-on-surface hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        name={item.icon}
                        size={18}
                        filled={isActive}
                        className={
                          isActive
                            ? 'text-light-primary dark:text-dark-primary shrink-0'
                            : 'text-light-on-surface-variant dark:text-dark-on-surface-variant shrink-0'
                        }
                      />
                      <span
                        className={`font-label text-label-lg truncate ${
                          isActive
                            ? 'text-light-primary dark:text-dark-primary'
                            : 'text-light-on-surface dark:text-dark-on-surface'
                        }`}
                      >
                        {item.label}
                      </span>
                    </div>
                    {typeof item.badge === 'number' && (
                      <span
                        className={`rounded-full px-2 py-0.5 font-label text-label-sm tabular-nums shrink-0 ${
                          item.badgeVariant === 'error'
                            ? 'bg-light-error dark:bg-dark-error text-light-on-error dark:text-dark-on-error'
                            : 'bg-light-primary dark:bg-dark-primary text-light-on-primary dark:text-dark-on-primary'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {filteredAdmin.length > 0 && (
          <>
            <hr className="border-light-outline-variant dark:border-dark-outline-variant" />
            <section className="flex flex-col gap-1">
              <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant px-2">
                Admin &amp; Data
              </span>
              <div className="flex flex-col gap-1">
                {filteredAdmin.map((item) => {
                  const isActive = activeScreen === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelect(item.id)}
                      className={`w-full min-h-[42px] rounded-md px-3 py-2 flex items-center justify-between gap-2 text-left transition-colors tactile-press ${
                        isActive
                          ? 'bg-light-secondary-container/70 dark:bg-dark-secondary-container/70 border border-light-primary dark:border-dark-primary border-b-2 shadow-sm text-light-primary dark:text-dark-primary'
                          : 'text-light-on-surface dark:text-dark-on-surface hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          name={item.icon}
                          size={18}
                          filled={isActive}
                          className={
                            isActive
                              ? 'text-light-primary dark:text-dark-primary shrink-0'
                              : 'text-light-on-surface-variant dark:text-dark-on-surface-variant shrink-0'
                          }
                        />
                        <span className="font-label text-label-lg truncate">
                          {item.label}
                        </span>
                      </div>
                      <Icon
                        name="chevron_right"
                        size={16}
                        className="text-light-on-surface-variant dark:text-dark-on-surface-variant shrink-0"
                      />
                    </button>
                  );
                })}
              </div>
            </section>
          </>
        )}

        {/* Donate Card */}
        <button
          type="button"
          onClick={() => handleSelect('donate')}
          className={`w-full rounded-md border border-b-2 shadow-sm px-3 py-2.5 flex items-center justify-between gap-2 text-left tactile-press ${
            activeScreen === 'donate'
              ? 'bg-warning-container dark:bg-dark-warning-container border-warning dark:border-dark-warning'
              : 'bg-light-surface-container-low dark:bg-dark-surface-container border-light-outline-variant dark:border-dark-outline-variant hover:bg-light-surface-container dark:hover:bg-dark-surface-container-high'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-md bg-warning-container dark:bg-dark-warning-container text-on-warning-container dark:text-dark-on-warning-container flex items-center justify-center shrink-0">
              <Icon name="local_cafe" size={18} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-label text-label-lg text-light-on-surface dark:text-dark-on-surface truncate">
                Donate, buat ngopi
              </span>
              <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant truncate">
                Terima kasih telah mendukung kami
              </span>
            </div>
          </div>
          <Icon
            name="chevron_right"
            size={16}
            className="text-light-on-surface-variant dark:text-dark-on-surface-variant shrink-0"
          />
        </button>
      </div>

      {/* Bottom Theme Toggle & User Profile */}
      <footer className="flex flex-col gap-2.5 pt-2 border-t border-light-outline-variant dark:border-dark-outline-variant pb-[env(safe-area-inset-bottom)] lg:pb-0">
        {/* Theme Switcher */}
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-lg bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant">
          <button
            type="button"
            onClick={() => onToggleTheme(false)}
            className={`min-h-[36px] rounded-md px-2.5 py-1.5 flex items-center justify-center gap-1.5 font-label text-label-md transition-all tactile-press ${
              !isDark
                ? 'bg-light-surface-container-lowest text-light-primary border border-light-outline-variant shadow-sm'
                : 'text-dark-on-surface-variant hover:text-dark-on-surface'
            }`}
          >
            <Icon name="light_mode" size={16} filled={!isDark} />
            <span>Terang</span>
          </button>
          <button
            type="button"
            onClick={() => onToggleTheme(true)}
            className={`min-h-[36px] rounded-md px-2.5 py-1.5 flex items-center justify-center gap-1.5 font-label text-label-md transition-all tactile-press ${
              isDark
                ? 'bg-dark-surface-container-high text-dark-primary border border-dark-outline-variant shadow-sm'
                : 'text-light-on-surface-variant hover:text-light-on-surface'
            }`}
          >
            <Icon name="dark_mode" size={16} filled={isDark} />
            <span>Gelap</span>
          </button>
        </div>

        {/* User Footer Card */}
        <div className="rounded-md bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-sm p-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-light-primary dark:bg-dark-primary text-light-on-primary dark:text-dark-on-primary flex items-center justify-center font-title text-title-sm shrink-0">
              {initials}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-label text-label-lg text-light-on-surface dark:text-dark-on-surface truncate">
                {session.name}
              </span>
              <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant truncate">
                KIOS {session.kiosName}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            aria-label="Keluar dari akun"
            title="Keluar"
            className="min-w-[38px] min-h-[38px] rounded-md bg-light-surface-container-lowest dark:bg-dark-surface-container-high border border-light-outline-variant dark:border-dark-outline-variant border-b-2 text-light-error dark:text-dark-error flex items-center justify-center hover:bg-light-error-container/40 dark:hover:bg-dark-error-container/40 tactile-press shrink-0"
          >
            <Icon name="logout" size={18} />
          </button>
        </div>
      </footer>
    </div>
  );
};
