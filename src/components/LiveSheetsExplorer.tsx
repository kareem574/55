import React, { useState, useMemo } from 'react';
import { 
  Table2, 
  Search, 
  Download, 
  Copy, 
  Check, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  ExternalLink,
  FileSpreadsheet,
  Clock,
  Send
} from 'lucide-react';
import { SheetTab, ThemeConfig, SheetDiff } from '../types';
import { SPREADSHEET_URL } from '../services/sheets';

interface LiveSheetsExplorerProps {
  theme: ThemeConfig;
  sheets: SheetTab[];
  activeSheetId: string;
  onSelectSheetTab: (sheetId: string) => void;
  recentDiffs: SheetDiff[];
  spreadsheetId: string;
  onSendReplyToRider?: (riderId: string, reply: string) => void;
}

export const LiveSheetsExplorer: React.FC<LiveSheetsExplorerProps> = ({
  theme,
  sheets,
  activeSheetId,
  onSelectSheetTab,
  recentDiffs,
  spreadsheetId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumnIndex, setSortColumnIndex] = useState<number | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [copied, setCopied] = useState(false);

  // Active sheet
  const activeSheet = sheets.find(s => s.id === activeSheetId) || sheets[0] || {
    id: 'empty',
    title: 'تزويد الشيفتات',
    rowCount: 0,
    columnCount: 0,
    headers: [],
    rows: [],
    updatedAt: '',
  };

  // Recent diff cell keys for this sheet
  const changedCellKeys = useMemo(() => {
    const keys = new Set<string>();
    recentDiffs.forEach(diff => {
      if (diff.sheetTitle === activeSheet.title) {
        keys.add(`${diff.rowIndex - 1}-${diff.columnIndex - 1}`);
      }
    });
    return keys;
  }, [recentDiffs, activeSheet.title]);

  // Filter & sort
  const displayRows = useMemo(() => {
    let result = [...activeSheet.rows];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(row =>
        row.some(cell => String(cell || '').toLowerCase().includes(q))
      );
    }

    if (sortColumnIndex !== null) {
      result.sort((a, b) => {
        const valA = a[sortColumnIndex];
        const valB = b[sortColumnIndex];

        if (valA === valB) return 0;
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;

        const numA = Number(valA);
        const numB = Number(valB);
        if (!isNaN(numA) && !isNaN(numB)) {
          return sortDirection === 'asc' ? numA - numB : numB - numA;
        }

        const comp = String(valA).localeCompare(String(valB), 'ar');
        return sortDirection === 'asc' ? comp : -comp;
      });
    }

    return result;
  }, [activeSheet.rows, searchTerm, sortColumnIndex, sortDirection]);

  const handleSort = (colIdx: number) => {
    if (sortColumnIndex === colIdx) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortColumnIndex(null);
      }
    } else {
      setSortColumnIndex(colIdx);
      setSortDirection('asc');
    }
  };

  const handleCopyClipboard = () => {
    const headerLine = activeSheet.headers.join('\t');
    const rowsLines = activeSheet.rows.map(r => r.join('\t')).join('\n');
    const tsv = `${headerLine}\n${rowsLines}`;
    navigator.clipboard.writeText(tsv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCSV = () => {
    const headerLine = activeSheet.headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(',');
    const rowsLines = activeSheet.rows.map(r => 
      r.map(c => `"${String(c || '').replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    const csvContent = '\uFEFF' + `${headerLine}\n${rowsLines}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${activeSheet.title || 'nasr_city_sheet'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      
      {/* Dynamic 8 Sheet Tabs Navigation Bar */}
      <div className={`p-4 rounded-2xl border ${theme.cardBorder} ${theme.cardBg} space-y-3`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className={`w-5 h-5 ${theme.accentText}`} />
            <div>
              <h3 className="text-base font-black text-slate-100">
                تبويبات شيت تشغيل العز مدينة نصر الـ 8
              </h3>
              <p className={`text-xs ${theme.textMuted}`}>
                انقر على أي تبويب لاستعراض سجلاته بالكامل مع التحديث اللحظي كل 1 ثانية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <a
              href={SPREADSHEET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline flex items-center gap-1 font-mono font-bold"
            >
              <span>فتح الملف الأصلي في Google Sheets</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* The 8 Tab Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {sheets.map((sheet) => {
            const isActive = sheet.id === activeSheet.id;
            return (
              <button
                key={sheet.id}
                onClick={() => onSelectSheetTab(sheet.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? `${theme.accent} shadow-md`
                    : `bg-slate-900/60 border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white`
                }`}
              >
                <Table2 className="w-3.5 h-3.5" />
                <span>{sheet.title}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                    isActive ? 'bg-black/20 text-inherit' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {sheet.rows.length} صف
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Table Viewer Container */}
      <div className={`rounded-2xl border ${theme.cardBorder} ${theme.cardBg} overflow-hidden shadow-xl`}>
        
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-3">
          
          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <div className="relative flex-1 sm:w-80">
              <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={`بحث في خلايا تبويب "${activeSheet.title}"...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-9 pl-3 py-2 text-xs rounded-xl bg-slate-900/90 border border-slate-700/70 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-xs text-slate-400 hover:text-white px-2 py-1"
              >
                إلغاء
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <span className={`text-xs ${theme.textMuted} hidden lg:inline`}>
              معروض: <span className="font-bold text-slate-200">{displayRows.length}</span> من أصل <span className="font-bold text-slate-200">{activeSheet.rows.length}</span>
            </span>

            <button
              onClick={handleCopyClipboard}
              className={`p-2 sm:px-3 sm:py-2 rounded-xl border ${theme.cardBorder} bg-slate-900/60 hover:bg-slate-800/60 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer`}
              title="نسخ محتوى الجدول بالكامل"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? 'تم النسخ' : 'نسخ'}</span>
            </button>

            <button
              onClick={handleDownloadCSV}
              className={`p-2 sm:px-3 sm:py-2 rounded-xl border ${theme.cardBorder} bg-slate-900/60 hover:bg-slate-800/60 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer`}
              title="تصدير كملف Excel / CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">تصدير CSV</span>
            </button>
          </div>

        </div>

        {/* The Grid Table */}
        <div className="overflow-x-auto max-h-[620px] overflow-y-auto">
          <table className="w-full text-right border-collapse text-xs">
            <thead className={`${theme.tableHeaderBg} sticky top-0 z-10 font-bold backdrop-blur-md`}>
              <tr>
                <th className="p-3 w-12 text-center border-b border-slate-700/60 text-slate-400 font-mono">
                  #
                </th>
                {activeSheet.headers.map((header, colIdx) => {
                  const isSorted = sortColumnIndex === colIdx;
                  return (
                    <th
                      key={colIdx}
                      onClick={() => handleSort(colIdx)}
                      className="p-3.5 border-b border-slate-700/60 hover:bg-white/5 cursor-pointer select-none transition-colors group whitespace-nowrap"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span>{header}</span>
                        <span className="text-slate-500 group-hover:text-slate-300">
                          {isSorted ? (
                            sortDirection === 'asc' ? (
                              <ArrowUp className="w-3.5 h-3.5 text-cyan-400" />
                            ) : (
                              <ArrowDown className="w-3.5 h-3.5 text-cyan-400" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3 h-3 opacity-40 group-hover:opacity-100" />
                          )}
                        </span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-800/60">
              {displayRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={activeSheet.headers.length + 1}
                    className="p-12 text-center text-slate-400"
                  >
                    لا توجد بيانات مطابقة لعملية البحث الحالية
                  </td>
                </tr>
              ) : (
                displayRows.map((row, rowIdx) => {
                  return (
                    <tr
                      key={rowIdx}
                      className={`transition-colors duration-200 ${theme.tableRowHover}`}
                    >
                      <td className="p-3 text-center font-mono text-[11px] text-slate-500 bg-slate-950/20">
                        {rowIdx + 1}
                      </td>
                      {row.map((cell, colIdx) => {
                        const cellKey = `${rowIdx}-${colIdx}`;
                        const isRecentlyChanged = changedCellKeys.has(cellKey);
                        const cellStr = cell !== null && cell !== undefined ? String(cell) : '';
                        
                        // Exact color match from user's Google Sheet screenshots:
                        // Green: 'مقبول'
                        // Red: 'مرفوض'
                        // Amber: 'شيفت مكسور' or 'غير مقبول' or 'متجاهل'
                        const isAccepted = cellStr === 'مقبول';
                        const isRejected = cellStr === 'مرفوض';
                        const isShiftBroken = cellStr.includes('شيفت مكسور') || cellStr.includes('غير مقبول');
                        const isIgnored = cellStr.includes('متجاهل');
                        const isRiderId = /^\d{6,8}$/.test(cellStr.trim());

                        return (
                          <td
                            key={colIdx}
                            className={`p-3.5 whitespace-nowrap font-medium transition-all duration-700 ${
                              isRecentlyChanged
                                ? 'bg-cyan-500/25 ring-2 ring-cyan-400 font-bold text-white shadow-inner animate-pulse'
                                : ''
                            }`}
                          >
                            {isAccepted ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-[#1e4620] text-[#7ee787] border border-[#2ea043]/40">
                                {cellStr}
                              </span>
                            ) : isRejected ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-[#4c1d1d] text-[#ff7b72] border border-[#da3633]/40">
                                {cellStr}
                              </span>
                            ) : isShiftBroken ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-950/50 text-amber-300 border border-amber-800/40">
                                {cellStr}
                              </span>
                            ) : isIgnored ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] text-slate-400 bg-slate-800/80 border border-slate-700/50">
                                {cellStr}
                              </span>
                            ) : isRiderId ? (
                              <span className="font-mono font-bold text-cyan-300 bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-700/60">
                                {cellStr}
                              </span>
                            ) : (
                              <span className="text-slate-200">{cellStr || <span className="text-slate-600 font-mono">-</span>}</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Stats */}
        <div className="p-3.5 bg-slate-950/40 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>حالة التبويب:</span>
              <span className="font-mono text-slate-300 font-bold">{activeSheet.updatedAt || 'نشط ومحدث'}</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span>الأعمدة: <b className="text-slate-200">{activeSheet.columnCount}</b></span>
            <span>•</span>
            <span>الصفوف: <b className="text-slate-200">{activeSheet.rowCount}</b></span>
          </div>
        </div>

      </div>

    </div>
  );
};
