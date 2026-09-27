import React from 'react';
import { Check, X, Bell, MessageSquare, ArrowUpRight } from 'lucide-react';
import { RiderRequest } from '../types';

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
  onAccept?: (tabTitle: string, riderId: string) => void;
  onReject?: (tabTitle: string, riderId: string) => void;
  onViewReplies?: () => void;
}

export const WhatsAppNotificationToast: React.FC<WhatsAppNotificationToastProps> = ({
  notification,
  onClose,
  onAccept,
  onReject,
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
                  طلب جديد
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {notification.tabTitle} • الآن
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

        {/* Action Buttons like interactive notification */}
        <div className="flex items-center gap-2 pt-1">
          {onAccept && (
            <button
              onClick={() => {
                onAccept(notification.tabTitle, notification.riderId);
                onClose();
              }}
              className="flex-1 py-1.5 px-2.5 bg-[#25d366] hover:bg-[#20ba59] text-black font-extrabold text-xs rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>قبول الطلب</span>
            </button>
          )}

          {onReject && (
            <button
              onClick={() => {
                onReject(notification.tabTitle, notification.riderId);
                onClose();
              }}
              className="py-1.5 px-3 bg-rose-600/30 hover:bg-rose-600/40 text-rose-300 border border-rose-500/40 font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>رفض</span>
            </button>
          )}

          {onViewReplies && (
            <button
              onClick={() => {
                onViewReplies();
                onClose();
              }}
              className="p-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl flex items-center gap-1 transition-all cursor-pointer"
              title="عرض في جدول الردود"
            >
              <span>عرض</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
