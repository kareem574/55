import React from 'react';
import { 
  MessageSquare, 
  Table2, 
  LayoutDashboard, 
  History, 
  Settings,
} from 'lucide-react';
import { ThemeConfig } from '../types';

export type MainTabId = 'replies' | 'sheets' | 'dashboard' | 'diffs' | 'settings';

interface NavigationTabsProps {
  theme: ThemeConfig;
  activeTab: MainTabId;
  onTabChange: (tab: MainTabId) => void;
  diffsCount: number;
  sheetCount: number;
  acceptedCount: number;
  rejectedCount: number;
  pendingCount: number;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  theme,
  activeTab,
  onTabChange,
  diffsCount,
  sheetCount,
  acceptedCount,
  rejectedCount,
  pendingCount,
}) => {
  const tabs = [
    {
      id: 'replies' as MainTabId,
      shortLabel: 'الردود',
      label: 'ردود الطيارين',
      icon: MessageSquare,
      badge: `${acceptedCount}✓`,
      desktopBadge: `${acceptedCount} مقبول • ${rejectedCount} مرفوض`,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    {
      id: 'sheets' as MainTabId,
      shortLabel: 'الشيتات',
      label: 'جداول الشيت الـ 8',
      icon: Table2,
      badge: `${sheetCount}`,
      desktopBadge: `${sheetCount} تبويبات شيت`,
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    },
    {
      id: 'dashboard' as MainTabId,
      shortLabel: 'التشغيل',
      label: 'نظرة عامة على التشغيل',
      icon: LayoutDashboard,
      badge: 'إحصائيات',
      desktopBadge: 'مدينة نصر',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    },
    {
      id: 'diffs' as MainTabId,
      shortLabel: 'السجل',
      label: 'سجل التحديثات الحية',
      icon: History,
      badge: diffsCount > 0 ? `${diffsCount}!` : '',
      desktopBadge: diffsCount > 0 ? `${diffsCount} تعديل جديد` : '1ثانية',
      badgeColor: diffsCount > 0 ? 'bg-amber-500 text-black font-extrabold animate-pulse' : 'bg-slate-700/50 text-slate-300',
    },
    {
      id: 'settings' as MainTabId,
      shortLabel: 'الإعدادات',
      label: 'الإعدادات والرابط',
      icon: Settings,
      badge: '',
      desktopBadge: 'مباشر',
      badgeColor: 'bg-slate-700/40 text-slate-300',
    },
  ];

  return (
    <div className="w-full border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-14 sm:top-20 z-30">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-2 no-scrollbar scroll-smooth">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  isActive
                    ? `${theme.accent} shadow-md`
                    : `text-slate-300 hover:text-white hover:bg-white/5 active:scale-95`
                }`}
              >
                <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? 'text-inherit' : theme.accentText}`} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
                
                {/* Mobile Badge */}
                {tab.badge && (
                  <span
                    className={`sm:hidden text-[9px] px-1.5 py-0.2 rounded-full font-bold border ${
                      isActive ? 'bg-black/30 text-inherit border-black/20' : tab.badgeColor
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}

                {/* Desktop Badge */}
                {tab.desktopBadge && (
                  <span
                    className={`hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                      isActive ? 'bg-black/20 text-inherit border-black/20' : tab.badgeColor
                    }`}
                  >
                    {tab.desktopBadge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
