import React from 'react';
import { 
  MessageSquare, 
  Table2, 
  LayoutDashboard, 
  History, 
  Settings,
  CheckCircle2,
  XCircle,
  Clock
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
      label: 'ردود الطيارين (مقبول / مرفوض)',
      icon: MessageSquare,
      badge: `${acceptedCount} مقبول • ${rejectedCount} مرفوض`,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    {
      id: 'sheets' as MainTabId,
      label: 'جداول الشيت الـ 8',
      icon: Table2,
      badge: `${sheetCount} تبويبات شيت`,
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    },
    {
      id: 'dashboard' as MainTabId,
      label: 'نظرة عامة على التشغيل',
      icon: LayoutDashboard,
      badge: 'مدينة نصر',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    },
    {
      id: 'diffs' as MainTabId,
      label: 'سجل التحديثات الحية',
      icon: History,
      badge: diffsCount > 0 ? `${diffsCount} تعديل جديد` : '1ثانية',
      badgeColor: diffsCount > 0 ? 'bg-amber-500 text-black font-extrabold animate-pulse' : 'bg-slate-700/50 text-slate-300',
    },
    {
      id: 'settings' as MainTabId,
      label: 'الإعدادات والرابط',
      icon: Settings,
      badge: 'مباشر',
      badgeColor: 'bg-slate-700/40 text-slate-300',
    },
  ];

  return (
    <div className="w-full border-b border-slate-800/80 bg-black/20 backdrop-blur-sm sticky top-20 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1.5 overflow-x-auto py-2.5 no-scrollbar scroll-smooth">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? `${theme.accent} shadow-md`
                    : `text-slate-300 hover:text-white hover:bg-white/5`
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-inherit' : theme.accentText}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                      isActive ? 'bg-black/20 text-inherit border-black/20' : tab.badgeColor
                    }`}
                  >
                    {tab.badge}
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
