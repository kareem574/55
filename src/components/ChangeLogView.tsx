import React from 'react';
import { 
  History, 
  Trash2, 
  ArrowRight, 
  Bell, 
  BellOff, 
  Clock, 
  Table2, 
  CheckCircle2, 
  Zap,
  Activity
} from 'lucide-react';
import { SheetDiff, ThemeConfig } from '../types';

interface ChangeLogViewProps {
  theme: ThemeConfig;
  diffs: SheetDiff[];
  onClearDiffs: () => void;
  isSoundEnabled: boolean;
  onToggleSound: () => void;
  syncIntervalSec: number;
  isPollingActive: boolean;
}

export const ChangeLogView: React.FC<ChangeLogViewProps> = ({
  theme,
  diffs,
  onClearDiffs,
  isSoundEnabled,
  onToggleSound,
  syncIntervalSec,
  isPollingActive,
}) => {
  return (
    <div className="space-y-4">
      
      {/* Header Card */}
      <div className={`p-4 sm:p-5 rounded-2xl border ${theme.cardBorder} ${theme.cardBg} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <History className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-slate-100">
                سجل التحديثات الحية وتدقيق التغييرات (Audit Log)
              </h3>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${theme.badge}`}>
                مباشر {syncIntervalSec}ث
              </span>
            </div>
            <p className={`text-xs ${theme.textMuted} mt-0.5`}>
              يرصد التطبيق التغييرات في أي خلية أو صف كل 1 ثانية ويوثقها تلقائياً
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={onToggleSound}
            className={`px-3 py-2 rounded-xl text-xs font-bold border ${theme.cardBorder} flex items-center gap-1.5 transition-all ${
              isSoundEnabled ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-slate-900/60 text-slate-400'
            }`}
            title="تفعيل/تعطيل التنبيه الصوتي عند حدوث أي تعديل في الشيت"
          >
            {isSoundEnabled ? <Bell className="w-3.5 h-3.5 text-cyan-400" /> : <BellOff className="w-3.5 h-3.5" />}
            <span>{isSoundEnabled ? 'الصوت مفعّل' : 'الصوت معطل'}</span>
          </button>

          {diffs.length > 0 && (
            <button
              onClick={onClearDiffs}
              className="px-3 py-2 rounded-xl text-xs font-bold border border-rose-900/40 bg-rose-950/30 text-rose-300 hover:bg-rose-900/50 flex items-center gap-1.5 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>مسح السجل</span>
            </button>
          )}
        </div>
      </div>

      {/* Diffs List Container */}
      <div className={`rounded-2xl border ${theme.cardBorder} ${theme.cardBg} overflow-hidden shadow-xl`}>
        
        {diffs.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-200">
              البيانات متطابقة ومستقرة حالياً
            </h4>
            <p className={`text-xs ${theme.textMuted} max-w-md mx-auto`}>
              عند قيام أي مستخدم بتعديل خلايا شيت "تشغيل مدينة نصر" على Google Drive، ستظهر التغييرات هنا في غضون ثانية واحدة فور رصدها.
            </p>
            {isPollingActive && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/60 text-[11px] text-cyan-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>محرك المراقبة نشط كل {syncIntervalSec} ثانية</span>
              </div>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {diffs.map((diff) => (
              <div
                key={diff.id}
                className="p-4 hover:bg-white/5 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0 mt-0.5">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-100 flex items-center gap-1">
                        <Table2 className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{diff.sheetTitle}</span>
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-300 font-mono bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">
                        الصف {diff.rowIndex} • {diff.columnName} (العمود {diff.columnIndex})
                      </span>
                    </div>

                    {/* Diff Values Pill */}
                    <div className="flex items-center gap-2 mt-2 font-mono text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-rose-950/40 text-rose-300 border border-rose-800/40 line-through">
                        {diff.oldValue}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                      <span className="px-2 py-0.5 rounded bg-emerald-950/50 text-emerald-300 border border-emerald-700/50 font-bold">
                        {diff.newValue}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px] self-end md:self-center">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{diff.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
};
