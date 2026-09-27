import React, { useState, useRef } from 'react';
import { X, ClipboardPaste, Check, AlertCircle, Sparkles, FileSpreadsheet, Upload, FolderUp } from 'lucide-react';
import { ThemeConfig } from '../types';

interface ImportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeConfig;
  sheetTitles: string[];
  onImport: (tabTitle: string, rawText: string) => { success: boolean; count?: number; message?: string };
  onImportExcel?: (file: File) => Promise<{ success: boolean; totalRows?: number; count?: number; message?: string }>;
}

export const ImportDataModal: React.FC<ImportDataModalProps> = ({
  isOpen,
  onClose,
  theme,
  sheetTitles,
  onImport,
  onImportExcel,
}) => {
  const [activeTabMode, setActiveTabMode] = useState<'excel' | 'paste'>('excel');
  const [selectedTab, setSelectedTab] = useState(sheetTitles[0] || 'تزويد الشيفتات');
  const [pastedContent, setPastedContent] = useState('');
  const [resultMsg, setResultMsg] = useState<{ success: boolean; text: string } | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImportExcel) return;

    setIsProcessingFile(true);
    setResultMsg(null);
    try {
      const res = await onImportExcel(file);
      if (res.success) {
        setResultMsg({ 
          success: true, 
          text: `تم استيراد ${res.count} تبويب بنجاح بإجمالي ${res.totalRows} صف!` 
        });
        setTimeout(() => {
          setResultMsg(null);
          onClose();
        }, 1800);
      } else {
        setResultMsg({ success: false, text: res.message || 'فشل استيراد الملف' });
      }
    } catch (err: any) {
      setResultMsg({ success: false, text: err?.message || 'حدث خطأ أثناء قراءة الملف' });
    } finally {
      setIsProcessingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleApply = () => {
    if (!pastedContent.trim()) {
      setResultMsg({ success: false, text: 'يرجى لصق بيانات من ملف الشيت أولاً' });
      return;
    }

    const res = onImport(selectedTab, pastedContent);
    if (res.success) {
      setResultMsg({ success: true, text: `تم تحديث تبويب "${selectedTab}" بنجاح (${res.count} صف)!` });
      setTimeout(() => {
        setResultMsg(null);
        setPastedContent('');
        onClose();
      }, 1500);
    } else {
      setResultMsg({ success: false, text: res.message || 'فشل معالجة البيانات' });
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setPastedContent(text);
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div 
        dir="rtl"
        className={`w-full max-w-2xl rounded-2xl border ${theme.cardBorder} ${theme.cardBg} shadow-2xl overflow-hidden flex flex-col max-h-[90vh]`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-100">
                استيراد وتحديث بيانات الشيت
              </h3>
              <p className={`text-xs ${theme.textMuted} mt-0.5`}>
                اختر رفع ملف الإكسيل الذي نزلته من الشيت أو انسخ الصفوف والصقها مباشرة
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 p-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTabMode('excel')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTabMode === 'excel'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <FolderUp className="w-4 h-4" />
            <span>رفع ملف إكسيل (.xlsx) - كل التبويبات دفعة واحدة</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTabMode('paste')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTabMode === 'paste'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <ClipboardPaste className="w-4 h-4" />
            <span>لصق نص من الشيت (Ctrl + V)</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {activeTabMode === 'excel' ? (
            <div className="space-y-4">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-emerald-500/40 hover:border-emerald-400/80 bg-emerald-950/20 hover:bg-emerald-950/30 rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 group"
              >
                <div className="p-4 rounded-2xl bg-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-100">
                    {isProcessingFile ? 'جاري قراءة واستيراد الملف...' : 'اضغط لاختيار ملف الإكسيل (.xlsx)'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    من Google Sheets: اختر ملف (File) ⭠ تنزيل (Download) ⭠ Microsoft Excel (.xlsx) ثم ارفعه هنا
                  </p>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept=".xlsx, .xls, .csv" 
                  className="hidden" 
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-1.5">
                <p className="font-bold text-emerald-400">💡 ميزة الاستيراد التلقائي:</p>
                <p>الملف سيقوم بتحديث جميع التبويبات الـ 8 فوراً (تزويد الشيفتات، فك البريك، قفل الشيفت، الاستفسارات، وغيرها) دون الحاجة لنسخ كل تبويب بمفرده.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1.5">
                  اختر التبويب المراد تحديث بياناته:
                </label>
                <select
                  value={selectedTab}
                  onChange={(e) => setSelectedTab(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                >
                  {sheetTitles.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-200">
                    الصق محتوى الشيت هنا (Ctrl + V):
                  </label>
                  <button
                    type="button"
                    onClick={handlePasteFromClipboard}
                    className="text-[11px] text-cyan-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>لصق من الحافظة</span>
                  </button>
                </div>
                <textarea
                  rows={7}
                  value={pastedContent}
                  onChange={(e) => setPastedContent(e.target.value)}
                  placeholder="انسخ الخلايا من ملف Google Sheets والصقها هنا مباشرة..."
                  className="w-full p-3.5 rounded-xl text-xs font-mono bg-slate-950 border border-slate-700/80 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  * يدعم النسخ المباشر من Google Sheets أو ملفات Excel (نظام Tab-Separated تلقائياً).
                </p>
              </div>
            </div>
          )}

          {resultMsg && (
            <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              resultMsg.success 
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' 
                : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
            }`}>
              {resultMsg.success ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{resultMsg.text}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all cursor-pointer"
          >
            إغلاق
          </button>
          {activeTabMode === 'paste' && (
            <button
              type="button"
              onClick={handleApply}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>تطبيق وتحديث البيانات الآن</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
