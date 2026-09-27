import React, { useState } from 'react';
import { 
  Link2, 
  RefreshCw, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Info,
  ChevronDown,
  ChevronUp,
  Sliders
} from 'lucide-react';
import { ThemeConfig } from '../types';

interface SheetUrlSyncBarProps {
  theme: ThemeConfig;
  sheetUrl: string;
  onUpdateSheetUrl: (url: string) => void;
  isSyncing: boolean;
  onManualSync: () => void;
  totalRowsCount: number;
  isSheetRestricted: boolean;
  lastFetchStatusMessage?: string;
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
}) => {
  const [urlInput, setUrlInput] = useState(sheetUrl);
  const [isEditing, setIsEditing] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      onUpdateSheetUrl(urlInput.trim());
      setIsEditing(false);
    }
  };

  return (
    <div className="space-y-3 mb-5">
      {/* Main Bar */}
      <div className={`p-3.5 sm:p-4 rounded-2xl border ${theme.cardBorder} ${theme.cardBg} shadow-lg transition-all`}>
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          {/* Left: Link Info & Status */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center shrink-0 text-cyan-400">
              <Link2 className="w-5 h-5" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black text-slate-100">
                  سحب البيانات عبر رابط الشيت المباشر
                </span>
                <span className="text-[10px] bg-cyan-950/80 text-cyan-300 border border-cyan-700/60 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  <span>بدون تسجيل دخول جوجل • حتى 500+ صف</span>
                </span>
              </div>

              {!isEditing ? (
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-[11px] font-mono text-slate-400 truncate max-w-md" dir="ltr">
                    {sheetUrl}
                  </p>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold shrink-0 hover:underline cursor-pointer"
                  >
                    تغيير الرابط
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSave} className="flex items-center gap-2 mt-1.5 w-full">
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

          {/* Right: Actions & Row Counter */}
          <div className="flex items-center gap-2.5 shrink-0 self-end lg:self-center">
            {/* Total Rows Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700 text-xs">
              <span className="text-slate-400">إجمالي الصفوف:</span>
              <span className="font-mono font-black text-cyan-300 text-sm">
                {totalRowsCount} صف
              </span>
            </div>

            {/* Sync Button */}
            <button
              onClick={onManualSync}
              disabled={isSyncing}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer ${
                isSyncing
                  ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                  : `${theme.accent} hover:opacity-90 active:scale-95`
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'جاري السحب...' : 'سحب البيانات الآن'}</span>
            </button>

            {/* Open Original Sheet Link */}
            <a
              href={sheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-slate-900/70 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
              title="فتح الشيت الأصلي في Google Sheets"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            {/* Toggle Guide Button */}
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="p-2 rounded-xl bg-slate-900/70 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-slate-700 transition-colors"
              title="شرح إذن الرابط"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Guide & Restricted Notice if Google drive blocked unauthenticated access */}
      {(isSheetRestricted || showGuide) && (
        <div className="p-4 rounded-2xl bg-amber-950/25 border border-amber-500/40 text-amber-200 text-xs space-y-2.5 shadow-md animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-amber-300 text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>خطوة واحدة لتفعيل قراءة الشيت بالكامل عبر الرابط مباشرة وبدون تسجيل دخول جوجل:</span>
            </div>
            {showGuide && !isSheetRestricted && (
              <button
                onClick={() => setShowGuide(false)}
                className="text-xs text-amber-400 hover:underline"
              >
                إغلاق
              </button>
            )}
          </div>

          <p className="text-slate-300 leading-relaxed">
            لكي يسمح خادم جوجل لأي تطبيق بقراءة الشيت من الرابط مباشرة دون طلب تسجيل دخول، يجب فقط جعل إذن الوصول العام للملف:
            <strong className="text-white mx-1">"أي شخص لديه الرابط (Anyone with the link)"</strong>.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-medium">
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 font-bold text-[11px]">1</span>
              <span>افتح ملف الشيت في جوجل</span>
            </div>
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 font-bold text-[11px]">2</span>
              <span>اضغط زر <strong>مشاركة (Share)</strong> في أعلى الصفحة</span>
            </div>
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 font-bold text-[11px]">3</span>
              <span>في الوصول العام غيّر إلى <strong>"أي شخص لديه الرابط"</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <a
              href={sheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-sm"
            >
              <span>فتح الشيت لتغيير إذن المشاركة الآن</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={onManualSync}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>أنا قمت بتغيير الإذن، اسحب الآن</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
