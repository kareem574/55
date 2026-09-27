import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MessageSquare, 
  FileSpreadsheet, 
  Search, 
  ExternalLink, 
  RefreshCw, 
  ArrowUpRight, 
  Zap, 
  Send,
  Users,
  ShieldAlert
} from 'lucide-react';
import { SheetTab, ThemeConfig, SyncStats, RiderRequest } from '../types';
import { SPREADSHEET_URL, SPREADSHEET_ID, formatRiderWhatsAppMessage } from '../services/sheets';

interface OperationsDashboardProps {
  theme: ThemeConfig;
  sheets: SheetTab[];
  requests: RiderRequest[];
  syncStats: SyncStats;
  syncIntervalSec: number;
  isPollingActive: boolean;
  onRefresh: () => void;
  onNavigateToTab: (tabId: string) => void;
  onNavigateToReplies: () => void;
}

export const OperationsDashboard: React.FC<OperationsDashboardProps> = ({
  theme,
  sheets,
  requests,
  syncStats,
  syncIntervalSec,
  isPollingActive,
  onRefresh,
  onNavigateToTab,
  onNavigateToReplies,
}) => {
  const [quickRiderSearch, setQuickRiderSearch] = useState('');

  const totalAccepted = requests.filter(r => r.statusType === 'accepted').length;
  const totalRejected = requests.filter(r => r.statusType === 'rejected').length;
  const totalPending = requests.filter(r => r.statusType === 'pending').length;

  const searchedRequests = quickRiderSearch.trim()
    ? requests.filter(r => r.riderId.includes(quickRiderSearch.trim()))
    : requests.slice(0, 8);

  return (
    <div className="space-y-6">
      
      {/* Real-time Status Banner */}
      <div className={`p-4 sm:p-5 rounded-2xl border ${theme.cardBorder} ${theme.cardBg} flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden`}>
        <div className="absolute -top-12 -left-12 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-3.5 z-10 w-full md:w-auto">
          <div className="p-3 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Zap className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-100">
                لوحة قيادة تشغيل العز - قطاع مدينة نصر
              </h2>
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
            <p className={`text-xs ${theme.textMuted} mt-0.5`}>
              مزامنة نشطة كل {syncIntervalSec} ثانية • قراءة حية لجميع شيتات الطيارين (تزويد، فك بريك، رفع وقفل)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end z-10">
          <button
            onClick={onRefresh}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border ${theme.cardBorder} ${theme.cardBg} hover:bg-white/10 flex items-center gap-1.5 transition-all cursor-pointer`}
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>سحب فوري</span>
          </button>
          
          <button
            onClick={onNavigateToReplies}
            className={`px-4 py-2 rounded-xl text-xs font-bold ${theme.accent} shadow-md flex items-center gap-1.5 transition-all cursor-pointer`}
          >
            <span>إرسال الردود للطيارين</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
        
        {/* Card 1: Accepted */}
        <div 
          onClick={onNavigateToReplies}
          className={`p-4 sm:p-5 rounded-2xl border border-emerald-900/60 bg-emerald-950/25 hover:border-emerald-600 transition-all cursor-pointer space-y-2`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400">الطلبات المقبولة</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
              {totalAccepted}
            </span>
            <span className="text-xs text-emerald-300 font-semibold">جاهز بالجدول</span>
          </div>
          <p className="text-[11px] text-emerald-400/80">
            تزويدات مقبولة وفك بريك نشط
          </p>
        </div>

        {/* Card 2: Rejected & Broken Shifts */}
        <div 
          onClick={onNavigateToReplies}
          className={`p-4 sm:p-5 rounded-2xl border border-rose-900/60 bg-rose-950/25 hover:border-rose-600 transition-all cursor-pointer space-y-2`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-400">الطلبات المرفوضة والمكسورة</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-rose-400 font-mono">
              {totalRejected}
            </span>
            <span className="text-xs text-rose-300 font-semibold">مكسور / سيستم</span>
          </div>
          <p className="text-[11px] text-rose-400/80">
            شيفتات مكسورة أو بريك سيستم
          </p>
        </div>

        {/* Card 3: Pending Inquiries */}
        <div 
          onClick={onNavigateToReplies}
          className={`p-4 sm:p-5 rounded-2xl border border-amber-900/60 bg-amber-950/25 hover:border-amber-600 transition-all cursor-pointer space-y-2`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400">قيد المراجعة والإنتظار</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
              {totalPending}
            </span>
            <span className="text-xs text-amber-300 font-semibold">بحاجة لقرار</span>
          </div>
          <p className="text-[11px] text-amber-400/80">
            طلبات قفل أو تعديل واستفسارات
          </p>
        </div>

        {/* Card 4: 1-Second Sync Engine */}
        <div className={`p-4 sm:p-5 rounded-2xl border ${theme.cardBorder} ${theme.cardBg} space-y-2`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold ${theme.textMuted}`}>معدل التحديث الحي</span>
            <RefreshCw className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-100 font-mono">
              {syncIntervalSec} ثانية
            </span>
            <span className={`text-xs font-bold ${isPollingActive ? 'text-emerald-400' : 'text-amber-400'}`}>
              {isPollingActive ? 'نبض نشط' : 'متوقف'}
            </span>
          </div>
          <p className={`text-[11px] ${theme.textMuted}`}>
            دورات المزامنة: {syncStats.syncCount} • زمن الاستجابة: {syncStats.latencyMs}ms
          </p>
        </div>

      </div>

      {/* Middle Section: 8 Sheet Tabs Status Grid */}
      <div className={`p-5 rounded-2xl border ${theme.cardBorder} ${theme.cardBg} space-y-4`}>
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div>
            <h3 className="text-base font-black text-slate-100 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
              <span>تبويبات شيت تشغيل العز مدينة نصر الـ 8</span>
            </h3>
            <p className={`text-xs ${theme.textMuted} mt-0.5`}>
              اضغط على أي شيت لاستعراض بياناته وجداوله فوراً
            </p>
          </div>

          <a
            href={SPREADSHEET_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-bold"
          >
            <span>رابط الشيت الأصلي</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {sheets.map((sheet) => (
            <button
              key={sheet.id}
              onClick={() => onNavigateToTab(sheet.id)}
              className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-cyan-500/50 hover:bg-slate-800/60 transition-all text-right flex flex-col justify-between cursor-pointer group"
            >
              <div>
                <h4 className="font-bold text-xs text-slate-200 group-hover:text-cyan-300 transition-colors">
                  {sheet.title}
                </h4>
                <span className="text-[11px] text-slate-400 font-mono mt-1 block">
                  {sheet.rows.length} صف مسجل
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-800/80 text-[10px] text-cyan-400 font-bold">
                <span>فتح التبويب</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Search Rider ID Live Feed */}
      <div className={`p-5 rounded-2xl border ${theme.cardBorder} ${theme.cardBg} space-y-4`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div>
            <h3 className="text-base font-black text-slate-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <span>استعلام فوري عن حالة كابتن (Rider ID Lookup)</span>
            </h3>
            <p className={`text-xs ${theme.textMuted} mt-0.5`}>
              أدخل كود أي طيار لمعرفة الرد عليه فوراً مع إمكانية إرسال واتساب
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="اكتب كود الطيار (مثال: 4910948)..."
              value={quickRiderSearch}
              onChange={(e) => setQuickRiderSearch(e.target.value)}
              className="w-full pr-9 pl-3 py-1.5 text-xs font-mono rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {searchedRequests.map((req) => {
            const isAccepted = req.statusType === 'accepted';
            const isRejected = req.statusType === 'rejected';

            return (
              <div
                key={req.id}
                className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/50 flex flex-col justify-between space-y-2 hover:border-slate-700"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>{req.tabTitle}</span>
                    <span className="font-mono">{req.timestamp.split(' ')[1] || req.timestamp}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sm text-cyan-300">
                      {req.riderId}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isAccepted
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : isRejected
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}
                    >
                      {req.reply}
                    </span>
                  </div>

                  {req.targetTime && (
                    <p className="text-[11px] text-amber-300 font-mono mt-1">
                      إلى الساعة: {req.targetTime}
                    </p>
                  )}
                  {req.rejectReason && (
                    <p className="text-[11px] text-rose-300 mt-1 line-clamp-1">
                      سبب الرفض: {req.rejectReason}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">{req.requestType}</span>
                  <button
                    onClick={() => {
                      const text = encodeURIComponent(formatRiderWhatsAppMessage(req));
                      window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
                    }}
                    className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                    <span>إرسال</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
