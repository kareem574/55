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
  HardDrive,
  ChevronRight,
  PlusCircle,
  Mail
} from 'lucide-react';
import { ThemeConfig } from '../types';
import { 
  DriveSpreadsheetItem, 
  listUserSpreadsheetsFromDrive 
} from '../services/googleSheetsApi';
import { SPREADSHEET_ID, SPREADSHEET_URL } from '../services/sheets';

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
  const [customSheetInput, setCustomSheetInput] = useState('');
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
      setError(err?.message || 'حدث خطأ أثناء فحص ملفات جوجل درايف');
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

  const handleApplyCustomInput = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSheetInput.trim()) return;

    let id = customSheetInput.trim();
    // Extract ID if URL is provided
    const match = id.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      id = match[1];
    }

    onSelectSpreadsheet(id, 'شيت مخصص');
    onClose();
  };

  const handleSelectDefaultSheet = () => {
    onSelectSpreadsheet(SPREADSHEET_ID, 'شيت تشغيل العز مدينة نصر (الرسمي)');
    onClose();
  };

  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className={`w-full max-w-2xl rounded-2xl border ${theme.cardBorder} ${theme.cardBg} shadow-2xl flex flex-col max-h-[90vh] overflow-hidden`}
        dir="rtl"
      >
        {/* Header */}
        <div className="p-3.5 sm:p-4 border-b border-slate-700/60 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2 flex-wrap">
                <span>ملفات Google Sheets في حسابك</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                  متصل ومفعل
                </span>
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                اختر الشيت مباشرة من القائمة، أو الصق رابط أي شيت تابع لحسابك
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

        {/* Quick Official Sheet Shortcut */}
        <div className="p-3 bg-gradient-to-r from-emerald-950/40 to-cyan-950/40 border-b border-slate-800/80 flex items-center justify-between gap-2.5 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-200 truncate">
                شيت تشغيل العز مدينة نصر الرئيسي
              </div>
              <div className="text-[10px] text-slate-400 font-mono truncate" dir="ltr">
                ID: {SPREADSHEET_ID}
              </div>
            </div>
          </div>

          <button
            onClick={handleSelectDefaultSheet}
            className="px-3 py-1 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer shadow-sm shrink-0"
          >
            تحميل هذا الشيت
          </button>
        </div>

        {/* Direct Link or ID Form */}
        <form onSubmit={handleApplyCustomInput} className="p-2.5 border-b border-slate-800 bg-slate-950/40 flex items-center gap-2">
          <input
            type="text"
            value={customSheetInput}
            onChange={(e) => setCustomSheetInput(e.target.value)}
            placeholder="أو الصق رابط / ID أي شيت آخر مباشرة هنا..."
            className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            dir="ltr"
          />
          <button
            type="submit"
            className="px-3 py-1.5 text-xs font-bold rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-colors cursor-pointer shrink-0"
          >
            فتح الشيت
          </button>
        </form>

        {/* Search & Refresh Toolbar */}
        <div className="p-2.5 border-b border-slate-800 bg-slate-900/40 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في ملفات الدرايف بالاسم..."
              className="w-full pr-9 pl-3 py-1.5 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            onClick={fetchFiles}
            disabled={isLoading}
            className="p-1.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 transition-colors disabled:opacity-50 cursor-pointer"
            title="إعادة فحص Google Drive"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Files List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
              <p className="text-xs font-semibold">جاري استعراض ملفات الشيت من Google Drive...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="py-10 text-center text-slate-400 space-y-3 px-4">
              <FileSpreadsheet className="w-10 h-10 mx-auto text-slate-600 opacity-60" />
              <div>
                <p className="text-xs font-bold text-slate-200">
                  {searchQuery ? 'لا توجد نتائج تطابق بحثك' : 'لم يتم العثور على ملفات Google Sheets منشأة في هذا الحساب مباشرة'}
                </p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-md mx-auto">
                  إذا كان الشيت مشاركاً معك أو في حساب آخر، يمكنك الضغط على <strong>"تحميل شيت تشغيل العز الرئيسي"</strong> بالأعلى أو لصق رابطه مباشرة وسيتم سحب كافة البيانات فوراً!
                </p>
              </div>
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
                            <span>{dateStr}</span>
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
        <div className="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>إجمالي الملفات: {filteredFiles.length}</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
