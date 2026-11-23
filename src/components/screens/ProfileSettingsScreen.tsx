import React, { useRef, useState } from 'react';
import { AuthSession } from '../../types';
import { ContextualHeader, Icon } from '../ui/Primitives';

interface ProfileSettingsScreenProps {
  session: AuthSession;
  onUpdateProfile: (updates: Partial<AuthSession>) => void;
  onBack: () => void;
  onOpenSecuritySettings: () => void;
  onToast: (msg: string) => void;
}

const KIOS_OPTIONS = [
  { name: 'PARUNG PANJANG', code: '15576' },
  { name: 'BABAKAN', code: '15578' },
  { name: 'CILEUNGSI', code: '15580' },
  { name: 'CIBINONG', code: '15582' },
];

function resizeImageToDataUrl(file: File, maxSize = 360): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file gambar'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Format gambar tidak valid'));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const side = Math.min(img.width, img.height);
        const sx = (img.width - side) / 2;
        const sy = (img.height - side) / 2;
        canvas.width = maxSize;
        canvas.height = maxSize;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas tidak tersedia'));
          return;
        }
        ctx.drawImage(img, sx, sy, side, side, 0, 0, maxSize, maxSize);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export const ProfileSettingsScreen: React.FC<ProfileSettingsScreenProps> = ({
  session,
  onUpdateProfile,
  onBack,
  onOpenSecuritySettings,
  onToast,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [avatarUrl, setAvatarUrl] = useState<string>(session.avatarUrl || '');
  const [name, setName] = useState<string>(session.name);
  const [phone, setPhone] = useState<string>(session.phone || '0812-8490-1122');
  const [email, setEmail] = useState<string>(
    session.email || 'bani.munggaran07@gmail.com'
  );
  const [jabatan, setJabatan] = useState<string>(
    session.jabatan ||
      (session.role === 'SUPERVISOR' ? 'Supervisor Kios' : 'Marketing Lapangan')
  );
  const [kiosName, setKiosName] = useState<string>(session.kiosName);
  const [alamatKios, setAlamatKios] = useState<string>(
    session.alamatKios || 'Jl. Raya Parung Panjang No. 45, Kab. Bogor'
  );
  const [bio, setBio] = useState<string>(
    session.bio || 'Fokus penagihan BQ & akuisisi RO Danastra area Bogor Barat.'
  );
  const [notifPenagihan, setNotifPenagihan] = useState<boolean>(
    session.notifPenagihan ?? true
  );
  const [showWaOnShare, setShowWaOnShare] = useState<boolean>(
    session.showWaOnShare ?? true
  );
  const [processingPhoto, setProcessingPhoto] = useState(false);

  const initials = (name || session.name)
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProcessingPhoto(true);
    try {
      const dataUrl = await resizeImageToDataUrl(file, 360);
      setAvatarUrl(dataUrl);
      onUpdateProfile({ avatarUrl: dataUrl });
      onToast('Foto profil berhasil diperbarui');
    } catch {
      onToast('Gagal memproses foto profil');
    } finally {
      setProcessingPhoto(false);
      e.target.value = '';
    }
  };

  const handleRemovePhoto = () => {
    setAvatarUrl('');
    onUpdateProfile({ avatarUrl: '' });
    onToast('Foto profil dihapus');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim().toUpperCase() || session.name;
    const matchedKios = KIOS_OPTIONS.find((k) => k.name === kiosName);
    onUpdateProfile({
      name: trimmedName,
      avatarUrl,
      phone: phone.trim(),
      email: email.trim(),
      jabatan: jabatan.trim(),
      kiosName,
      kiosCode: matchedKios?.code || session.kiosCode,
      alamatKios: alamatKios.trim(),
      bio: bio.trim(),
      notifPenagihan,
      showWaOnShare,
    });
    onToast('Pengaturan profil berhasil disimpan');
  };

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <ContextualHeader
        title="Pengaturan Profil"
        subtitle="Foto profil, no. telepon & identitas akun"
        onBack={onBack}
      />

      <main className="px-4 py-4 pb-10 flex flex-col gap-4 max-w-3xl w-full mx-auto">
        {/* Profile Photo & Identity Hero Card */}
        <section className="rounded-lg bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-md p-4 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative shrink-0">
            <div className="w-24 h-24 rounded-2xl bg-light-primary dark:bg-dark-primary text-light-on-primary dark:text-dark-on-primary border-2 border-light-outline-variant dark:border-dark-outline-variant shadow-md flex items-center justify-center overflow-hidden">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={`Foto profil ${name}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-display text-display-md">{initials}</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Ubah foto profil"
              className="absolute -bottom-1.5 -right-1.5 w-9 h-9 rounded-full bg-light-primary dark:bg-dark-primary text-light-on-primary dark:text-dark-on-primary border-2 border-light-surface-container-lowest dark:border-dark-surface-container-low shadow-md flex items-center justify-center tactile-press"
            >
              <Icon name="photo_camera" size={18} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </div>

          <div className="flex-1 min-w-0 flex flex-col items-center sm:items-start text-center sm:text-left gap-1.5">
            <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
              <h2 className="font-title text-title-md text-light-on-surface dark:text-dark-on-surface truncate">
                {name || session.name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-light-secondary-container dark:bg-dark-secondary-container text-light-on-secondary-container dark:text-dark-on-secondary-container font-label text-label-sm">
                {session.role}
              </span>
            </div>
            <span className="font-mono text-mono-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
              CS ID {session.csId} · KIOS {kiosName} ({session.kiosCode})
            </span>

            <div className="flex items-center gap-2 pt-1.5">
              <button
                type="button"
                disabled={processingPhoto}
                onClick={() => fileInputRef.current?.click()}
                className="min-h-[38px] rounded-md bg-light-primary dark:bg-dark-primary border border-light-primary dark:border-dark-primary border-b-2 px-3 py-1.5 flex items-center gap-1.5 font-label text-label-md text-light-on-primary dark:text-dark-on-primary tactile-press"
              >
                <Icon name="upload" size={16} />
                <span>{processingPhoto ? 'Memproses...' : 'Pilih Foto'}</span>
              </button>
              {avatarUrl && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="min-h-[38px] rounded-md bg-light-error-container/70 dark:bg-dark-error-container/60 border border-light-error/30 border-b-2 px-3 py-1.5 flex items-center gap-1 font-label text-label-md text-light-error dark:text-dark-error tactile-press"
                >
                  <Icon name="delete" size={16} />
                  <span>Hapus</span>
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Form Detail Kontak & Informasi Akun */}
        <form
          onSubmit={handleSave}
          className="rounded-lg bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-md p-4 flex flex-col gap-3.5"
        >
          <div className="flex items-center gap-2 pb-1 border-b border-light-outline-variant dark:border-dark-outline-variant">
            <Icon
              name="badge"
              size={18}
              className="text-light-primary dark:text-dark-primary"
            />
            <h3 className="font-title text-title-sm text-light-on-surface dark:text-dark-on-surface">
              Informasi Pribadi &amp; Kontak
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="font-label text-label-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
                Nama Lengkap
              </span>
              <div className="relative">
                <Icon
                  name="person"
                  size={18}
                  className="text-light-on-surface-variant dark:text-dark-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full min-h-[44px] rounded-md bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant pl-9 pr-3 py-2 font-body text-body-md text-light-on-surface dark:text-dark-on-surface focus:border-light-primary dark:focus:border-dark-primary focus:outline-none"
                />
              </div>
            </label>

            <label className="flex flex-col gap-1">
              <span className="font-label text-label-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
                No. Telepon / WhatsApp
              </span>
              <div className="relative">
                <Icon
                  name="call"
                  size={18}
                  className="text-light-on-surface-variant dark:text-dark-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0812-xxxx-xxxx"
                  className="w-full min-h-[44px] rounded-md bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant pl-9 pr-3 py-2 font-mono text-body-md text-light-on-surface dark:text-dark-on-surface focus:border-light-primary dark:focus:border-dark-primary focus:outline-none"
                />
              </div>
            </label>

            <label className="flex flex-col gap-1">
              <span className="font-label text-label-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
                Alamat Email
              </span>
              <div className="relative">
                <Icon
                  name="mail"
                  size={18}
                  className="text-light-on-surface-variant dark:text-dark-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full min-h-[44px] rounded-md bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant pl-9 pr-3 py-2 font-body text-body-md text-light-on-surface dark:text-dark-on-surface focus:border-light-primary dark:focus:border-dark-primary focus:outline-none"
                />
              </div>
            </label>

            <label className="flex flex-col gap-1">
              <span className="font-label text-label-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
                Jabatan
              </span>
              <div className="relative">
                <Icon
                  name="work"
                  size={18}
                  className="text-light-on-surface-variant dark:text-dark-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                />
                <input
                  type="text"
                  value={jabatan}
                  onChange={(e) => setJabatan(e.target.value)}
                  className="w-full min-h-[44px] rounded-md bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant pl-9 pr-3 py-2 font-body text-body-md text-light-on-surface dark:text-dark-on-surface focus:border-light-primary dark:focus:border-dark-primary focus:outline-none"
                />
              </div>
            </label>

            <label className="flex flex-col gap-1">
              <span className="font-label text-label-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
                Penempatan Kios
              </span>
              <div className="relative">
                <Icon
                  name="store"
                  size={18}
                  className="text-light-on-surface-variant dark:text-dark-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                />
                <select
                  value={kiosName}
                  onChange={(e) => setKiosName(e.target.value)}
                  className="w-full min-h-[44px] rounded-md bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant pl-9 pr-3 py-2 font-body text-body-md text-light-on-surface dark:text-dark-on-surface focus:border-light-primary dark:focus:border-dark-primary focus:outline-none"
                >
                  {KIOS_OPTIONS.map((k) => (
                    <option key={k.code} value={k.name}>
                      {k.name} · {k.code}
                    </option>
                  ))}
                </select>
              </div>
            </label>

            <label className="flex flex-col gap-1">
              <span className="font-label text-label-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
                CS ID Akun
              </span>
              <div className="relative">
                <Icon
                  name="fingerprint"
                  size={18}
                  className="text-light-on-surface-variant dark:text-dark-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                />
                <input
                  type="text"
                  disabled
                  value={session.csId}
                  className="w-full min-h-[44px] rounded-md bg-light-surface-container dark:bg-dark-surface-container-high border border-light-outline-variant dark:border-dark-outline-variant pl-9 pr-3 py-2 font-mono text-body-md text-light-on-surface-variant dark:text-dark-on-surface-variant opacity-80 cursor-not-allowed"
                />
              </div>
            </label>
          </div>

          <label className="flex flex-col gap-1">
            <span className="font-label text-label-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
              Alamat Kios / Wilayah Tugas
            </span>
            <input
              type="text"
              value={alamatKios}
              onChange={(e) => setAlamatKios(e.target.value)}
              className="w-full min-h-[44px] rounded-md bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant px-3 py-2 font-body text-body-md text-light-on-surface dark:text-dark-on-surface focus:border-light-primary dark:focus:border-dark-primary focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="font-label text-label-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
              Catatan / Bio Singkat
            </span>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full rounded-md bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant p-3 font-body text-body-md text-light-on-surface dark:text-dark-on-surface focus:border-light-primary dark:focus:border-dark-primary focus:outline-none"
            />
          </label>

          {/* Preferences inside Form */}
          <div className="pt-1 flex flex-col gap-2">
            <span className="font-label text-label-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
              Preferensi Operasional
            </span>

            <button
              type="button"
              onClick={() => setNotifPenagihan((v) => !v)}
              className="w-full min-h-[44px] rounded-md bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant px-3.5 py-2 flex items-center justify-between gap-2 tactile-press"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  name="notifications_active"
                  size={18}
                  className="text-light-primary dark:text-dark-primary shrink-0"
                />
                <span className="font-label text-label-md text-light-on-surface dark:text-dark-on-surface truncate">
                  Pengingat Penagihan Harian
                </span>
              </div>
              <div
                className={`w-10 h-5 rounded-full transition-colors p-0.5 flex items-center shrink-0 ${
                  notifPenagihan
                    ? 'bg-light-primary dark:bg-dark-primary justify-end'
                    : 'bg-light-surface-variant dark:bg-dark-surface-variant justify-start'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-white shadow-xs" />
              </div>
            </button>

            <button
              type="button"
              onClick={() => setShowWaOnShare((v) => !v)}
              className="w-full min-h-[44px] rounded-md bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant px-3.5 py-2 flex items-center justify-between gap-2 tactile-press"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  name="chat"
                  size={18}
                  className="text-success dark:text-dark-success shrink-0"
                />
                <span className="font-label text-label-md text-light-on-surface dark:text-dark-on-surface truncate">
                  Sertakan No. WA pada Kartu Share Taksasi
                </span>
              </div>
              <div
                className={`w-10 h-5 rounded-full transition-colors p-0.5 flex items-center shrink-0 ${
                  showWaOnShare
                    ? 'bg-light-primary dark:bg-dark-primary justify-end'
                    : 'bg-light-surface-variant dark:bg-dark-surface-variant justify-start'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-white shadow-xs" />
              </div>
            </button>
          </div>

          <button
            type="submit"
            className="w-full min-h-[48px] mt-1 rounded-md bg-light-primary dark:bg-dark-primary border border-light-primary dark:border-dark-primary border-b-2 shadow-md px-4 py-2.5 flex items-center justify-center gap-2 font-label text-label-lg text-light-on-primary dark:text-dark-on-primary tactile-press"
          >
            <Icon name="save" size={18} />
            <span>Simpan Perubahan Profil</span>
          </button>
        </form>

        {/* Shortcut to Security & PIN */}
        <button
          type="button"
          onClick={onOpenSecuritySettings}
          className="w-full rounded-lg bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-sm px-4 py-3 flex items-center justify-between gap-3 text-left hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container tactile-press"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-md bg-light-secondary-container dark:bg-dark-secondary-container text-light-on-secondary-container dark:text-dark-on-secondary-container flex items-center justify-center shrink-0">
              <Icon name="lock" size={20} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-label text-label-lg text-light-on-surface dark:text-dark-on-surface">
                Keamanan PIN &amp; Koneksi Server
              </span>
              <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                Kelola PIN login 6 digit dan alamat server
              </span>
            </div>
          </div>
          <Icon
            name="chevron_right"
            size={20}
            className="text-light-on-surface-variant dark:text-dark-on-surface-variant shrink-0"
          />
        </button>
      </main>
    </div>
  );
};
