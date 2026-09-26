import React, { useState } from 'react';
import { 
  Settings, 
  ExternalLink, 
  Check, 
  RefreshCw, 
  Clock, 
  Volume2, 
  Download,
  RotateCcw,
  FileSpreadsheet,
  Share2,
  CheckCircle2
} from 'lucide-react';
import { ThemeConfig, SyncStats } from '../types';
import { playUpdateChime } from '../utils/audio';
import { SPREADSHEET_URL, SPREADSHEET_ID } from '../services/sheets';

interface SettingsViewProps {
  theme: ThemeConfig;
  syncIntervalSec: number;
  onUpdateSyncInterval: (sec: number) => void;
  isPollingActive: boolean;
  onTogglePolling: () => void;
  isSoundEnabled: boolean;
  onToggleSound: () => void;
  syncStats: SyncStats;
  onManualRefresh: () => void;
  onExportAllJson: () => void;
  onResetData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  theme,
  syncIntervalSec,
  onUpdateSyncInterval,
  isPollingActive,
  onTogglePolling,
  isSoundEnabled,
  onToggleSound,
  syncStats,
  onManualRefresh,
  onExportAllJson,
  onResetData,
}) => {
  const [resetDone, setResetDone] = useState(false);

  const intervals = [
    { sec: 1, label: '1 ثانية (مباشر فائق السرعة - Real-time)' },
    { sec: 2, label: '2 ثانية (مستقر وسريع)' },
    { sec: 3, label: '3 ثوانٍ (متوازن)' },
    { sec: 5, label: '5 ثوانٍ (اقتصادي)' },
  ];

  const handleReset = () => {
    if (window.confirm('هل تريد استعادة البيانات الأصلية لشيت تشغيل العز مدينة نصر؟')) {
      onResetData();
      setResetDone(true);
      setTimeout(() => setResetDone(false), 2500);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className={`p-5 rounded-2xl border ${theme.cardBorder} ${theme.cardBg} flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-100">
              إعدادات تطبيق "تشغيل العز مدينة نصر"
            </h3>
            <p className={`text-xs ${theme.textMuted} mt-0.5`}>
              التحكم في سرعة المزامنة (1 ثانية) وإدارة الرابط والتنبيهات الصوتية
            </p>
          </div>
        </div>
      </div>

      {/* 1. Direct Google Sheet Link Card */}
      <div className={`p-5 rounded-2xl border ${theme.cardBorder} ${theme.cardBg} space-y-4`}>
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800/80">
          <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
          <h4 className="text-sm font-bold text-slate-100">
            رابط شيت Google الأصلي (بدون أي تعقيدات تسجيل دخول)
          </h4>
        </div>

        <p className={`text-xs ${theme.textMuted}`}>
          التطبيق يعمل بشكل مستقل وجاهز للنشر المباشر دون الحاجة لأي إعدادات Google Cloud أو تسجيل دخول معقد:
        </p>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 block">رابط الشيت المحفوظ:</span>
            <code className="text-xs text-cyan-400 font-mono break-all font-bold">
              {SPREADSHEET_URL}
            </code>
          </div>

          <a
            href={SPREADSHEET_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all self-start sm:self-center shrink-0"
          >
            <span>فتح الشيت في Google Docs</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* 2. Frequency Settings */}
      <div className={`p-5 rounded-2xl border ${theme.cardBorder} ${theme.cardBg} space-y-4`}>
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            <h4 className="text-sm font-bold text-slate-100">
              تردد سرعة التحديث اللحظي (Refresh Rate)
            </h4>
          </div>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
            محدد حالياً: {syncIntervalSec} ثانية
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {intervals.map((item) => {
            const isSelected = syncIntervalSec === item.sec;
            return (
              <button
                key={item.sec}
                type="button"
                onClick={() => onUpdateSyncInterval(item.sec)}
                className={`p-3 rounded-xl border text-right transition-all flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? `${theme.cardBg} ${theme.accentBorder} ring-2 ring-cyan-500/30 font-bold text-cyan-300`
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span className="text-xs">{item.label}</span>
                {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-300 font-semibold">حالة المزامنة المستمرة:</span>
            <span className={`text-xs font-bold ${isPollingActive ? 'text-emerald-400' : 'text-amber-400'}`}>
              {isPollingActive ? 'نشطة وتعمل' : 'متوقفة مؤقتاً'}
            </span>
          </div>

          <button
            onClick={onTogglePolling}
            className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
              isPollingActive ? 'border-amber-600/50 text-amber-400 hover:bg-amber-950/20' : 'bg-emerald-600 text-white'
            }`}
          >
            {isPollingActive ? 'إيقاف المزامنة مؤقتاً' : 'تفعيل المزامنة التلقائية'}
          </button>
        </div>
      </div>

      {/* 3. Audio Chime Alerts */}
      <div className={`p-5 rounded-2xl border ${theme.cardBorder} ${theme.cardBg} space-y-4`}>
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-purple-400" />
            <h4 className="text-sm font-bold text-slate-100">
              التنبيهات الصوتية للتغييرات الحية
            </h4>
          </div>
          <button
            onClick={playUpdateChime}
            className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>تجربة صوت التنبيه</span>
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-200">
              تشغيل نغمة خفيفة عند تعديل أو وصول أي طلب جديد
            </p>
            <p className={`text-[11px] ${theme.textMuted} mt-0.5`}>
              ينبه المراقبين في غرفة العمليات عند إدخال بيانات جديدة فوراً
            </p>
          </div>

          <button
            onClick={onToggleSound}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              isSoundEnabled
                ? 'bg-purple-600 border-purple-500 text-white'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            {isSoundEnabled ? <Check className="w-4 h-4 stroke-[3]" /> : <span className="text-xs font-bold">معطل</span>}
          </button>
        </div>
      </div>

      {/* 4. Reset & Backup Actions */}
      <div className={`p-5 rounded-2xl border ${theme.cardBorder} ${theme.cardBg} flex flex-col sm:flex-row items-center justify-between gap-4`}>
        <div>
          <h4 className="text-sm font-bold text-slate-100">استعادة البيانات الأصلية للشيت</h4>
          <p className={`text-xs ${theme.textMuted} mt-0.5`}>
            إعادة تحميل كافة السجلات والـ 8 تبويبات من النسخة الأصلية
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-xl text-xs font-bold border border-amber-800/50 bg-amber-950/30 text-amber-300 hover:bg-amber-900/50 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{resetDone ? 'تمت الاستعادة بنجاح' : 'استعادة الأصل'}</span>
          </button>

          <button
            onClick={onExportAllJson}
            className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>تصدير JSON</span>
          </button>
        </div>
      </div>

    </div>
  );
};
