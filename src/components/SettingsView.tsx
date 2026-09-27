import React, { useState } from 'react';
import { 
  Settings, 
  ExternalLink, 
  Check, 
  RefreshCw, 
  Clock, 
  Volume2, 
  Download,
  RotateCcw,
  FileSpreadsheet,
  Share2,
  CheckCircle2,
  Key,
  ClipboardPaste,
  Save
} from 'lucide-react';
import { ThemeConfig, SyncStats } from '../types';
import { playUpdateChime } from '../utils/audio';
import { SPREADSHEET_URL, SPREADSHEET_ID, parseSpreadsheetId } from '../services/sheets';
import { User } from '../services/firebase';

interface SettingsViewProps {
  theme: ThemeConfig;
  syncIntervalSec: number;
  onUpdateSyncInterval: (sec: number) => void;
  isPollingActive: boolean;
  onTogglePolling: () => void;
  isSoundEnabled: boolean;
  onToggleSound: () => void;
  syncStats: SyncStats;
  onManualRefresh: () => void;
  onExportAllJson: () => void;
  onResetData: () => void;
  spreadsheetId: string;
  onUpdateSpreadsheetId: (idOrUrl: string) => void;
  currentUser?: User | null;
  isLoggingIn?: boolean;
  onGoogleLogin?: () => void;
  onGoogleLogout?: () => void;
  onOpenImportModal?: () => void;
  onOpenSheetSelector?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  theme,
  syncIntervalSec,
  onUpdateSyncInterval,
  isPollingActive,
  onTogglePolling,
  isSoundEnabled,
  onToggleSound,
  syncStats,
  onManualRefresh,
  onExportAllJson,
  onResetData,
  spreadsheetId,
  onUpdateSpreadsheetId,
  currentUser,
  isLoggingIn,
  onGoogleLogin,
  onGoogleLogout,
  onOpenImportModal,
  onOpenSheetSelector,
}) => {
  const [resetDone, setResetDone] = useState(false);
  const [customSheetInput, setCustomSheetInput] = useState(spreadsheetId);
  const [sheetIdSaved, setSheetIdSaved] = useState(false);

  const intervals = [
    { sec: 1, label: '1 ثانية (مباشر فائق السرعة - Real-time)' },
    { sec: 2, label: '2 ثانية (مستقر وسريع)' },
    { sec: 3, label: '3 ثوانٍ (متوازن)' },
    { sec: 5, label: '5 ثوانٍ (اقتصادي)' },
  ];

  const handleReset = () => {
    if (window.confirm('هل تريد استعادة البيانات الأصلية لشيت تشغيل العز مدينة نصر؟')) {
      onResetData();
      setResetDone(true);
      setTimeout(() => setResetDone(false), 2500);
    }
  };

  const handleSaveSheetId = () => {
    onUpdateSpreadsheetId(customSheetInput);
    setSheetIdSaved(true);
    setTimeout(() => setSheetIdSaved(false), 2000);
    onManualRefresh();
  };

  const currentSheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className={`p-5 rounded-2xl border ${theme.cardBorder} ${theme.cardBg} flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-100">
              إعدادات ومزامنة شيت "تشغيل العز مدينة نصر"
            </h3>
            <p className={`text-xs ${theme.textMuted} mt-0.5`}>
              التحكم في المزامنة الحية، ربط حساب Google، وتحديث بيانات الشيتات
            </p>
          </div>
        </div>
      </div>

      {/* 1. Google Account Live Sync Card */}
      <div className={`p-5 rounded-2xl border ${theme.cardBorder} ${theme.cardBg} space-y-4`}>
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-cyan-400" />
            <h4 className="text-sm font-bold text-slate-100">
              الربط الرسمي مع Google Sheets API v4
            </h4>
          </div>
          {currentUser ? (
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold">
              متصل بحسابك
            </span>
          ) : (
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold">
              غير مسجل
            </span>
          )}
        </div>

        <p className={`text-xs ${theme.textMuted} leading-relaxed`}>
          عند تعديلك لملف الشيت في Google Drive، يتطلب Google إذناً لقراءة التعديلات الحية. عند تسجيل الدخول، يسحب النظام كافة التعديلات في جميع التبويبات مباشرة وبشكل فوري:
        </p>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {currentUser ? (
            <div className="flex items-center gap-3">
              {currentUser.photoURL ? (
                <img src={currentUser.photoURL} alt="" className="w-10 h-10 rounded-full border border-emerald-400" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center">
                  {(currentUser.displayName || currentUser.email || 'G')[0].toUpperCase()}
                </div>
              )}
              <div>
                <span className="text-xs font-bold text-slate-100 block">
                  {currentUser.displayName || 'مستخدم Google'}
                </span>
                <span className="text-[11px] text-emerald-400 font-mono">
                  {currentUser.email}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  المزامنة الحية نشطة عبر Google Sheets API
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <span className="text-xs font-bold text-amber-300 block">
                تظهر البيانات القديمة؟
              </span>
              <p className="text-[11px] text-slate-300">
                سجل الدخول بحساب Google المالك للشيت لمنح النظام إذن قراءة التعديلات فور حفظها.
              </p>
            </div>
          )}

          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            {currentUser ? (
              onGoogleLogout && (
                <button
                  type="button"
                  onClick={onGoogleLogout}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 transition-all cursor-pointer"
                >
                  تسجيل الخروج
                </button>
              )
            ) : (
              onGoogleLogin && (
                <button
                  type="button"
                  onClick={onGoogleLogin}
                  disabled={isLoggingIn}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-900 flex items-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  <span>{isLoggingIn ? 'جاري الاتصال...' : 'تسجيل الدخول بـ Google'}</span>
                </button>
              )
            )}

            {onOpenImportModal && (
              <button
                type="button"
                onClick={onOpenImportModal}
                className="px-3.5 py-2 rounded-xl text-xs font-bold border border-cyan-500/40 bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <ClipboardPaste className="w-4 h-4" />
                <span>لصق بيانات يدوياً</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Direct Google Sheet Link & ID Configuration */}
      <div className={`p-5 rounded-2xl border ${theme.cardBorder} ${theme.cardBg} space-y-4`}>
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800/80">
          <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
          <h4 className="text-sm font-bold text-slate-100">
            معرف ورابط ملف Google Sheet
          </h4>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              رابط الشيت أو معرّف الملف (Spreadsheet ID):
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={customSheetInput}
                onChange={(e) => setCustomSheetInput(e.target.value)}
                placeholder="أدخل رابط الشيت أو الـ ID..."
                className="flex-1 px-3.5 py-2 rounded-xl text-xs font-mono bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveSheetId}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{sheetIdSaved ? 'تم الحفظ والمزامنة' : 'حفظ ومزامنة'}</span>
                </button>
                {onOpenSheetSelector && (
                  <button
                    type="button"
                    onClick={onOpenSheetSelector}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
                    <span>اختيار من الشيتات المحفوظة</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-[11px] text-slate-400 block">الرابط المفتوح حالياً:</span>
              <code className="text-xs text-cyan-400 font-mono break-all font-bold">
                {currentSheetUrl}
              </code>
            </div>

            <a
              href={currentSheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all self-start sm:self-center shrink-0"
            >
              <span>فتح الشيت في Google Docs</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* 3. Frequency Settings */}
      <div className={`p-5 rounded-2xl border ${theme.cardBorder} ${theme.cardBg} space-y-4`}>
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            <h4 className="text-sm font-bold text-slate-100">
              تردد سرعة التحديث اللحظي (Refresh Rate)
            </h4>
          </div>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
            محدد حالياً: {syncIntervalSec} ثانية
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {intervals.map((item) => {
            const isSelected = syncIntervalSec === item.sec;
            return (
              <button
                key={item.sec}
                type="button"
                onClick={() => onUpdateSyncInterval(item.sec)}
                className={`p-3 rounded-xl border text-right transition-all flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? `${theme.cardBg} ${theme.accentBorder} ring-2 ring-cyan-500/30 font-bold text-cyan-300`
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span className="text-xs">{item.label}</span>
                {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-300 font-semibold">حالة المزامنة المستمرة:</span>
            <span className={`text-xs font-bold ${isPollingActive ? 'text-emerald-400' : 'text-amber-400'}`}>
              {isPollingActive ? 'نشطة وتعمل' : 'متوقفة مؤقتاً'}
            </span>
          </div>

          <button
            onClick={onTogglePolling}
            className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
              isPollingActive ? 'border-amber-600/50 text-amber-400 hover:bg-amber-950/20' : 'bg-emerald-600 text-white'
            }`}
          >
            {isPollingActive ? 'إيقاف المزامنة مؤقتاً' : 'تفعيل المزامنة التلقائية'}
          </button>
        </div>
      </div>

      {/* 4. Audio Chime Alerts */}
      <div className={`p-5 rounded-2xl border ${theme.cardBorder} ${theme.cardBg} space-y-4`}>
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-purple-400" />
            <h4 className="text-sm font-bold text-slate-100">
              التنبيهات الصوتية للتغييرات الحية
            </h4>
          </div>
          <button
            onClick={playUpdateChime}
            className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>تجربة صوت التنبيه</span>
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-200">
              تشغيل نغمة خفيفة عند تعديل أو وصول أي طلب جديد
            </p>
            <p className={`text-[11px] ${theme.textMuted} mt-0.5`}>
              ينبه المراقبين في غرفة العمليات عند إدخال بيانات جديدة فوراً
            </p>
          </div>

          <button
            onClick={onToggleSound}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              isSoundEnabled
                ? 'bg-purple-600 border-purple-500 text-white'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            {isSoundEnabled ? <Check className="w-4 h-4 stroke-[3]" /> : <span className="text-xs font-bold">معطل</span>}
          </button>
        </div>
      </div>

      {/* 5. Reset & Wipe Data Actions */}
      <div className={`p-5 rounded-2xl border ${theme.cardBorder} ${theme.cardBg} flex flex-col sm:flex-row items-center justify-between gap-4`}>
        <div>
          <h4 className="text-sm font-bold text-slate-100">مسح البيانات والبدء بقراءة الشيت</h4>
          <p className={`text-xs ${theme.textMuted} mt-0.5`}>
            إخلاء كافة السجلات القديمة من النظام والبدء فوراً بقراءة وتحديث بيانات شيت تشغيل العز
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-xl text-xs font-bold border border-rose-800/50 bg-rose-950/30 text-rose-300 hover:bg-rose-900/50 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{resetDone ? 'تم المسح وإعادة الفحص' : 'مسح البيانات وإعادة القراءة'}</span>
          </button>

          <button
            onClick={onExportAllJson}
            className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>تصدير JSON</span>
          </button>
        </div>
      </div>

    </div>
  );
};
