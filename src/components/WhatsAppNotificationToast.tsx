import React from 'react';
import { X, MessageSquare, ArrowUpRight } from 'lucide-react';

export interface ToastNotificationData {
  id: string;
  riderId: string;
  tabTitle: string;
  requestType: string;
  targetTime?: string;
  reason?: string;
  timestamp: string;
}

interface WhatsAppNotificationToastProps {
  notification: ToastNotificationData | null;
  onClose: () => void;
  onViewReplies?: () => void;
}

export const WhatsAppNotificationToast: React.FC<WhatsAppNotificationToastProps> = ({
  notification,
  onClose,
  onViewReplies,
}) => {
  if (!notification) return null;

  return (
    <div className="fixed top-4 inset-x-4 sm:inset-x-auto sm:right-6 sm:max-w-md z-50 animate-in slide-in-from-top-6 duration-300">
      <div 
        dir="rtl"
        className="bg-[#111b21] border border-[#25d366]/40 shadow-2xl rounded-2xl p-3.5 sm:p-4 text-white ring-2 ring-[#25d366]/20 backdrop-blur-md"
      >
        {/* WhatsApp Header Bar */}
        <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-700/60">
          <div className="flex items-center gap-2.5">
            {/* WhatsApp Green Icon */}
            <div className="w-8 h-8 rounded-full bg-[#25d366] flex items-center justify-center text-[#111b21] shadow-md shrink-0">
              <MessageSquare className="w-4 h-4 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-100">تشغيل العز مدينة نصر</span>
                <span className="text-[10px] bg-[#25d366]/20 text-[#25d366] px-1.5 py-0.2 rounded font-bold">
                  طلب بالشيت
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {notification.tabTitle} • {notification.timestamp}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Content */}
        <div className="space-y-1 mb-3">
          <div className="flex items-baseline gap-2">
            <span className="text-xs text-slate-400">كود الطيار:</span>
            <span className="font-mono font-black text-sm text-[#25d366] bg-[#25d366]/10 px-2 py-0.5 rounded">
              {notification.riderId}
            </span>
          </div>

          <p className="text-xs text-slate-200 font-medium">
            {notification.requestType}
            {notification.targetTime && ` (إلى ${notification.targetTime})`}
            {notification.reason && ` - السبب: ${notification.reason}`}
          </p>
        </div>

        {/* Action Button: View Details in Replies */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
          <span className="text-[11px] text-slate-400">مسجل بالشيت الآن</span>

          {onViewReplies && (
            <button
              onClick={() => {
                onViewReplies();
                onClose();
              }}
              className="py-1 px-3 bg-[#25d366]/20 hover:bg-[#25d366]/30 text-[#25d366] border border-[#25d366]/40 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
              title="عرض في جدول الردود"
            >
              <span>عرض في جدول الحالات</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
