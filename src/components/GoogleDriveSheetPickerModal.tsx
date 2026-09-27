import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Search, 
  RefreshCw, 
  Check, 
  ExternalLink, 
  X, 
  AlertCircle,
  Clock,
  UserCheck,
  ChevronRight,
  HardDrive
} from 'lucide-react';
import { ThemeConfig } from '../types';
import { 
  DriveSpreadsheetItem, 
  listUserSpreadsheetsFromDrive 
} from '../services/googleSheetsApi';

interface GoogleDriveSheetPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeConfig;
  accessToken: string | null;
  currentSpreadsheetId: string;
  onSelectSpreadsheet: (id: string, name: string) => void;
}

export const GoogleDriveSheetPickerModal: React.FC<GoogleDriveSheetPickerModalProps> = ({
  isOpen,
  onClose,
  theme,
  accessToken,
  currentSpreadsheetId,
  onSelectSpreadsheet,
}) => {
  const [files, setFiles] = useState<DriveSpreadsheetItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = async () => {
    if (!accessToken) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await listUserSpreadsheetsFromDrive(accessToken);
      if (res.success) {
        setFiles(res.files);
      } else {
        setError(res.error || 'تعذر جلب ملفات الشيت من حسابك');
      }
    } catch (err: any) {
      setError(err?.message || 'حدث خطأ غير متوقع');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && accessToken) {
      fetchFiles();
    }
  }, [isOpen, accessToken]);

  if (!isOpen) return null;

  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className={`w-full max-w-2xl rounded-2xl border ${theme.cardBorder} ${theme.cardBg} shadow-2xl flex flex-col max-h-[85vh] overflow-hidden`}
        dir="rtl"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-700/60 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>اختيار ملف الشيت من Google Drive</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                  متصل بحسابك
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                اختر أي شيت من درايف لتحميله ومزامنته بجميع صفوفه لحظياً
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Refresh Toolbar */}
        <div className="p-3 border-b border-slate-800 bg-slate-950/40 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في ملفات Google Sheets الخاصة بك..."
              className="w-full pr-9 pl-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            onClick={fetchFiles}
            disabled={isLoading}
            className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 transition-colors disabled:opacity-50 cursor-pointer"
            title="إعادة تحميل الملفات من جوجل درايف"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Files List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
              <p className="text-xs font-semibold">جاري جلب ملفات الشيت من Google Drive...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <FileSpreadsheet className="w-10 h-10 mx-auto text-slate-600 opacity-60" />
              <p className="text-xs font-bold text-slate-300">لم يتم العثور على ملفات شيت</p>
              <p className="text-[11px] text-slate-500">
                {searchQuery ? 'لا توجد نتائج تطابق بحثك' : 'لا توجد ملفات Google Sheets في هذا الحساب'}
              </p>
            </div>
          ) : (
            filteredFiles.map((file) => {
              const isSelected = file.id === currentSpreadsheetId;
              const dateStr = file.modifiedTime 
                ? new Date(file.modifiedTime).toLocaleDateString('ar-EG', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : '';

              return (
                <div
                  key={file.id}
                  onClick={() => {
                    onSelectSpreadsheet(file.id, file.name);
                    onClose();
                  }}
                  className={`group p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-500/60 shadow-md'
                      : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected 
                        ? 'bg-cyan-500/20 text-cyan-300' 
                        : 'bg-emerald-500/15 text-emerald-400'
                    }`}>
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold truncate ${isSelected ? 'text-cyan-200' : 'text-slate-200 group-hover:text-white'}`}>
                          {file.name}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.2 rounded-full font-bold shrink-0">
                            الشيت الحالي النشط
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                        {dateStr && (
                          <span className="flex items-center gap-1 font-mono text-[10px]">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span>آخر تعديل: {dateStr}</span>
                          </span>
                        )}
                        <span className="font-mono text-[10px] text-slate-500 truncate" dir="ltr">
                          ID: {file.id.substring(0, 12)}...
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {file.webViewLink && (
                      <a
                        href={file.webViewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
                        title="فتح في Google Sheets"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}

                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-400 group-hover:bg-cyan-500 group-hover:text-slate-950'
                    }`}>
                      {isSelected ? <Check className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span>إجمالي الملفات المعروضة: {filteredFiles.length}</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
