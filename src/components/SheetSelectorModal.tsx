import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  X, 
  Check, 
  ExternalLink, 
  Plus, 
  Trash2, 
  RotateCcw, 
  ShieldAlert, 
  Key, 
  LogOut, 
  Sparkles, 
  ArrowRight,
  ClipboardPaste,
  Info
} from 'lucide-react';
import { ThemeConfig, SavedSheetConfig } from '../types';
import { SPREADSHEET_ID, parseSpreadsheetId } from '../services/sheets';
import { User } from '../services/firebase';

interface SheetSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeConfig;
  currentSpreadsheetId: string;
  onSelectSpreadsheetId: (idOrUrl: string) => void;
  currentUser?: User | null;
  isLoggingIn?: boolean;
  onGoogleLogin?: () => void;
  onGoogleLogout?: () => void;
  isSheetRestricted?: boolean;
}

const DEFAULT_PRESETS: SavedSheetConfig[] = [
  {
    id: SPREADSHEET_ID,
    name: 'شيت تشغيل العز - مدينة نصر (الرئيسي)',
    url: `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`,
    notes: 'شيت العمليات المعتمد (تزويد، فك بريك، قفل ورفع شيفتات)',
    isDefault: true,
    addedAt: 'أساسي',
  },
];

export const SheetSelectorModal: React.FC<SheetSelectorModalProps> = ({
  isOpen,
  onClose,
  theme,
  currentSpreadsheetId,
  onSelectSpreadsheetId,
  currentUser,
  isLoggingIn,
  onGoogleLogin,
  onGoogleLogout,
  isSheetRestricted,
}) => {
  const [savedSheets, setSavedSheets] = useState<SavedSheetConfig[]>(() => {
    try {
      const saved = localStorage.getItem('nasr_city_saved_sheets_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_PRESETS;
  });

  const [inputUrlOrId, setInputUrlOrId] = useState('');
  const [customName, setCustomName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('nasr_city_saved_sheets_v1', JSON.stringify(savedSheets));
    } catch {}
  }, [savedSheets]);

  if (!isOpen) return null;

  const handleApplySheet = (idOrUrl: string) => {
    const cleanId = parseSpreadsheetId(idOrUrl);
    if (!cleanId || cleanId.length < 15) {
      setErrorMsg('معرف الشيت غير صالح، يرجى لصق رابط Google Sheet كامل');
      return;
    }
    setErrorMsg(null);
    onSelectSpreadsheetId(cleanId);
    setSuccessMsg('تم تفعيل الشيت وبدء سحب البيانات بنجاح!');
    setTimeout(() => {
      setSuccessMsg(null);
      onClose();
    }, 1200);
  };

  const handleAddNewSheet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrlOrId.trim()) {
      setErrorMsg('يرجى إدخال رابط الشيت أو الـ ID');
      return;
    }

    const cleanId = parseSpreadsheetId(inputUrlOrId.trim());
    if (!cleanId || cleanId.length < 15) {
      setErrorMsg('الرابط المدخل لا يحتوي على كود Google Sheet صالح');
      return;
    }

    const newSheet: SavedSheetConfig = {
      id: cleanId,
      name: customName.trim() || `شيت عمليات (${cleanId.slice(0, 6)}...)`,
      url: `https://docs.google.com/spreadsheets/d/${cleanId}/edit`,
      notes: 'تمت إضافته يدوياً',
      addedAt: new Date().toLocaleDateString('ar-EG'),
    };

    // Prevent duplicates
    const filtered = savedSheets.filter(s => s.id !== cleanId);
    setSavedSheets([newSheet, ...filtered]);
    setInputUrlOrId('');
    setCustomName('');
    setErrorMsg(null);

    // Apply immediately
    handleApplySheet(cleanId);
  };

  const handleDeleteSavedSheet = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (id === SPREADSHEET_ID) {
      alert('لا يمكن حذف الشيت الافتراضي لتشغيل العز');
      return;
    }
    setSavedSheets(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        dir="rtl"
        className={`w-full max-w-2xl rounded-2xl border ${theme.cardBorder} ${theme.cardBg} shadow-2xl overflow-hidden flex flex-col max-h-[90vh]`}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-700/60 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-100 flex items-center gap-2">
                <span>اختيار وتغيير الشيت المراد السحب منه</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                  متعدد الشيتات
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                يمكنك التبديل بين أي شيت Google Sheets أو إدخال رابط شيت جديد للمزامنة التلقائية
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-6 overflow-y-auto flex-1 text-right">

          {/* Feedback messages */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Google Account Authentication Section */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-200">
                    تسجيل الدخول بأي حساب Google
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {currentUser 
                      ? `متصل حالياً بحساب: ${currentUser.email || currentUser.displayName}`
                      : 'سجّل الدخول بأي بريد Gmail لديك لقراءة الشيتات المتاحة لحسابك'}
                  </p>
                </div>
              </div>

              {currentUser ? (
                <div className="flex items-center gap-2">
                  {onGoogleLogin && (
                    <button
                      type="button"
                      onClick={onGoogleLogin}
                      disabled={isLoggingIn}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-slate-200 transition cursor-pointer"
                    >
                      تبديل الحساب
                    </button>
                  )}
                  {onGoogleLogout && (
                    <button
                      type="button"
                      onClick={onGoogleLogout}
                      className="px-2.5 py-1.5 rounded-xl text-xs text-rose-300 hover:bg-rose-500/20 transition cursor-pointer flex items-center gap-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>خروج</span>
                    </button>
                  )}
                </div>
              ) : (
                onGoogleLogin && (
                  <button
                    type="button"
                    onClick={onGoogleLogin}
                    disabled={isLoggingIn}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-900 hover:bg-slate-100 flex items-center gap-2 transition shadow-md cursor-pointer"
                  >
                    <span>{isLoggingIn ? 'جاري الفتح...' : 'تسجيل الدخول بـ Google'}</span>
                  </button>
                )
              )}
            </div>
          </div>

          {/* Current Active Sheet Card */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 block">
              الشيت المفعّل حالياً في النظام:
            </label>
            <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/40 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping inline-block" />
                <div>
                  <div className="text-xs font-black text-cyan-300 font-mono tracking-wide">
                    ID: {currentSpreadsheetId}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {currentSpreadsheetId === SPREADSHEET_ID ? 'شيت تشغيل العز - مدينة نصر' : 'شيت مخصص'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`https://docs.google.com/spreadsheets/d/${currentSpreadsheetId}/edit`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg text-xs bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 font-semibold flex items-center gap-1 transition"
                >
                  <span>فتح في Google</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Saved Sheets List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300">
                الشيتات المحفوظة والمتاحة للاختيار السريع:
              </label>
              <span className="text-[11px] text-slate-400">
                ({savedSheets.length} شيت مسجل)
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5 max-h-48 overflow-y-auto pr-1">
              {savedSheets.map((sheet) => {
                const isActive = sheet.id === currentSpreadsheetId;
                return (
                  <div
                    key={sheet.id}
                    onClick={() => handleApplySheet(sheet.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isActive
                        ? 'border-cyan-400 bg-cyan-500/15 shadow-md shadow-cyan-950/50'
                        : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isActive ? 'bg-cyan-500 text-black font-bold' : 'bg-slate-800 text-slate-400'}`}>
                        <FileSpreadsheet className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-100">
                            {sheet.name}
                          </span>
                          {isActive && (
                            <span className="text-[10px] px-2 py-0.2 rounded-full bg-cyan-400 text-black font-extrabold">
                              النشط حالياً
                            </span>
                          )}
                          {sheet.isDefault && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                              الافتراضي
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5 truncate max-w-xs">
                          {sheet.id}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplySheet(sheet.id);
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                          isActive
                            ? 'bg-cyan-400 text-black cursor-default'
                            : 'bg-slate-800 hover:bg-cyan-500 hover:text-black text-slate-200'
                        }`}
                      >
                        {isActive ? 'مُفعّل' : 'تفعيل'}
                      </button>

                      {!sheet.isDefault && (
                        <button
                          type="button"
                          onClick={(e) => handleDeleteSavedSheet(sheet.id, e)}
                          title="حذف من القائمة"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add New Sheet Form */}
          <form onSubmit={handleAddNewSheet} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <Plus className="w-4 h-4 text-cyan-400" />
              <span>إضافة وتفعيل شيت جديد:</span>
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  رابط Google Sheet أو الـ Spreadsheet ID:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={inputUrlOrId}
                    onChange={(e) => setInputUrlOrId(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/1bQLV0l.../edit"
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  اسم تعريفي للشيت (اختياري):
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="مثال: شيت فرع التجمع، أو شيت المساء"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-black flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>حفظ وتفعيل هذا الشيت فوراً</span>
                </button>
              </div>
            </div>
          </form>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Info className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>يتم حفظ الشيتات المضافة في المتصفح لاسترجاعها في أي وقت بنقرة واحدة.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-slate-700 hover:bg-white/5 text-slate-300 font-semibold cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
