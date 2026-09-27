import React, { useState } from 'react';
import { 
  RefreshCw, 
  ExternalLink, 
  CheckCircle2, 
  FolderOpen, 
  HardDrive,
  AlertTriangle
} from 'lucide-react';
import { ThemeConfig } from '../types';
import { User } from 'firebase/auth';

interface SheetUrlSyncBarProps {
  theme: ThemeConfig;
  sheetUrl: string;
  onUpdateSheetUrl: (url: string) => void;
  isSyncing: boolean;
  onManualSync: () => void;
  totalRowsCount: number;
  isSheetRestricted: boolean;
  lastFetchStatusMessage?: string;
  user: User | null;
  onLogin: () => void;
  onOpenPicker: () => void;
  isAuthLoading: boolean;
  authError?: string | null;
}

export const SheetUrlSyncBar: React.FC<SheetUrlSyncBarProps> = ({
  theme,
  sheetUrl,
  onUpdateSheetUrl,
  isSyncing,
  onManualSync,
  totalRowsCount,
  isSheetRestricted,
  lastFetchStatusMessage,
  user,
  onLogin,
  onOpenPicker,
  isAuthLoading,
  authError,
}) => {
  const [urlInput, setUrlInput] = useState(sheetUrl);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      onUpdateSheetUrl(urlInput.trim());
      setIsEditing(false);
    }
  };

  return (
    <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-5">
      {/* Main Bar */}
      <div className={`p-3 sm:p-4 rounded-2xl border ${theme.cardBorder} ${theme.cardBg} shadow-lg transition-all`}>
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Top/Left: Link Info & Status */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400">
              <HardDrive className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="text-xs font-black text-slate-100">
                  سحب بيانات الشيت
                </span>
                
                {user ? (
                  <span className="text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 truncate max-w-[200px]">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span className="truncate">{user.displayName || user.email}</span>
                  </span>
                ) : (
                  <span className="text-[10px] bg-cyan-950/80 text-cyan-300 border border-cyan-700/60 px-1.5 sm:px-2 py-0.5 rounded-full font-bold">
                    جاهز للمزامنة والربط
                  </span>
                )}
              </div>

              {!isEditing ? (
                <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
                  <p className="text-[10px] sm:text-[11px] font-mono text-slate-400 truncate max-w-[220px] sm:max-w-md" dir="ltr">
                    {sheetUrl}
                  </p>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold shrink-0 hover:underline cursor-pointer"
                  >
                    تعديل
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSave} className="flex items-center gap-1.5 mt-1.5 w-full">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    className="flex-1 px-2.5 py-1 text-xs rounded-lg bg-slate-900 border border-cyan-500/50 text-slate-100 font-mono focus:outline-none focus:border-cyan-400"
                    dir="ltr"
                  />
                  <button
                    type="submit"
                    className="px-2.5 py-1 text-xs font-bold rounded-lg bg-cyan-500 text-slate-950 hover:bg-cyan-400 cursor-pointer"
                  >
                    حفظ
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUrlInput(sheetUrl);
                      setIsEditing(false);
                    }}
                    className="px-2 py-1 text-xs text-slate-400 hover:text-white cursor-pointer"
                  >
                    إلغاء
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Bottom/Right: Mobile-friendly buttons grid */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 flex-wrap sm:flex-nowrap justify-between sm:justify-end border-t border-slate-800/80 pt-2.5 md:border-0 md:pt-0">
            
            {/* Google Drive Picker Button or Login Button */}
            {user ? (
              <button
                onClick={onOpenPicker}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95"
              >
                <FolderOpen className="w-3.5 h-3.5 text-emerald-100" />
                <span>ملفات الشيت في Drive</span>
              </button>
            ) : (
              <button
                onClick={onLogin}
                disabled={isAuthLoading}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95 disabled:opacity-70"
              >
                <svg viewBox="0 0 48 48" className="w-3.5 h-3.5 shrink-0">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span>{isAuthLoading ? 'جاري الاتصال...' : 'ربط حساب Google'}</span>
              </button>
            )}

            {/* Total Rows Badge */}
            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700 text-xs shrink-0">
              <span className="text-slate-400 text-[11px]">الصفوف:</span>
              <span className="font-mono font-black text-cyan-300 text-xs sm:text-sm">
                {totalRowsCount}
              </span>
            </div>

            {/* Sync Button */}
            <button
              onClick={onManualSync}
              disabled={isSyncing}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer ${
                isSyncing
                  ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                  : `${theme.accent} hover:opacity-90 active:scale-95`
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'سحب...' : 'سحب الآن'}</span>
            </button>

            {/* Open Original Sheet Link */}
            <a
              href={sheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-slate-900/70 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors shrink-0"
              title="فتح الشيت الأصلي في Google Sheets"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>
      </div>

      {/* Auth Error Banner if Popup was closed or blocked */}
      {authError && (
        <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-500/50 text-xs text-rose-300 flex items-center justify-between gap-2 shadow-md">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{authError}</span>
          </div>
          <button
            onClick={onLogin}
            className="px-2.5 py-1 rounded-lg bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-[11px] cursor-pointer shrink-0"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* Helpful Info banner for nasrcitylogistics.elezz@gmail.com */}
      <div className="p-3 rounded-2xl bg-slate-900/80 border border-emerald-500/30 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 shadow-md">
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
          <span className="text-[11px] sm:text-xs">
            <strong>الحساب المعتمد للشيت:</strong> <code className="text-emerald-300 font-mono bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-700/50">nasrcitylogistics.elezz@gmail.com</code> — يمكنك تسجيل الدخول به مباشرة أو استخدام الرابط الأصلي، وسيتم سحب كافة البيانات بجميع صفوفها!
          </span>
        </div>
        
        {user ? (
          <button
            onClick={onOpenPicker}
            className="w-full sm:w-auto px-3 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer shadow-sm text-center shrink-0"
          >
            استعراض الشيتات
          </button>
        ) : (
          <button
            onClick={onLogin}
            disabled={isAuthLoading}
            className="w-full sm:w-auto px-3 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer shadow-sm text-center shrink-0"
          >
            تسجيل الدخول بالحساب
          </button>
        )}
      </div>
    </div>
  );
};
