import React from 'react';
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
import { User } from '../services/firebase';

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
  currentUser?: User | null;
  isLoggingIn?: boolean;
  onGoogleLogin?: () => void;
  onGoogleLogout?: () => void;
  onOpenImportModal?: () => void;
  onOpenSheetSelector?: () => void;
  spreadsheetId?: string;
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
  currentUser,
  isLoggingIn,
  onGoogleLogin,
  onGoogleLogout,
  onOpenImportModal,
  onOpenSheetSelector,
  spreadsheetId,
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
          <div className="flex items-center gap-2 sm:gap-3">
            
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
              className={`p-2 rounded-xl border ${theme.cardBorder} ${theme.cardBg} hover:bg-white/5 transition-all cursor-pointer flex items-center gap-1.5`}
            >
              <RefreshCw className={`w-4 h-4 ${theme.accentText} ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden xl:inline text-xs font-semibold">تحديث</span>
            </button>

            {/* Google Sheets Account Connection */}
            {currentUser ? (
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || ''}
                    className="w-5 h-5 rounded-full border border-emerald-400"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {(currentUser.displayName || currentUser.email || 'G')[0].toUpperCase()}
                  </div>
                )}
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-[11px] font-bold text-emerald-300 truncate max-w-[110px]">
                    {currentUser.displayName || currentUser.email?.split('@')[0]}
                  </span>
                  <span className="text-[9px] text-emerald-400/80">شيت مباشر</span>
                </div>
                {onGoogleLogout && (
                  <button
                    onClick={onGoogleLogout}
                    title="تسجيل الخروج من Google"
                    className="text-[10px] text-rose-300 hover:text-rose-200 underline cursor-pointer px-1"
                  >
                    خروج
                  </button>
                )}
              </div>
            ) : (
              onGoogleLogin && (
                <button
                  type="button"
                  onClick={onGoogleLogin}
                  disabled={isLoggingIn}
                  title="تسجيل الدخول بحساب Google للربط المباشر مع الشيت"
                  className="px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-100 flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  <span className="hidden md:inline">{isLoggingIn ? 'جاري الاتصال...' : 'ربط Google Sheets'}</span>
                </button>
              )
            )}

            {/* Sheet Selector Modal Button */}
            {onOpenSheetSelector && (
              <button
                type="button"
                onClick={onOpenSheetSelector}
                title="اختيار أو تغيير شيت Google Sheets المراد السحب منه"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border border-cyan-500/40 bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 text-xs font-bold transition-all shadow-sm cursor-pointer`}
              >
                <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
                <span>اختيار الشيت</span>
              </button>
            )}

            {/* Direct Link to the Google Sheet */}
            <a
              href={`https://docs.google.com/spreadsheets/d/${spreadsheetId || SPREADSHEET_ID}/edit`}
              target="_blank"
              rel="noopener noreferrer"
              title="فتح الشيت الحالي في Google Sheets"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border ${theme.cardBorder} ${theme.cardBg} hover:border-emerald-500/60 text-emerald-400 text-xs font-semibold transition-all`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden md:inline">فتح في Google</span>
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
