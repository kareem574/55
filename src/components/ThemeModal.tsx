import React from 'react';
import { X, Check, Sparkles } from 'lucide-react';
import { THEMES } from '../themes';
import { ThemeConfig, ThemeId } from '../types';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeConfig;
  onSelectTheme: (themeId: ThemeId) => void;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className={`w-full max-w-2xl rounded-2xl border p-6 shadow-2xl ${currentTheme.cardBg} ${currentTheme.cardBorder} relative`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-700/50 mb-5">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${currentTheme.badge} border`}>
              <Sparkles className={`w-5 h-5 ${currentTheme.accentText}`} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-100">
                اختيار الثيم الاحترافي لـ "تشغيل مدينة نصر"
              </h3>
              <p className={`text-xs ${currentTheme.textMuted}`}>
                اختر النمط البصري المناسب لشاشات المتابعة وغرف العمليات
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Themes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[60vh] overflow-y-auto pr-1">
          {Object.values(THEMES).map((theme) => {
            const isSelected = currentTheme.id === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => {
                  onSelectTheme(theme.id);
                  onClose();
                }}
                className={`flex flex-col text-right p-4 rounded-xl border transition-all text-left group relative cursor-pointer ${
                  isSelected
                    ? `${theme.accentBorder} ring-2 ring-cyan-500/40 ${theme.cardBg} shadow-lg`
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-600 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-100">
                      {theme.name}
                    </span>
                  </div>
                  {isSelected && (
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500 text-black">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  )}
                </div>

                <span className="text-[11px] text-slate-400 mb-3">
                  {theme.nameEn}
                </span>

                {/* Color Swatches Preview */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60 w-full">
                  <div className={`w-5 h-5 rounded-full ${theme.bg.split(' ')[0]} border border-slate-700 shadow-sm`} title="خلفية الصفحة" />
                  <div className={`w-5 h-5 rounded-full ${theme.headerBg.split(' ')[0]} border border-slate-700 shadow-sm`} title="الرأس" />
                  <div className={`w-5 h-5 rounded-full ${theme.accent.split(' ')[0]} border border-white/20 shadow-sm`} title="لون التمييز" />
                  <span className={`text-[10px] mr-auto px-2 py-0.5 rounded-full border ${theme.badge}`}>
                    معاينة
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="mt-5 pt-4 border-t border-slate-700/50 flex justify-end">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-xs font-bold ${currentTheme.accent}`}
          >
            إغلاق وتطبيق
          </button>
        </div>
      </div>
    </div>
  );
};
