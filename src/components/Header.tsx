import React from 'react';
import { User } from 'firebase/auth';
import { 
  Activity, 
  RefreshCw, 
  Pause, 
  Play, 
  Palette, 
  ExternalLink, 
  Database,
  Radio,
  FileSpreadsheet
} from 'lucide-react';
import { ThemeConfig } from '../types';
import { SPREADSHEET_URL, SPREADSHEET_ID } from '../services/sheets';
import { GoogleSignInButton } from './GoogleSignInButton';

interface HeaderProps {
  theme: ThemeConfig;
  onOpenThemeModal: () => void;
  syncIntervalSec: number;
  isPollingActive: boolean;
  onTogglePolling: () => void;
  onManualRefresh: () => void;
  isSyncing: boolean;
  syncCount: number;
  lastSyncTime: Date | null;
  hasChangesInLastTick: boolean;
  totalAccepted: number;
  totalRejected: number;
  user?: User | null;
  onLogin?: () => void;
  onLogout?: () => void;
  isAuthLoading?: boolean;
  authError?: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onOpenThemeModal,
  syncIntervalSec,
  isPollingActive,
  onTogglePolling,
  onManualRefresh,
  isSyncing,
  syncCount,
  lastSyncTime,
  hasChangesInLastTick,
  totalAccepted,
  totalRejected,
  user,
  onLogin,
  onLogout,
  isAuthLoading = false,
  authError,
}) => {
  return (
    <header className={`${theme.headerBg} sticky top-0 z-40 transition-colors duration-300 shadow-md`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Brand & App Title with Official Logo Icon */}
          <div className="flex items-center gap-3.5">
            <div className="relative flex items-center justify-center">
              <img
                src="/app-icon.svg"
                alt="أيقونة تشغيل العز مدينة نصر"
                className="w-11 h-11 rounded-xl shadow-lg ring-1 ring-cyan-500/40 object-cover"
              />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-100">
                  تشغيل العز مدينة نصر
                </h1>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${theme.badge}`}>
                  مباشر 1ث
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                  <span>{totalAccepted} مقبول</span>
                  <span>•</span>
                  <span className="text-rose-400">{totalRejected} مرفوض</span>
                </span>
              </div>
              <p className={`text-xs ${theme.textMuted} mt-0.5 flex items-center gap-2`}>
                <span>غرفة العمليات المركزية • متابعة شيتات الطيارين</span>
                <span className="hidden md:inline">• التحديث اللحظي كل {syncIntervalSec} ثانية</span>
              </p>
            </div>
          </div>

          {/* Right/Left Toolbar Actions */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            
            {/* Google Sheets Live Auth Button */}
            {onLogin && onLogout && (
              <GoogleSignInButton
                user={user || null}
                isLoading={isAuthLoading}
                onLogin={onLogin}
                onLogout={onLogout}
                onRefresh={onManualRefresh}
                isSyncing={isSyncing}
                authError={authError}
              />
            )}

            {/* Live Ticker Status */}
            <div className={`hidden lg:flex items-center gap-2.5 px-3 py-1.5 rounded-xl border ${theme.cardBorder} ${theme.cardBg} text-xs`}>
              <div className="relative flex items-center justify-center">
                <span className={`inline-block w-2.5 h-2.5 rounded-full ${isPollingActive ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`} />
                <span className={`absolute inline-block w-2 h-2 rounded-full ${isPollingActive ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold flex items-center gap-1.5">
                  <span className={isPollingActive ? 'text-emerald-400' : 'text-amber-400'}>
                    {isPollingActive ? `نبض المزامنة (${syncIntervalSec}ث)` : 'المزامنة متوقفة'}
                  </span>
                  {hasChangesInLastTick && (
                    <span className="px-1.5 py-0.2 text-[10px] bg-cyan-500 text-black font-extrabold rounded animate-bounce">
                      تحديث الآن!
                    </span>
                  )}
                </span>
                <span className={`text-[10px] ${theme.textMuted}`}>
                  {lastSyncTime ? `آخر دورة: ${lastSyncTime.toLocaleTimeString('ar-EG')}` : 'جاري الفحص...'} (دورات: {syncCount})
                </span>
              </div>
            </div>

            {/* Play/Pause Polling Toggle Button */}
            <button
              onClick={onTogglePolling}
              title={isPollingActive ? 'إيقاف المزامنة اللحظية مؤقتاً' : 'استئناف المزامنة اللحظية (كل 1 ثانية)'}
              className={`p-2 sm:px-3 sm:py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isPollingActive
                  ? `${theme.cardBg} ${theme.cardBorder} hover:border-amber-500/50 hover:text-amber-400`
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {isPollingActive ? (
                <>
                  <Pause className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">إيقاف مؤقت</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span className="hidden sm:inline">تشغيل (1ث)</span>
                </>
              )}
            </button>

            {/* Refresh Manual Button */}
            <button
              onClick={onManualRefresh}
              disabled={isSyncing}
              title="سحب وتحديث البيانات يدوياً الآن"
              className={`p-2 rounded-xl border ${theme.cardBorder} ${theme.cardBg} hover:bg-white/5 transition-all cursor-pointer`}
            >
              <RefreshCw className={`w-4 h-4 ${theme.accentText} ${isSyncing ? 'animate-spin' : ''}`} />
            </button>

            {/* Direct Link to the Google Sheet */}
            <a
              href={SPREADSHEET_URL}
              target="_blank"
              rel="noopener noreferrer"
              title="فتح شيت تشغيل العز مدينة نصر في Google Sheets"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border ${theme.cardBorder} ${theme.cardBg} hover:border-emerald-500/60 text-emerald-400 text-xs font-semibold transition-all`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span className="hidden md:inline">رابط الشيت الأصلي</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {/* Theme Selector Button */}
            <button
              onClick={onOpenThemeModal}
              title="تغيير الثيم الاحترافي"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border ${theme.cardBorder} ${theme.cardBg} hover:border-cyan-500/50 transition-all text-xs font-medium cursor-pointer`}
            >
              <Palette className={`w-4 h-4 ${theme.accentText}`} />
              <span className="hidden sm:inline">الثيمات</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
