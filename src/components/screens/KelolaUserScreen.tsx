import React, { useMemo, useState } from 'react';
import { AppUser, UnclaimedTitipan } from '../../types';
import { BottomSheet, ContextualHeader, Icon } from '../ui/Primitives';

interface KelolaUserScreenProps {
  users: AppUser[];
  titipanList: UnclaimedTitipan[];
  onBack: () => void;
  onAddUser: (user: Omit<AppUser, 'id' | 'initials'>) => void;
  onClaimTitipan: (titipan: UnclaimedTitipan) => void;
  onMoveKios: (userId: string, kiosName: string, kiosCode: string) => void;
  onDeleteUser: (userId: string) => void;
  onToast: (msg: string) => void;
}

export const KelolaUserScreen: React.FC<KelolaUserScreenProps> = ({
  users,
  titipanList,
  onBack,
  onAddUser,
  onClaimTitipan,
  onMoveKios,
  onDeleteUser,
  onToast,
}) => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'Semua' | 'Mktg' | 'SPV'>('Semua');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [moveUser, setMoveUser] = useState<AppUser | null>(null);
  const [pinUser, setPinUser] = useState<AppUser | null>(null);

  // Add user form state
  const [newName, setNewName] = useState('');
  const [newCsId, setNewCsId] = useState('');
  const [newRole, setNewRole] = useState<'Mktg' | 'SPV'>('Mktg');
  const [newKios, setNewKios] = useState('PARUNG PANJANG');

  // Move kios state
  const [targetKios, setTargetKios] = useState('PARUNG PANJANG');
  const [newPin, setNewPin] = useState('');

  const spvCount = 10 + users.filter((u) => u.role === 'SPV').length;
  const mktgCount = 2 + users.filter((u) => u.role === 'Mktg').length;
  const totalCount = spvCount + mktgCount;

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== 'Semua' && u.role !== roleFilter) return false;
      if (!q) return true;
      return (
        u.name.toLowerCase().includes(q) ||
        u.csId.toLowerCase().includes(q) ||
        u.kiosName.toLowerCase().includes(q)
      );
    });
  }, [users, search, roleFilter]);

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newCsId.trim()) return;
    onAddUser({
      name: newName.trim().toUpperCase(),
      csId: newCsId.trim().toUpperCase(),
      role: newRole,
      roleLabel: newRole === 'SPV' ? 'Supervisor Kios' : 'Marketing Lapangan',
      status: 'AKTIF',
      kiosName: newKios,
      kiosCode: newKios === 'PARUNG PANJANG' ? '15576' : '15578',
      bqCount: 0,
      titipanCount: 0,
      gformCount: 0,
    });
    setNewName('');
    setNewCsId('');
    setAddModalOpen(false);
    onToast('Akun user baru berhasil ditambahkan');
  };

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <ContextualHeader
        title="Kelola User"
        subtitle={`${totalCount} akun aktif · ${titipanList.length} tanpa akun`}
        onBack={onBack}
        rightSlot={
          <button
            type="button"
            onClick={() => setAddModalOpen(true)}
            className="min-h-[38px] rounded-full bg-light-primary dark:bg-dark-primary border border-light-primary dark:border-dark-primary border-b-2 px-3.5 py-1.5 flex items-center gap-1 font-label text-label-md text-light-on-primary dark:text-dark-on-primary shadow-sm tactile-press"
          >
            <Icon name="person_add" size={16} />
            <span>Tambah</span>
          </button>
        }
      />

      <main className="px-4 py-4 pb-10 flex flex-col gap-4 max-w-5xl w-full mx-auto">
        {/* Ringkasan User (4-Column Table Strip) */}
        <section className="rounded-lg bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-md overflow-hidden">
          <div className="px-3.5 py-2 bg-light-surface-container dark:bg-dark-surface-container border-b border-light-outline-variant dark:border-dark-outline-variant">
            <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant tracking-wide">
              RINGKASAN USER
            </span>
          </div>
          <div className="grid grid-cols-4 divide-x divide-light-outline-variant dark:divide-dark-outline-variant text-center">
            <div className="py-2.5 px-2 flex flex-col">
              <span className="font-headline text-headline-sm text-light-on-surface dark:text-dark-on-surface tabular-nums">
                {totalCount}
              </span>
              <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                Total
              </span>
            </div>
            <div className="py-2.5 px-2 flex flex-col">
              <span className="font-headline text-headline-sm text-success dark:text-dark-success tabular-nums">
                {totalCount}
              </span>
              <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                Aktif
              </span>
            </div>
            <div className="py-2.5 px-2 flex flex-col">
              <span className="font-headline text-headline-sm text-light-primary dark:text-dark-primary tabular-nums">
                {mktgCount}
              </span>
              <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                Mktg
              </span>
            </div>
            <div className="py-2.5 px-2 flex flex-col">
              <span className="font-headline text-headline-sm text-light-secondary dark:text-dark-secondary tabular-nums">
                {spvCount}
              </span>
              <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                SPV
              </span>
            </div>
          </div>
        </section>

        {/* Data Titipan Box */}
        {titipanList.length > 0 && (
          <section className="rounded-lg bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-warning/40 dark:border-dark-warning/40 border-b-2 shadow-md p-3.5 flex flex-col gap-2.5">
            <header className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Icon
                  name="link_off"
                  size={18}
                  className="text-warning dark:text-dark-warning"
                />
                <span className="font-title text-title-sm text-light-on-surface dark:text-dark-on-surface">
                  Data Titipan (Belum Punya Akun)
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-warning-container dark:bg-dark-warning-container text-on-warning-container dark:text-dark-on-warning-container font-label text-label-sm tabular-nums">
                {titipanList.length}
              </span>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {titipanList.map((tit) => (
                <div
                  key={tit.id}
                  className="rounded-md bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant px-3 py-2 flex items-center justify-between gap-2"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="font-label text-label-md text-light-on-surface dark:text-dark-on-surface truncate">
                      {tit.name}
                    </span>
                    <span className="font-mono text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant tabular-nums">
                      {tit.csId} · BQ {tit.bqCount} · Gform {tit.gformCount}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClaimTitipan(tit);
                      onToast(`Akun ${tit.name} berhasil diaktifkan`);
                    }}
                    aria-label={`Aktifkan akun ${tit.name}`}
                    className="w-9 h-9 rounded-md bg-light-primary dark:bg-dark-primary text-light-on-primary dark:text-dark-on-primary flex items-center justify-center shrink-0 tactile-press"
                  >
                    <Icon name="add" size={18} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Search & Role Filter */}
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
              placeholder="Cari nama, CS ID, atau kios..."
              className="w-full min-h-[44px] rounded-lg bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-sm pl-10 pr-4 py-2 font-body text-body-md text-light-on-surface dark:text-dark-on-surface focus:border-light-primary dark:focus:border-dark-primary focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            {[
              { id: 'Semua' as const, label: 'Semua' },
              { id: 'Mktg' as const, label: 'Marketing' },
              { id: 'SPV' as const, label: 'Supervisor' },
            ].map((chip) => {
              const active = roleFilter === chip.id;
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setRoleFilter(chip.id)}
                  className={`min-h-[38px] px-4 py-1.5 rounded-full border border-b-2 shadow-sm font-label text-label-md tactile-press ${
                    active
                      ? 'bg-light-primary dark:bg-dark-primary border-light-primary dark:border-dark-primary text-light-on-primary dark:text-dark-on-primary'
                      : 'bg-light-surface-container-lowest dark:bg-dark-surface-container-low border-light-outline-variant dark:border-dark-outline-variant text-light-on-surface-variant dark:text-dark-on-surface-variant'
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* User List */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredUsers.map((user) => (
            <article
              key={user.id}
              className="rounded-lg bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-md p-3.5 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-light-primary dark:bg-dark-primary text-light-on-primary dark:text-dark-on-primary flex items-center justify-center font-title text-title-sm shrink-0">
                    {user.initials}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-label text-label-lg text-light-on-surface dark:text-dark-on-surface truncate">
                        {user.name}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-light-secondary-container dark:bg-dark-secondary-container text-light-on-secondary-container dark:text-dark-on-secondary-container font-label text-label-sm shrink-0">
                        {user.role}
                      </span>
                    </div>
                    <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                      {user.roleLabel}
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-success-container dark:bg-dark-success-container text-on-success-container dark:text-dark-on-success-container font-label text-label-sm shrink-0">
                  {user.status}
                </span>
              </div>

              <div className="rounded-md bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant divide-y divide-light-outline-variant dark:divide-dark-outline-variant overflow-hidden">
                <div className="px-3 py-1.5 flex items-center justify-between">
                  <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                    CS ID
                  </span>
                  <span className="font-mono text-mono-sm text-light-on-surface dark:text-dark-on-surface">
                    {user.csId}
                  </span>
                </div>
                <div className="px-3 py-1.5 flex items-center justify-between">
                  <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                    Kios · Kode
                  </span>
                  <span className="font-label text-label-md text-light-on-surface dark:text-dark-on-surface">
                    {user.kiosName} · {user.kiosCode}
                  </span>
                </div>
                <div className="px-3 py-1.5 flex items-center justify-between">
                  <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                    Data BQ
                  </span>
                  <span className="font-mono text-mono-sm text-light-primary dark:text-dark-primary tabular-nums">
                    {user.bqCount}
                  </span>
                </div>
                <div className="px-3 py-1.5 flex items-center justify-between">
                  <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                    Titipan · Gform
                  </span>
                  <span className="font-mono text-mono-sm text-light-on-surface dark:text-dark-on-surface tabular-nums">
                    {user.titipanCount} · {user.gformCount}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMoveUser(user);
                    setTargetKios(user.kiosName);
                  }}
                  className="min-h-[40px] rounded-md bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant border-b-2 px-2 py-1.5 flex items-center justify-center gap-1 font-label text-label-sm text-light-on-surface dark:text-dark-on-surface tactile-press"
                >
                  <Icon name="store" size={15} />
                  <span>Pindah Kios</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPinUser(user);
                    setNewPin('');
                  }}
                  className="min-h-[40px] rounded-md bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant border-b-2 px-2 py-1.5 flex items-center justify-center gap-1 font-label text-label-sm text-light-on-surface dark:text-dark-on-surface tactile-press"
                >
                  <Icon name="key" size={15} />
                  <span>Ganti Sandi</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDeleteUser(user.id);
                    onToast(`Akun ${user.name} dihapus`);
                  }}
                  className="min-h-[40px] rounded-md bg-light-error-container/60 dark:bg-dark-error-container/50 border border-light-error/30 border-b-2 px-2 py-1.5 flex items-center justify-center gap-1 font-label text-label-sm text-light-error dark:text-dark-error tactile-press"
                >
                  <Icon name="delete" size={15} />
                  <span>Hapus</span>
                </button>
              </div>
            </article>
          ))}
        </section>
      </main>

      {/* Add User Sheet */}
      <BottomSheet
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Tambah Akun Baru"
        subtitle="Daftarkan CS ID marketing atau supervisor"
      >
        <form onSubmit={handleCreateUser} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="font-label text-label-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
              Nama Lengkap
            </span>
            <input
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Contoh: RIZKY PRATAMA"
              className="w-full min-h-[44px] rounded-md bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant px-3 py-2 text-body-md focus:border-light-primary dark:focus:border-dark-primary focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-label text-label-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
              CS ID
            </span>
            <input
              type="text"
              required
              value={newCsId}
              onChange={(e) => setNewCsId(e.target.value)}
              placeholder="Contoh: S000099123"
              className="w-full min-h-[44px] rounded-md bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant px-3 py-2 font-mono text-body-md focus:border-light-primary dark:focus:border-dark-primary focus:outline-none"
            />
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['Mktg', 'SPV'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setNewRole(r)}
                className={`min-h-[42px] rounded-md border border-b-2 font-label text-label-md tactile-press ${
                  newRole === r
                    ? 'bg-light-primary dark:bg-dark-primary border-light-primary text-light-on-primary dark:text-dark-on-primary'
                    : 'bg-light-surface-container-low dark:bg-dark-surface-container border-light-outline-variant dark:border-dark-outline-variant'
                }`}
              >
                {r === 'Mktg' ? 'Marketing' : 'Supervisor'}
              </button>
            ))}
          </div>
          <label className="flex flex-col gap-1">
            <span className="font-label text-label-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
              Kios Penempatan
            </span>
            <select
              value={newKios}
              onChange={(e) => setNewKios(e.target.value)}
              className="w-full min-h-[44px] rounded-md bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant px-3 py-2 text-body-md focus:border-light-primary dark:focus:border-dark-primary focus:outline-none"
            >
              <option value="PARUNG PANJANG">PARUNG PANJANG (15576)</option>
              <option value="BABAKAN">BABAKAN (15578)</option>
            </select>
          </label>
          <button
            type="submit"
            className="w-full min-h-[46px] mt-1 rounded-md bg-light-primary dark:bg-dark-primary border border-light-primary border-b-2 text-light-on-primary dark:text-dark-on-primary font-label text-label-lg tactile-press"
          >
            Simpan Akun
          </button>
        </form>
      </BottomSheet>

      {/* Pindah Kios Sheet */}
      <BottomSheet
        open={Boolean(moveUser)}
        onClose={() => setMoveUser(null)}
        title={`Pindah Kios · ${moveUser?.name || ''}`}
      >
        <div className="flex flex-col gap-3">
          {['PARUNG PANJANG', 'BABAKAN', 'CILEUNGSI'].map((kios) => (
            <button
              key={kios}
              type="button"
              onClick={() => setTargetKios(kios)}
              className={`w-full min-h-[44px] rounded-md border border-b-2 px-3 py-2 flex items-center justify-between tactile-press ${
                targetKios === kios
                  ? 'bg-light-secondary-container dark:bg-dark-secondary-container border-light-primary dark:border-dark-primary'
                  : 'bg-light-surface-container-low dark:bg-dark-surface-container border-light-outline-variant dark:border-dark-outline-variant'
              }`}
            >
              <span className="font-label text-label-lg">{kios}</span>
              {targetKios === kios && <Icon name="check_circle" size={18} filled />}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              if (!moveUser) return;
              const code =
                targetKios === 'PARUNG PANJANG'
                  ? '15576'
                  : targetKios === 'BABAKAN'
                    ? '15578'
                    : '15580';
              onMoveKios(moveUser.id, targetKios, code);
              onToast(`${moveUser.name} dipindahkan ke Kios ${targetKios}`);
              setMoveUser(null);
            }}
            className="w-full min-h-[46px] rounded-md bg-light-primary dark:bg-dark-primary text-light-on-primary dark:text-dark-on-primary font-label text-label-lg tactile-press"
          >
            Konfirmasi Pindah Kios
          </button>
        </div>
      </BottomSheet>

      {/* Ganti Sandi Sheet */}
      <BottomSheet
        open={Boolean(pinUser)}
        onClose={() => setPinUser(null)}
        title={`Reset PIN · ${pinUser?.name || ''}`}
      >
        <div className="flex flex-col gap-3">
          <input
            type="password"
            inputMode="numeric"
            maxLength={6}
            value={newPin}
            onChange={(e) => setNewPin(e.target.value)}
            placeholder="Masukkan PIN baru 6 digit"
            className="w-full min-h-[44px] rounded-md bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant px-3 py-2 font-mono text-body-md tracking-widest focus:border-light-primary dark:focus:border-dark-primary focus:outline-none"
          />
          <button
            type="button"
            onClick={() => {
              if (!pinUser) return;
              onToast(`PIN ${pinUser.name} berhasil direset`);
              setPinUser(null);
            }}
            className="w-full min-h-[46px] rounded-md bg-light-primary dark:bg-dark-primary text-light-on-primary dark:text-dark-on-primary font-label text-label-lg tactile-press"
          >
            Simpan PIN Baru
          </button>
        </div>
      </BottomSheet>
    </div>
  );
};
