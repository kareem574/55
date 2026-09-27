import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Send, 
  Copy, 
  Check, 
  Filter, 
  Share2, 
  ExternalLink,
  MessageSquare,
  Sparkles,
  ArrowUpDown,
  Plus,
  Radio,
  FileSpreadsheet,
  AlertTriangle,
  Bell,
  Volume2,
  Calendar
} from 'lucide-react';
import { RiderRequest, ThemeConfig } from '../types';
import { formatRiderWhatsAppMessage, formatBulkRidersSummary } from '../services/sheets';

interface RiderRepliesManagerProps {
  theme: ThemeConfig;
  requests: RiderRequest[];
  sheetTitles: string[];
  syncIntervalSec: number;
  onTestWhatsAppAlert?: () => void;
  hasPushPermission?: boolean;
  onEnableNotifications?: () => void;
  isSheetRestricted?: boolean;
  onManualRefresh?: () => void;
}

export const RiderRepliesManager: React.FC<RiderRepliesManagerProps> = ({
  theme,
  requests,
  sheetTitles,
  syncIntervalSec,
  onTestWhatsAppAlert,
  hasPushPermission,
  onEnableNotifications,
  isSheetRestricted,
  onManualRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'accepted' | 'rejected' | 'pending'>('all');
  const [selectedTabFilter, setSelectedTabFilter] = useState<string>('all');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [bulkCopied, setBulkCopied] = useState(false);

  // Extract all distinct dates from timestamps
  const availableDates = useMemo(() => {
    const dates = new Set<string>();
    requests.forEach(r => {
      if (r.timestamp && r.timestamp !== 'غير مسجل') {
        const datePart = r.timestamp.split(' ')[0];
        if (datePart) dates.add(datePart);
      }
    });
    return Array.from(dates);
  }, [requests]);

  // Counts
  const acceptedCount = useMemo(() => requests.filter(r => r.statusType === 'accepted').length, [requests]);
  const rejectedCount = useMemo(() => requests.filter(r => r.statusType === 'rejected').length, [requests]);
  const pendingCount = useMemo(() => requests.filter(r => r.statusType === 'pending').length, [requests]);

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      // Status filter
      if (statusFilter !== 'all' && req.statusType !== statusFilter) {
        return false;
      }
      // Tab filter
      if (selectedTabFilter !== 'all' && req.tabTitle !== selectedTabFilter) {
        return false;
      }
      // Date filter (Timestamp)
      if (selectedDateFilter !== 'all') {
        const reqDate = req.timestamp.split(' ')[0] || req.timestamp;
        if (reqDate !== selectedDateFilter && !req.timestamp.includes(selectedDateFilter)) {
          return false;
        }
      }
      // Search query (rider ID, tab title, reply, reason, timestamp)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inId = req.riderId.toLowerCase().includes(q);
        const inTab = req.tabTitle.toLowerCase().includes(q);
        const inReply = req.reply.toLowerCase().includes(q);
        const inReason = (req.rejectReason || req.reason || '').toLowerCase().includes(q);
        const inTimestamp = req.timestamp.toLowerCase().includes(q);
        return inId || inTab || inReply || inReason || inTimestamp;
      }
      return true;
    });
  }, [requests, statusFilter, selectedTabFilter, selectedDateFilter, searchQuery]);

  // WhatsApp sender
  const handleSendWhatsApp = (req: RiderRequest) => {
    const text = encodeURIComponent(formatRiderWhatsAppMessage(req));
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  // Copy single message
  const handleCopyMessage = (req: RiderRequest) => {
    const text = formatRiderWhatsAppMessage(req);
    navigator.clipboard.writeText(text);
    setCopiedId(req.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Bulk copy summary for broadcast
  const handleBulkCopy = () => {
    const summary = formatBulkRidersSummary(filteredRequests, statusFilter);
    navigator.clipboard.writeText(summary);
    setBulkCopied(true);
    setTimeout(() => setBulkCopied(false), 2500);
  };

  return (
    <div className="space-y-5">
      
      {/* Top Operational Status & Actions Bar */}
      <div className={`p-4 sm:p-5 rounded-2xl border ${theme.cardBorder} ${theme.cardBg} space-y-4`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <MessageSquare className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-100">
                  متابعة وإرسال ردود الطيارين (مقبول / مرفوض)
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                  تحديث لحظي
                </span>
              </div>
              <p className={`text-xs ${theme.textMuted} mt-0.5`}>
                استعراض فوري لكافة طلبات الكباتن من الشيت وإرسال الردود لهم مباشرة عبر الواتساب أو التقارير
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleBulkCopy}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border ${theme.cardBorder} bg-slate-900/80 hover:bg-slate-800 text-slate-200 flex items-center gap-1.5 transition-all cursor-pointer`}
              title="نسخ تقرير مجمع لإرساله لجروب الواتساب أو التليجرام"
            >
              {bulkCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-cyan-400" />}
              <span>{bulkCopied ? 'تم نسخ التقرير المجمع' : 'نسخ تقرير الحالات للجروب'}</span>
            </button>
          </div>
        </div>

        {/* Google Sheet Live Access Notice */}
        {isSheetRestricted && (
          <div className="p-3 rounded-xl border border-amber-500/40 bg-amber-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-inner">
            <div className="flex items-start sm:items-center gap-2.5">
              <FileSpreadsheet className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
              <div className="space-y-0.5">
                <span className="font-bold text-amber-200 block">
                  ربط جوجل شيت المباشر (Google Sheet Live Sync):
                </span>
                <p className="text-[11px] text-amber-300/80">
                  لتمكين التطبيق من سحب التعديلات من ملف الشيت أونلاين كل ثانية: افتح ملف الشيت واضغط <b>مشاركة (Share)</b> ثم اجعل الوصول العام: <b>أي شخص لديه الرابط (Anyone with the link)</b>.
                </p>
              </div>
            </div>

            {onManualRefresh && (
              <button
                type="button"
                onClick={onManualRefresh}
                className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 shrink-0 cursor-pointer self-start sm:self-center transition-all"
              >
                إعادة فحص الاتصال بالشيت ↻
              </button>
            )}
          </div>
        )}

        {/* WhatsApp Notification Live Controller Banner */}
        <div className="p-3 sm:p-3.5 rounded-xl border border-[#25d366]/40 bg-[#0d1e16] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#25d366] text-[#0d1e16] flex items-center justify-center shrink-0 shadow-md">
              <Bell className="w-5 h-5 fill-current animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-100">
                  إشعارات الواتساب الفورية لكافة الطلبات
                </span>
                <span className="text-[10px] px-2 py-0.2 rounded-full font-bold bg-[#25d366]/20 text-[#25d366] border border-[#25d366]/30">
                  نغمة واهتزاز
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                أي طلب طيار يصل أو يتم تسجيله يصدر نغمة الواتساب واهتزاز الهاتف وإشعاراً فورياً بالشاشة
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            {onTestWhatsAppAlert && (
              <button
                type="button"
                onClick={onTestWhatsAppAlert}
                className="px-3 py-1.5 rounded-xl text-xs font-bold border border-[#25d366]/50 bg-[#163625] hover:bg-[#214c35] text-[#25d366] flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>تجربة صوت الواتساب</span>
              </button>
            )}

            {onEnableNotifications && (
              <button
                type="button"
                onClick={onEnableNotifications}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  hasPushPermission
                    ? 'bg-[#25d366]/20 text-[#25d366] border border-[#25d366]/40'
                    : 'bg-[#25d366] hover:bg-[#20ba59] text-black shadow-md'
                }`}
              >
                <Bell className="w-3.5 h-3.5" />
                <span>{hasPushPermission ? 'الإشعارات مفعلة' : 'تفعيل إشعارات الهاتف'}</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Interactive Status Cards / Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          
          {/* Card All */}
          <button
            onClick={() => setStatusFilter('all')}
            className={`p-3.5 rounded-xl border text-right transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-slate-800 border-cyan-500 ring-2 ring-cyan-500/40'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>إجمالي الطلبات</span>
              <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-2xl font-black text-slate-100 font-mono">
              {requests.length}
            </div>
            <span className="text-[10px] text-cyan-400 font-semibold">كل التبويبات</span>
          </button>

          {/* Card Accepted */}
          <button
            onClick={() => setStatusFilter('accepted')}
            className={`p-3.5 rounded-xl border text-right transition-all cursor-pointer ${
              statusFilter === 'accepted'
                ? 'bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/40'
                : 'bg-slate-900/60 border-slate-800 hover:border-emerald-800/60'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-emerald-400 mb-1">
              <span>تم الرد (مقبول)</span>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <div className="text-2xl font-black text-emerald-400 font-mono">
              {acceptedCount}
            </div>
            <span className="text-[10px] text-emerald-500 font-semibold">جاهز للتنفيذ</span>
          </button>

          {/* Card Rejected */}
          <button
            onClick={() => setStatusFilter('rejected')}
            className={`p-3.5 rounded-xl border text-right transition-all cursor-pointer ${
              statusFilter === 'rejected'
                ? 'bg-rose-950/60 border-rose-500 ring-2 ring-rose-500/40'
                : 'bg-slate-900/60 border-slate-800 hover:border-rose-800/60'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-rose-400 mb-1">
              <span>تم الرد (مرفوض / غير مقبول)</span>
              <XCircle className="w-3.5 h-3.5" />
            </div>
            <div className="text-2xl font-black text-rose-400 font-mono">
              {rejectedCount}
            </div>
            <span className="text-[10px] text-rose-400/80 font-semibold">مكسور / سيستم / شروط</span>
          </button>

          {/* Card Pending */}
          <button
            onClick={() => setStatusFilter('pending')}
            className={`p-3.5 rounded-xl border text-right transition-all cursor-pointer ${
              statusFilter === 'pending'
                ? 'bg-amber-950/60 border-amber-500 ring-2 ring-amber-500/40'
                : 'bg-slate-900/60 border-slate-800 hover:border-amber-800/60'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-amber-400 mb-1">
              <span>قيد الإنتظار والمراجعة</span>
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div className="text-2xl font-black text-amber-400 font-mono">
              {pendingCount}
            </div>
            <span className="text-[10px] text-amber-400/80 font-semibold">يحتاج قرار المشرف</span>
          </button>

        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className={`p-3 sm:p-4 rounded-2xl border ${theme.cardBorder} ${theme.cardBg} flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3`}>
        
        {/* Search Input for Rider ID */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="بحث فوري برقم كود الطيار (Rider ID)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700/80 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              إلغاء
            </button>
          )}
        </div>

        {/* Filter Controls: Date, Tab, and Count */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 w-full md:w-auto">
          {/* Date Selection Filter (Timestamp) */}
          <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
            <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <select
              value={selectedDateFilter}
              onChange={(e) => setSelectedDateFilter(e.target.value)}
              className="flex-1 sm:flex-initial px-2.5 py-1.5 text-xs rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="all">كل التواريخ ({availableDates.length > 0 ? availableDates.length : 'الكل'})</option>
              {availableDates.map((dateStr) => (
                <option key={dateStr} value={dateStr}>
                  {dateStr}
                </option>
              ))}
            </select>
          </div>

          {/* Tab Selection Filter */}
          <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
            <select
              value={selectedTabFilter}
              onChange={(e) => setSelectedTabFilter(e.target.value)}
              className="flex-1 sm:flex-initial px-2.5 py-1.5 text-xs rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">كافة التبويبات الـ 8</option>
              {sheetTitles.map((title) => (
                <option key={title} value={title}>
                  {title}
                </option>
              ))}
            </select>

            <span className={`text-xs ${theme.textMuted} mr-auto sm:mr-2 shrink-0 font-bold`}>
              ({filteredRequests.length})
            </span>
          </div>
        </div>

      </div>

      {/* Main Requests Cards & Reply Dispatch Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredRequests.length === 0 ? (
          <div className={`col-span-full p-12 text-center rounded-2xl border ${theme.cardBorder} ${theme.cardBg} space-y-2`}>
            <p className="text-sm font-bold text-slate-300">
              لا توجد طلبات مطابقة لمعايير البحث والفلترة المحددة
            </p>
            <p className={`text-xs ${theme.textMuted}`}>
              تأكد من كود الطيار أو قم بتبديل الفلتر لعرض جميع الطلبات
            </p>
          </div>
        ) : (
          filteredRequests.map((req) => {
            const isAccepted = req.statusType === 'accepted';
            const isRejected = req.statusType === 'rejected';
            const isPending = req.statusType === 'pending';

            return (
              <div
                key={req.id}
                className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between group relative ${
                  isAccepted
                    ? 'border-emerald-900/60 bg-emerald-950/20 hover:border-emerald-600/80 shadow-sm'
                    : isRejected
                    ? 'border-rose-900/60 bg-rose-950/20 hover:border-rose-600/80 shadow-sm'
                    : 'border-amber-900/60 bg-amber-950/20 hover:border-amber-600/80 shadow-sm'
                }`}
              >
                <div>
                  {/* Card Header: Tab & Timestamp */}
                  <div className="flex items-center justify-between text-[11px] mb-2.5 gap-2">
                    <span className="font-semibold text-slate-300 bg-slate-900/90 px-2 py-0.5 rounded-md border border-slate-800">
                      {req.tabTitle}
                    </span>
                    <div className="flex items-center gap-1.5 font-mono text-slate-300 bg-slate-950/80 px-2 py-0.5 rounded-md border border-slate-800/80 shrink-0" title="تاريخ ووقت التسجيل في الشيت (Timestamp)">
                      <Calendar className="w-3 h-3 text-cyan-400 shrink-0" />
                      <span>{req.timestamp}</span>
                    </div>
                  </div>

                  {/* Rider ID Pill */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-bold">كود الطيار:</span>
                      <span className="text-base font-black font-mono text-cyan-300 bg-cyan-950/50 px-2.5 py-0.5 rounded-lg border border-cyan-700/50">
                        {req.riderId}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`text-xs font-black px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                        isAccepted
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : isRejected
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}
                    >
                      {isAccepted && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {isRejected && <XCircle className="w-3.5 h-3.5" />}
                      {isPending && <Clock className="w-3.5 h-3.5" />}
                      <span>{req.reply || (isAccepted ? 'مقبول' : isPending ? 'قيد المراجعة' : 'مرفوض')}</span>
                    </span>
                  </div>

                  {/* Details List */}
                  <div className="space-y-1.5 text-xs text-slate-300 pb-3 border-b border-slate-800/80">
                    <div className="flex items-center justify-between">
                      <span className={theme.textMuted}>نوع الإجراء:</span>
                      <span className="font-semibold text-slate-200">{req.requestType}</span>
                    </div>
                    {req.targetTime && (
                      <div className="flex items-center justify-between">
                        <span className={theme.textMuted}>التوقيت المطلوب:</span>
                        <span className="font-mono font-bold text-amber-300">{req.targetTime}</span>
                      </div>
                    )}
                    {req.reason && (
                      <div className="flex items-start justify-between gap-2">
                        <span className={`${theme.textMuted} shrink-0`}>السبب:</span>
                        <span className="font-medium text-slate-200 text-left line-clamp-1">{req.reason}</span>
                      </div>
                    )}
                  </div>

                  {/* Prominent Operational Status & Rejection Reason Banner */}
                  {isRejected && (
                    <div className="mt-2.5 p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/50 text-xs flex items-start gap-2 shadow-inner">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-black text-rose-300 block">سبب الرفض في الشيت:</span>
                        <span className="text-xs font-bold text-rose-100">{req.rejectReason || req.reply}</span>
                      </div>
                    </div>
                  )}

                  {isPending && (
                    <div className="mt-2.5 p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-xs flex items-center gap-2 shadow-inner">
                      <Clock className="w-4 h-4 text-amber-400 shrink-0 animate-spin" />
                      <span className="text-xs font-bold text-amber-200">طلب جديد قيد الإنتظار - بانتظار قرار المشرف</span>
                    </div>
                  )}

                  {isAccepted && (
                    <div className="mt-2.5 p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs flex items-center gap-2 shadow-inner">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-xs font-bold text-emerald-200">تم قبول الطلب - جاهز للإرسال للكابتن</span>
                    </div>
                  )}
                </div>

                {/* Card Actions Footer: WhatsApp Dispatch from Sheet Data */}
                <div className="pt-3 mt-1">
                  {/* Send WhatsApp & Copy Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSendWhatsApp(req)}
                      className="flex-1 py-2 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
                      title="إرسال الرد للكابتن على الواتساب مع رسالة جاهزة"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>إرسال واتساب</span>
                    </button>

                    <button
                      onClick={() => handleCopyMessage(req)}
                      className="p-2 px-3 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                      title="نسخ نص الرد بالكامل للحافظة"
                    >
                      {copiedId === req.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedId === req.id ? 'تم النسخ' : 'نسخ النص'}</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
