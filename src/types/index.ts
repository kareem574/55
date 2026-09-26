export type RequestStatus = 'accepted' | 'rejected' | 'pending' | 'ignored';

export interface RiderRequest {
  id: string;
  tabTitle: string;
  timestamp: string;
  riderId: string;
  requestType: string;
  targetTime?: string;
  reason?: string;
  proof?: string;
  status: 'تم الرد' | 'قيد الإنتظار';
  reply: string; // 'مقبول' | 'مرفوض' | 'غير مقبول' | 'شيفت مكسور' | 'متجاهل' ...
  rejectReason?: string;
  statusType: RequestStatus;
}

export interface SheetTab {
  id: string;
  title: string;
  rowCount: number;
  columnCount: number;
  headers: string[];
  rows: (string | number | boolean | null)[][];
  updatedAt: string;
}

export interface SheetDiff {
  id: string;
  sheetTitle: string;
  rowIndex: number;
  columnIndex: number;
  columnName: string;
  oldValue: string;
  newValue: string;
  timestamp: string;
}

export interface SyncStats {
  syncCount: number;
  lastSyncTime: Date | null;
  latencyMs: number;
  status: 'idle' | 'syncing' | 'connected' | 'error';
  errorMessage?: string;
  totalAccepted: number;
  totalRejected: number;
  totalPending: number;
}

export type ThemeId = 'navy-ops' | 'cyber-dark' | 'emerald' | 'amber-gold' | 'modern-slate' | 'clean-light';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  nameEn: string;
  badge: string;
  bg: string;
  cardBg: string;
  cardBorder: string;
  headerBg: string;
  accent: string;
  accentText: string;
  accentGlow: string;
  accentBorder: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  tableHeaderBg: string;
  tableRowHover: string;
  tableBorder: string;
  sidebarBg: string;
}
