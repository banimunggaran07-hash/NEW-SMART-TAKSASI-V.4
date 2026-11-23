import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AuthSession, ScreenId } from '../../types';
import { BrandLogo, Icon } from '../ui/Primitives';
import { MenuDrawerContent } from './MenuDrawerContent';

interface AppShellProps {
  activeScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  isDark: boolean;
  onToggleTheme: (dark: boolean) => void;
  session: AuthSession;
  onLogout: () => void;
  bqCount: number;
  marketingCount: number;
  isPrimaryTab: boolean;
  onQuickRefresh: () => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  activeScreen,
  onNavigate,
  isDark,
  onToggleTheme,
  session,
  onLogout,
  bqCount,
  marketingCount,
  isPrimaryTab,
  onQuickRefresh,
  children,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const firstName = session.name.split(' ')[0];

  const bottomTabs: { id: ScreenId; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'bq', label: 'BQ', icon: 'list_alt' },
    { id: 'gform', label: 'Gform', icon: 'assignment' },
  ];

  return (
    <div className="min-h-[100dvh] bg-light-surface dark:bg-dark-surface text-light-on-surface dark:text-dark-on-surface flex">
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-72 shrink-0 sticky top-0 h-[100dvh] border-r border-light-outline-variant dark:border-dark-outline-variant shadow-sm z-30">
        <MenuDrawerContent
          activeScreen={activeScreen}
          onNavigate={onNavigate}
          isDark={isDark}
          onToggleTheme={onToggleTheme}
          session={session}
          onLogout={onLogout}
          bqCount={bqCount}
          marketingCount={marketingCount}
          isDesktopSidebar
        />
      </aside>

      {/* Mobile Slide-Over Menu Drawer (Screen 13) */}
      <AnimatePresence>
        {drawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              drag="x"
              dragConstraints={{ left: -280, right: 0 }}
              dragElastic={0.08}
              onDragEnd={(_, info) => {
                if (info.offset.x < -70 || info.velocity.x < -300) {
                  setDrawerOpen(false);
                }
              }}
              className="relative z-10 w-[84vw] max-w-[330px] h-full border-r border-light-outline-variant dark:border-dark-outline-variant shadow-2xl overflow-hidden"
            >
              <MenuDrawerContent
                activeScreen={activeScreen}
                onNavigate={onNavigate}
                onClose={() => setDrawerOpen(false)}
                isDark={isDark}
                onToggleTheme={onToggleTheme}
                session={session}
                onLogout={onLogout}
                bqCount={bqCount}
                marketingCount={marketingCount}
              />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Main Column */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Primary Tab Top App Bar (Screens 1, 2, 3 & Desktop Top Bar) */}
        {isPrimaryTab && (
          <header className="sticky top-0 z-30 bg-light-surface-container-lowest/95 dark:bg-dark-surface-container-low/95 backdrop-blur-md border-b border-light-outline-variant dark:border-dark-outline-variant shadow-sm px-4 pt-safe pb-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                aria-label="Buka menu navigasi"
                className="lg:hidden inline-flex items-center justify-center min-w-[40px] min-h-[40px] w-10 h-10 rounded-full bg-light-surface-container-lowest dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-sm text-light-on-surface dark:text-dark-on-surface hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container-high tactile-press shrink-0"
              >
                <Icon name="menu" size={20} />
              </button>

              <div className="lg:hidden w-9 h-9 rounded-md bg-light-surface-container-lowest dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-sm p-0.5 flex items-center justify-center overflow-hidden shrink-0">
                <BrandLogo />
              </div>

              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-title text-title-sm text-light-on-surface dark:text-dark-on-surface truncate">
                    Halo, {firstName}
                  </span>
                  <span
                    role="status"
                    aria-label="Server terhubung"
                    className="inline-block w-2 h-2 rounded-full bg-success dark:bg-dark-success shrink-0"
                  />
                </div>
                <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant truncate">
                  {session.role} · Kios {session.kiosName}
                </span>
              </div>
            </div>

            {/* Desktop Primary Quick Switcher Pills + Right Controls */}
            <div className="flex items-center gap-1.5 shrink-0 relative">
              <div className="hidden lg:flex items-center gap-1 p-1 rounded-full bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant mr-2">
                {bottomTabs.map((tab) => {
                  const active = activeScreen === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => onNavigate(tab.id)}
                      className={`px-3.5 py-1.5 rounded-full font-label text-label-md flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                        active
                          ? 'bg-light-primary dark:bg-dark-primary text-light-on-primary dark:text-dark-on-primary shadow-sm'
                          : 'text-light-on-surface-variant dark:text-dark-on-surface-variant hover:text-light-on-surface dark:hover:text-dark-on-surface'
                      }`}
                    >
                      <Icon name={tab.icon} size={16} filled={active} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => onToggleTheme(!isDark)}
                aria-label={isDark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
                className="inline-flex items-center justify-center min-w-[40px] min-h-[40px] w-10 h-10 rounded-full bg-light-surface-container-lowest dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-sm text-light-on-surface-variant dark:text-dark-on-surface-variant hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container-high tactile-press"
              >
                <motion.div
                  key={isDark ? 'sun' : 'moon'}
                  initial={{ rotate: -45, opacity: 0.6 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Icon name={isDark ? 'light_mode' : 'dark_mode'} size={18} />
                </motion.div>
              </button>

              <button
                type="button"
                onClick={() => setMoreMenuOpen((prev) => !prev)}
                aria-label="Opsi lainnya"
                aria-expanded={moreMenuOpen}
                className="inline-flex items-center justify-center min-w-[40px] min-h-[40px] w-10 h-10 rounded-full bg-light-surface-container-lowest dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-sm text-light-on-surface-variant dark:text-dark-on-surface-variant hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container-high tactile-press"
              >
                <Icon name="more_vert" size={18} />
              </button>

              {/* More Options Popover */}
              <AnimatePresence>
                {moreMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setMoreMenuOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-12 z-50 w-56 rounded-xl bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant shadow-xl p-1.5 flex flex-col gap-0.5"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setMoreMenuOpen(false);
                          onQuickRefresh();
                        }}
                        className="w-full min-h-[40px] px-3 py-2 rounded-lg flex items-center gap-2.5 text-left font-label text-label-md text-light-on-surface dark:text-dark-on-surface hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container"
                      >
                        <Icon name="refresh" size={18} className="text-light-primary dark:text-dark-primary" />
                        <span>Sinkronkan Data</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMoreMenuOpen(false);
                          onNavigate('kalkulator');
                        }}
                        className="w-full min-h-[40px] px-3 py-2 rounded-lg flex items-center gap-2.5 text-left font-label text-label-md text-light-on-surface dark:text-dark-on-surface hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container"
                      >
                        <Icon name="calculate" size={18} className="text-light-primary dark:text-dark-primary" />
                        <span>Kalkulator Taksasi</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMoreMenuOpen(false);
                          onNavigate('leaderboard');
                        }}
                        className="w-full min-h-[40px] px-3 py-2 rounded-lg flex items-center gap-2.5 text-left font-label text-label-md text-light-on-surface dark:text-dark-on-surface hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container"
                      >
                        <Icon name="emoji_events" size={18} className="text-warning dark:text-dark-warning" />
                        <span>Leaderboard Tim</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMoreMenuOpen(false);
                          onNavigate('profil');
                        }}
                        className="w-full min-h-[40px] px-3 py-2 rounded-lg flex items-center gap-2.5 text-left font-label text-label-md text-light-on-surface dark:text-dark-on-surface hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container"
                      >
                        <Icon name="account_circle" size={18} className="text-light-primary dark:text-dark-primary" />
                        <span>Pengaturan Profil</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMoreMenuOpen(false);
                          onNavigate('pengaturan');
                        }}
                        className="w-full min-h-[40px] px-3 py-2 rounded-lg flex items-center gap-2.5 text-left font-label text-label-md text-light-on-surface dark:text-dark-on-surface hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container"
                      >
                        <Icon name="settings" size={18} className="text-light-on-surface-variant dark:text-dark-on-surface-variant" />
                        <span>Pengaturan Server &amp; PIN</span>
                      </button>
                      <hr className="my-1 border-light-outline-variant dark:border-dark-outline-variant" />
                      <button
                        type="button"
                        onClick={() => {
                          setMoreMenuOpen(false);
                          onLogout();
                        }}
                        className="w-full min-h-[40px] px-3 py-2 rounded-lg flex items-center gap-2.5 text-left font-label text-label-md text-light-error dark:text-dark-error hover:bg-light-error-container/40 dark:hover:bg-dark-error-container/40"
                      >
                        <Icon name="logout" size={18} />
                        <span>Keluar Akun</span>
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </header>
        )}

        {/* Screen Content */}
        <div className="flex-1 w-full max-w-6xl mx-auto">
          {children}
        </div>

        {/* Floating Pill Bottom Navigation (Mobile/Tablet Primary Tabs) */}
        {isPrimaryTab && (
          <div className="lg:hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] px-4 pb-safe-nav z-30 pointer-events-none">
            <nav
              aria-label="Navigasi utama"
              className="pointer-events-auto rounded-full bg-light-surface-container-lowest/95 dark:bg-dark-surface-container-low/95 backdrop-blur-md border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-lg px-2 py-1.5 flex items-center justify-between gap-1"
            >
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                aria-label="Menu SmartTaksasi"
                className="w-11 h-11 rounded-full bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant shadow-sm p-1 flex items-center justify-center overflow-hidden shrink-0 tactile-press"
              >
                <BrandLogo />
              </button>

              {bottomTabs.map((tab) => {
                const isActive = activeScreen === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => onNavigate(tab.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`relative flex-1 min-h-[44px] flex flex-col items-center justify-center gap-0.5 py-1 px-2 rounded-full transition-colors tactile-press ${
                      isActive
                        ? 'text-light-primary dark:text-dark-primary'
                        : 'text-light-on-surface-variant dark:text-dark-on-surface-variant hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="floating-nav-pill"
                        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                        className="absolute inset-0 rounded-full bg-light-secondary-container/75 dark:bg-dark-secondary-container/75 border border-light-primary dark:border-dark-primary border-b-2 shadow-sm"
                      />
                    )}
                    <Icon
                      name={tab.icon}
                      size={18}
                      filled={isActive}
                      className="relative z-10"
                    />
                    <span className="relative z-10 font-label text-label-sm whitespace-nowrap">
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};
