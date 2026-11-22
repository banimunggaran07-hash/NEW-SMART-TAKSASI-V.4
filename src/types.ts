export type ScreenId =
  | 'dashboard'
  | 'bq'
  | 'gform'
  | 'kalkulator'
  | 'riwayat'
  | 'cari-otr'
  | 'cek-clop'
  | 'pricelist'
  | 'target'
  | 'leaderboard'
  | 'kelola-user'
  | 'log-aktivitas'
  | 'pengaturan'
  | 'donate'
  | 'upload-master'
  | 'rekap-harian';

export type BqStatus = 'Belum Bayar' | 'Sudah Bayar' | 'Janji Bayar';
export type GformStatus = 'Baru' | 'Kontak' | 'Minat' | 'Tolak' | 'RO';

export interface BqContract {
  id: string;
  csId: string;
  marketingName: string;
  customerName: string;
  contractNumber: string;
  dueDate: string;
  installmentNumber: number;
  installmentAmount: number;
  unitName: string;
  plateNumber: string;
  daysLate: number;
  phone: string;
  status: BqStatus;
  promiseDate?: string;
  notes?: string;
}

export interface GformProspect {
  id: string;
  marketingName: string;
  customerName: string;
  contractNumber: string;
  unitName: string;
  plateNumber: string;
  grade: 'GOOD LOYAL' | 'EXCELLENT' | 'REGULER' | 'SILVER';
  remainingTenor: number;
  phone: string;
  status: GformStatus;
  lastUpdated?: string;
  notes?: string;
}

export interface OtrUnit {
  id: string;
  brand: 'Honda' | 'Yamaha' | 'Suzuki' | 'Tanpa Brand';
  year: number;
  groupType: string;
  modelName: string;
  otrPrice: number;
  description: string;
  objectType: string;
  vehicleCode: string;
}

export interface ClopRecord {
  contractNumber: string;
  customerName: string;
  category:
    | 'ABADI'
    | 'EX ABODEMENT'
    | 'BAYAR 1'
    | 'ABODEMENT 3 BULAN'
    | 'ABODEMENT 4 BULAN'
    | 'PENDATANG BARU';
  branch: string;
  status: 'VALID' | 'REVIEW' | 'NON-ELIGIBLE';
  lastPaymentDate: string;
  maxLtvBoost: string;
  note: string;
}

export interface MarketingTarget {
  id: string;
  csId: string;
  name: string;
  initials: string;
  bqDone: number;
  bqTotal: number;
  bookingDone: number;
  bookingTarget: number;
  roCount: number;
  prospectCount: number;
  score: number;
}

export interface AppUser {
  id: string;
  name: string;
  csId: string;
  role: 'SPV' | 'Mktg';
  roleLabel: string;
  status: 'AKTIF' | 'NONAKTIF';
  kiosName: string;
  kiosCode: string;
  bqCount: number;
  titipanCount: number;
  gformCount: number;
  initials: string;
}

export interface UnclaimedTitipan {
  id: string;
  name: string;
  csId: string;
  bqCount: number;
  gformCount: number;
}

export interface ActivityLogEntry {
  id: string;
  userName: string;
  csId: string;
  role: 'SUPERVISOR' | 'MARKETING';
  timestamp: string;
  actionType: 'Tambah' | 'Ubah Status' | 'Login' | 'Target' | 'Hapus' | 'Sync';
  endpoint: string;
  detail: string;
  isMutation: boolean;
}

export interface TaksasiCalculation {
  id: string;
  createdAt: string;
  customerName: string;
  contractNumber: string;
  brandType: string;
  otrPrice: number;
  year: number;
  odometer?: string;
  mode: 'Reguler' | 'Awda';
  customerType: 'New Cust' | 'RO';
  bpkbSameName: boolean;
  taxYearsDead: number;
  kalengDead: boolean;
  hasFaktur: boolean;
  tenor: 6 | 8 | 12 | 16 | 18 | 24;
  isTopUp: boolean;
  ltvPercent: number;
  plafond: number;
  installment: number;
  deductions: {
    sisaHutang: number;
    denda: number;
    collFee: number;
    meterai: number;
    biayaTopUp: number;
    pajakAdjustment: number;
  };
  totalDeductions: number;
  netDisbursement: number;
}

export interface AuthSession {
  csId: string;
  name: string;
  role: 'SUPERVISOR' | 'MARKETING';
  kiosName: string;
  kiosCode: string;
  serverUrl: string;
}
