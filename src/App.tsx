/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import { AppShell } from './components/layout/AppShell';
import { ActivityLogScreen } from './components/screens/ActivityLogScreen';
import { BqListScreen } from './components/screens/BqListScreen';
import { CariOtrScreen } from './components/screens/CariOtrScreen';
import { CekClopScreen } from './components/screens/CekClopScreen';
import { DashboardScreen } from './components/screens/DashboardScreen';
import { DonateScreen } from './components/screens/DonateScreen';
import { GformListScreen } from './components/screens/GformListScreen';
import { KelolaUserScreen } from './components/screens/KelolaUserScreen';
import { LeaderboardScreen } from './components/screens/LeaderboardScreen';
import { LoginScreen } from './components/screens/LoginScreen';
import { PriceListScreen } from './components/screens/PriceListScreen';
import { RiwayatTaksasiScreen } from './components/screens/RiwayatTaksasiScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { TaksasiCalculatorScreen } from './components/screens/TaksasiCalculatorScreen';
import { TargetMarketingScreen } from './components/screens/TargetMarketingScreen';
import { UploadMasterScreen } from './components/screens/UploadMasterScreen';
import { ToastBanner } from './components/ui/Primitives';
import {
  INITIAL_ACTIVITY_LOGS,
  INITIAL_BQ_CONTRACTS,
  INITIAL_GFORM_PROSPECTS,
  INITIAL_MARKETING_TARGETS,
  INITIAL_TAKSASI_HISTORY,
  INITIAL_TITIPAN,
  INITIAL_USERS,
} from './data/mockData';
import {
  ActivityLogEntry,
  AppUser,
  AuthSession,
  BqContract,
  BqStatus,
  GformProspect,
  GformStatus,
  MarketingTarget,
  OtrUnit,
  ScreenId,
  TaksasiCalculation,
  UnclaimedTitipan,
} from './types';

const PRIMARY_TABS: ScreenId[] = ['dashboard', 'bq', 'gform'];

export default function App() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('smarttaksasi_theme');
      if (saved === 'dark') return true;
      if (saved === 'light') return false;
      return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
    } catch {
      return false;
    }
  });

  const [serverUrl, setServerUrl] = useState<string>('smarttaksasi.my.id');
  const [session, setSession] = useState<AuthSession | null>({
    csId: '68343',
    name: 'BANI MUNGGARAN',
    role: 'SUPERVISOR',
    kiosName: 'PARUNG PANJANG',
    kiosCode: '15576',
    serverUrl: 'smarttaksasi.my.id',
  });

  const [history, setHistory] = useState<ScreenId[]>(['dashboard']);
  const [presetFilter, setPresetFilter] = useState<string | undefined>(undefined);

  // App Data State
  const [bqContracts, setBqContracts] = useState<BqContract[]>(INITIAL_BQ_CONTRACTS);
  const [gformProspects, setGformProspects] = useState<GformProspect[]>(INITIAL_GFORM_PROSPECTS);
  const [targets, setTargets] = useState<MarketingTarget[]>(INITIAL_MARKETING_TARGETS);
  const [users, setUsers] = useState<AppUser[]>(INITIAL_USERS);
  const [titipanList, setTitipanList] = useState<UnclaimedTitipan[]>(INITIAL_TITIPAN);
  const [logs, setLogs] = useState<ActivityLogEntry[]>(INITIAL_ACTIVITY_LOGS);
  const [taksasiHistory, setTaksasiHistory] = useState<TaksasiCalculation[]>(INITIAL_TAKSASI_HISTORY);

  // Calculator prefill context
  const [prefillUnit, setPrefillUnit] = useState<OtrUnit | null>(null);
  const [prefillCustomer, setPrefillCustomer] = useState<{
    name: string;
    contractNumber: string;
    unitName?: string;
  } | null>(null);

  // Toast feedback
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
  }, []);

  useEffect(() => {
    if (!toastMsg) return;
    const t = setTimeout(() => setToastMsg(null), 2400);
    return () => clearTimeout(t);
  }, [toastMsg]);

  // Sync dark mode class + browser status bar theme-color for iOS & Android
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', isDark);
    try {
      localStorage.setItem('smarttaksasi_theme', isDark ? 'dark' : 'light');
    } catch {
      // ignore storage errors
    }
    const metaTheme = document.getElementById('theme-color-meta');
    if (metaTheme) {
      metaTheme.setAttribute('content', isDark ? '#000000' : '#F4F6FA');
    }
  }, [isDark]);

  const activeScreen = history[history.length - 1] || 'dashboard';
  const isPrimaryTab = PRIMARY_TABS.includes(activeScreen);

  const navigate = useCallback((screen: ScreenId, filter?: string) => {
    setPresetFilter(filter);
    setHistory((prev) => {
      if (PRIMARY_TABS.includes(screen)) {
        return [screen];
      }
      if (prev[prev.length - 1] === screen) return prev;
      return [...prev, screen];
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const goBack = useCallback(() => {
    setHistory((prev) => (prev.length > 1 ? prev.slice(0, -1) : ['dashboard']));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const appendLog = useCallback(
    (
      actionType: ActivityLogEntry['actionType'],
      endpoint: string,
      detail: string,
      isMutation = true
    ) => {
      if (!session) return;
      const now = new Date();
      const stamp = `${String(now.getDate()).padStart(2, '0')}/${String(
        now.getMonth() + 1
      ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}`;
      setLogs((prev) => [
        {
          id: `log-${Date.now()}`,
          userName: session.name,
          csId: session.csId,
          role: session.role,
          timestamp: stamp,
          actionType,
          endpoint,
          detail,
          isMutation,
        },
        ...prev,
      ]);
    },
    [session]
  );

  // Handlers
  const handleUpdateBqStatus = (id: string, status: BqStatus, notes?: string) => {
    setBqContracts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status, notes } : c))
    );
    const target = bqContracts.find((c) => c.id === id);
    if (target) {
      appendLog(
        'Ubah Status',
        `PATCH /api/bq/${target.contractNumber.slice(0, 8)}`,
        `Update status BQ ${target.customerName} → ${status}`
      );
    }
  };

  const handleUpdateGformStatus = (
    id: string,
    status: GformStatus,
    notes?: string
  ) => {
    setGformProspects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status, notes } : p))
    );
    const target = gformProspects.find((p) => p.id === id);
    if (target) {
      appendLog(
        'Ubah Status',
        `PATCH /api/gform/${target.contractNumber.slice(0, 8)}`,
        `Follow-up Gform ${target.customerName} → ${status}`
      );
    }
  };

  const handleSaveTaksasi = (calc: TaksasiCalculation) => {
    setTaksasiHistory((prev) => [calc, ...prev]);
    appendLog(
      'Tambah',
      'POST /api/taksasi/simpan',
      `Simpan simulasi ${calc.brandType} (${calc.customerName})`
    );
  };

  const handleUpdateTarget = (
    id: string,
    bqTotal: number,
    bookingTarget: number
  ) => {
    setTargets((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, bqTotal, bookingTarget } : t
      )
    );
    const target = targets.find((t) => t.id === id);
    if (target) {
      appendLog(
        'Target',
        `PATCH /api/target/${target.csId}`,
        `Ubah target ${target.name} (${bqTotal} BQ / ${bookingTarget} bkg)`
      );
    }
  };

  const handleAddUser = (user: Omit<AppUser, 'id' | 'initials'>) => {
    const initials = user.name
      .split(' ')
      .slice(0, 2)
      .map((s) => s[0])
      .join('');
    setUsers((prev) => [
      { ...user, id: `u-${Date.now()}`, initials },
      ...prev,
    ]);
    appendLog('Tambah', 'POST /api/users', `Tambah akun ${user.name} (${user.csId})`);
  };

  const handleClaimTitipan = (tit: UnclaimedTitipan) => {
    const initials = tit.name
      .split(' ')
      .slice(0, 2)
      .map((s) => s[0])
      .join('');
    setTitipanList((prev) => prev.filter((t) => t.id !== tit.id));
    setUsers((prev) => [
      {
        id: `u-${Date.now()}`,
        name: tit.name,
        csId: tit.csId,
        role: 'Mktg',
        roleLabel: 'Marketing Lapangan',
        status: 'AKTIF',
        kiosName: 'PARUNG PANJANG',
        kiosCode: '15576',
        bqCount: tit.bqCount,
        titipanCount: 0,
        gformCount: tit.gformCount,
        initials,
      },
      ...prev,
    ]);
    appendLog('Tambah', 'POST /api/users/claim', `Aktivasi akun titipan ${tit.name}`);
  };

  const handleMoveKios = (userId: string, kiosName: string, kiosCode: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, kiosName, kiosCode } : u))
    );
  };

  const handleDeleteUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    if (target) {
      appendLog('Hapus', `DELETE /api/users/${target.csId}`, `Hapus akun ${target.name}`);
    }
  };

  if (!session) {
    return (
      <MotionConfig reducedMotion="user">
        <ToastBanner message={toastMsg} />
        <LoginScreen
          serverUrl={serverUrl}
          onUpdateServerUrl={(url) => {
            setServerUrl(url);
            showToast(`Server diubah ke ${url}`);
          }}
          onLogin={(newSession) => {
            setSession(newSession);
            setHistory(['dashboard']);
            showToast(`Selamat datang, ${newSession.name}`);
          }}
          isDark={isDark}
          onToggleTheme={setIsDark}
        />
      </MotionConfig>
    );
  }

  const totalBqBadge = 244 + bqContracts.length;

  return (
    <MotionConfig reducedMotion="user">
      <ToastBanner message={toastMsg} />
      <AppShell
        activeScreen={activeScreen}
        onNavigate={(s) => navigate(s)}
        isDark={isDark}
        onToggleTheme={setIsDark}
        session={session}
        onLogout={() => {
          setSession(null);
          showToast('Anda telah keluar');
        }}
        bqCount={totalBqBadge}
        marketingCount={targets.length}
        isPrimaryTab={isPrimaryTab}
        onQuickRefresh={() => showToast('Semua data tersinkronisasi')}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeScreen}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            {activeScreen === 'dashboard' && (
              <DashboardScreen
                bqContracts={bqContracts}
                gformProspects={gformProspects}
                targets={targets}
                onNavigate={navigate}
              />
            )}

            {activeScreen === 'bq' && (
              <BqListScreen
                contracts={bqContracts}
                initialFilter={presetFilter}
                onUpdateStatus={handleUpdateBqStatus}
                onToast={showToast}
                onStartTaksasi={(contract) => {
                  setPrefillUnit(null);
                  setPrefillCustomer({
                    name: contract.customerName,
                    contractNumber: contract.contractNumber,
                    unitName: contract.unitName,
                  });
                  navigate('kalkulator');
                }}
              />
            )}

            {activeScreen === 'gform' && (
              <GformListScreen
                prospects={gformProspects}
                initialFilter={presetFilter}
                onUpdateStatus={handleUpdateGformStatus}
                onToast={showToast}
                onStartTaksasi={(prospect) => {
                  setPrefillUnit(null);
                  setPrefillCustomer({
                    name: prospect.customerName,
                    contractNumber: prospect.contractNumber,
                    unitName: prospect.unitName,
                  });
                  navigate('kalkulator');
                }}
              />
            )}

            {activeScreen === 'kalkulator' && (
              <TaksasiCalculatorScreen
                onBack={goBack}
                onOpenOtr={() => navigate('cari-otr')}
                prefillUnit={prefillUnit}
                prefillCustomer={prefillCustomer}
                onSaveCalculation={handleSaveTaksasi}
                onToast={showToast}
              />
            )}

            {activeScreen === 'riwayat' && (
              <RiwayatTaksasiScreen
                history={taksasiHistory}
                onBack={goBack}
                onNewCalc={() => {
                  setPrefillUnit(null);
                  setPrefillCustomer(null);
                  navigate('kalkulator');
                }}
                onDelete={(id) => {
                  setTaksasiHistory((prev) => prev.filter((i) => i.id !== id));
                  showToast('Riwayat simulasi dihapus');
                }}
              />
            )}

            {activeScreen === 'cari-otr' && (
              <CariOtrScreen
                onBack={goBack}
                onSelectUnitForTaksasi={(unit) => {
                  setPrefillUnit(unit);
                  setPrefillCustomer(null);
                  navigate('kalkulator');
                  showToast(`Unit ${unit.modelName} dipilih`);
                }}
              />
            )}

            {activeScreen === 'cek-clop' && (
              <CekClopScreen onBack={goBack} onToast={showToast} />
            )}

            {activeScreen === 'pricelist' && (
              <PriceListScreen onBack={goBack} onToast={showToast} />
            )}

            {activeScreen === 'target' && (
              <TargetMarketingScreen
                targets={targets}
                onBack={goBack}
                onOpenLeaderboard={() => navigate('leaderboard')}
                onUpdateTarget={handleUpdateTarget}
                onToast={showToast}
              />
            )}

            {activeScreen === 'leaderboard' && (
              <LeaderboardScreen
                targets={targets}
                onBack={goBack}
                onToast={showToast}
              />
            )}

            {activeScreen === 'kelola-user' && (
              <KelolaUserScreen
                users={users}
                titipanList={titipanList}
                onBack={goBack}
                onAddUser={handleAddUser}
                onClaimTitipan={handleClaimTitipan}
                onMoveKios={handleMoveKios}
                onDeleteUser={handleDeleteUser}
                onToast={showToast}
              />
            )}

            {activeScreen === 'log-aktivitas' && (
              <ActivityLogScreen
                logs={logs}
                onBack={goBack}
                onToast={showToast}
              />
            )}

            {activeScreen === 'pengaturan' && (
              <SettingsScreen
                serverUrl={serverUrl}
                onUpdateServerUrl={(url) => {
                  setServerUrl(url);
                  setSession((s) => (s ? { ...s, serverUrl: url } : s));
                }}
                onBack={goBack}
                onToast={showToast}
              />
            )}

            {activeScreen === 'donate' && (
              <DonateScreen onBack={goBack} onToast={showToast} />
            )}

            {activeScreen === 'upload-master' && (
              <UploadMasterScreen onBack={goBack} onToast={showToast} />
            )}
          </motion.div>
        </AnimatePresence>
      </AppShell>
    </MotionConfig>
  );
}
