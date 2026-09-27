import React, { useState } from 'react';
import { THEMES } from './themes';
import { ThemeId, ThemeConfig } from './types';
import { useLiveSheetSync } from './hooks/useLiveSheetSync';
import { Header } from './components/Header';
import { NavigationTabs, MainTabId } from './components/NavigationTabs';
import { RiderRepliesManager } from './components/RiderRepliesManager';
import { OperationsDashboard } from './components/OperationsDashboard';
import { LiveSheetsExplorer } from './components/LiveSheetsExplorer';
import { ChangeLogView } from './components/ChangeLogView';
import { SettingsView } from './components/SettingsView';
import { ThemeModal } from './components/ThemeModal';
import { ImportDataModal } from './components/ImportDataModal';
import { SheetSelectorModal } from './components/SheetSelectorModal';
import { WhatsAppNotificationToast } from './components/WhatsAppNotificationToast';

export default function App() {
  // Theme state
  const [currentThemeId, setCurrentThemeId] = useState<ThemeId>(() => {
    return (localStorage.getItem('nasr_city_theme') as ThemeId) || 'navy-ops';
  });
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isSheetSelectorModalOpen, setIsSheetSelectorModalOpen] = useState(false);

  const theme: ThemeConfig = THEMES[currentThemeId] || THEMES['navy-ops'];

  const handleSelectTheme = (newThemeId: ThemeId) => {
    setCurrentThemeId(newThemeId);
    localStorage.setItem('nasr_city_theme', newThemeId);
  };

  // Tabs state - Default to 'replies'
  const [activeMainTab, setActiveMainTab] = useState<MainTabId>('replies');
  const [activeSheetTabId, setActiveSheetTabId] = useState<string>('tab-increase-shifts');

  // Live Sheet Engine with Google OAuth API v4 & Auto-Sync
  const {
    spreadsheetId,
    setSpreadsheetId,
    sheets,
    riderRequests,
    diffs,
    clearDiffs,
    syncIntervalSec,
    setSyncIntervalSec,
    isPollingActive,
    togglePolling,
    isSyncing,
    executeSync,
    isSoundEnabled,
    toggleSound,
    hasChangesInLastTick,
    syncStats,
    updateRequestReply,
    addNewRiderRequest,
    resetToOriginalData,
    loadActiveOperationalData,
    toastNotification,
    dismissToast,
    testWhatsAppAlert,
    hasPushPermission,
    enableNotifications,
    isSheetRestricted,
    lastSyncError,
    // Google Auth
    currentUser,
    isLoggingIn,
    authError,
    handleGoogleLogin,
    handleGoogleLogout,
    // Manual Data Import
    importPastedData,
  } = useLiveSheetSync();

  // Export JSON helper
  const handleExportAllJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(sheets, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `nasr_city_operations_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const sheetTitles = sheets.map(s => s.title);

  return (
    <div 
      dir="rtl" 
      className={`min-h-screen ${theme.bg} ${theme.textPrimary} font-sans selection:bg-cyan-500 selection:text-black transition-colors duration-300`}
    >
      {/* Top Header */}
      <Header
        theme={theme}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
        syncIntervalSec={syncIntervalSec}
        isPollingActive={isPollingActive}
        onTogglePolling={togglePolling}
        onManualRefresh={executeSync}
        isSyncing={isSyncing}
        syncCount={syncStats.syncCount}
        lastSyncTime={syncStats.lastSyncTime}
        hasChangesInLastTick={hasChangesInLastTick}
        totalAccepted={syncStats.totalAccepted}
        totalRejected={syncStats.totalRejected}
        currentUser={currentUser}
        isLoggingIn={isLoggingIn}
        onGoogleLogin={handleGoogleLogin}
        onGoogleLogout={handleGoogleLogout}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onOpenSheetSelector={() => setIsSheetSelectorModalOpen(true)}
        spreadsheetId={spreadsheetId}
      />

      {/* Operational Active Shift Banner */}
      {isSheetRestricted && !currentUser && (
        <div className="bg-amber-950/80 border-b border-amber-500/40 px-4 py-2.5 text-xs backdrop-blur-sm">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-amber-200">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping inline-block"></span>
              <span className="font-extrabold text-amber-100">وضع العمليات النشطة:</span>
              <span className="text-amber-200/90 hidden sm:inline">
                الشيت مقفل خارجياً من Google (401). النظام يعمل بالبيانات التشغيلية الحالية ويمكنك اللصق أو تسجيل الدخول أو اختيار شيت آخر للمزامنة.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsSheetSelectorModalOpen(true)}
                className="px-3 py-1 bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-200 rounded-xl font-bold border border-cyan-500/40 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>📋 اختيار أو تغيير الشيت</span>
              </button>
              <button
                type="button"
                onClick={loadActiveOperationalData}
                className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/40 text-amber-200 rounded-xl font-bold border border-amber-500/40 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>📥 تحميل بيانات الشيفت (82+ طلب)</span>
              </button>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(true)}
                className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-200 rounded-xl font-bold border border-emerald-500/40 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>📋 لصق يدوي (Ctrl+V)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <NavigationTabs
        theme={theme}
        activeTab={activeMainTab}
        onTabChange={(tab) => setActiveMainTab(tab)}
        diffsCount={diffs.length}
        sheetCount={sheets.length}
        acceptedCount={syncStats.totalAccepted}
        rejectedCount={syncStats.totalRejected}
        pendingCount={syncStats.totalPending}
      />

      {/* Main View Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Tab 1: Rider Replies Manager (مقبول / مرفوض) */}
        {activeMainTab === 'replies' && (
          <RiderRepliesManager
            theme={theme}
            requests={riderRequests}
            sheetTitles={sheetTitles}
            syncIntervalSec={syncIntervalSec}
            onTestWhatsAppAlert={testWhatsAppAlert}
            hasPushPermission={hasPushPermission}
            onEnableNotifications={enableNotifications}
            isSheetRestricted={isSheetRestricted}
            onManualRefresh={executeSync}
            currentUser={currentUser}
            isLoggingIn={isLoggingIn}
            onGoogleLogin={handleGoogleLogin}
            onOpenImportModal={() => setIsImportModalOpen(true)}
            lastSyncError={lastSyncError}
          />
        )}

        {/* Tab 2: The 8 Live Sheets */}
        {activeMainTab === 'sheets' && (
          <LiveSheetsExplorer
            theme={theme}
            sheets={sheets}
            activeSheetId={activeSheetTabId}
            onSelectSheetTab={(id) => setActiveSheetTabId(id)}
            recentDiffs={diffs.slice(0, 15)}
            spreadsheetId={spreadsheetId}
            currentUser={currentUser}
            isLoggingIn={isLoggingIn}
            onGoogleLogin={handleGoogleLogin}
            onOpenImportModal={() => setIsImportModalOpen(true)}
          />
        )}

        {/* Tab 3: Operations Dashboard */}
        {activeMainTab === 'dashboard' && (
          <OperationsDashboard
            theme={theme}
            sheets={sheets}
            requests={riderRequests}
            syncStats={syncStats}
            syncIntervalSec={syncIntervalSec}
            isPollingActive={isPollingActive}
            onRefresh={executeSync}
            onNavigateToTab={(tabId) => {
              setActiveSheetTabId(tabId);
              setActiveMainTab('sheets');
            }}
            onNavigateToReplies={() => setActiveMainTab('replies')}
          />
        )}

        {/* Tab 4: Live Changes Diff Audit */}
        {activeMainTab === 'diffs' && (
          <ChangeLogView
            theme={theme}
            diffs={diffs}
            onClearDiffs={clearDiffs}
            isSoundEnabled={isSoundEnabled}
            onToggleSound={toggleSound}
            syncIntervalSec={syncIntervalSec}
            isPollingActive={isPollingActive}
          />
        )}

        {/* Tab 5: Settings and Direct Sheet Link */}
        {activeMainTab === 'settings' && (
          <SettingsView
            theme={theme}
            syncIntervalSec={syncIntervalSec}
            onUpdateSyncInterval={(sec) => setSyncIntervalSec(sec)}
            isPollingActive={isPollingActive}
            onTogglePolling={togglePolling}
            isSoundEnabled={isSoundEnabled}
            onToggleSound={toggleSound}
            syncStats={syncStats}
            onManualRefresh={executeSync}
            onExportAllJson={handleExportAllJson}
            onResetData={resetToOriginalData}
            spreadsheetId={spreadsheetId}
            onUpdateSpreadsheetId={setSpreadsheetId}
            currentUser={currentUser}
            isLoggingIn={isLoggingIn}
            onGoogleLogin={handleGoogleLogin}
            onGoogleLogout={handleGoogleLogout}
            onOpenImportModal={() => setIsImportModalOpen(true)}
            onOpenSheetSelector={() => setIsSheetSelectorModalOpen(true)}
          />
        )}
      </main>

      {/* Manual Data Import Modal */}
      <ImportDataModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        theme={theme}
        sheetTitles={sheetTitles}
        onImport={importPastedData}
      />

      {/* WhatsApp-Style Notification Pop-up Toast */}
      <WhatsAppNotificationToast
        notification={toastNotification}
        onClose={dismissToast}
        onViewReplies={() => setActiveMainTab('replies')}
      />

      {/* Theme Picker Modal */}
      <ThemeModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        currentTheme={theme}
        onSelectTheme={handleSelectTheme}
      />

      {/* Sheet Selector & Google Connection Modal */}
      <SheetSelectorModal
        isOpen={isSheetSelectorModalOpen}
        onClose={() => setIsSheetSelectorModalOpen(false)}
        theme={theme}
        currentSpreadsheetId={spreadsheetId}
        onSelectSpreadsheetId={(id) => {
          setSpreadsheetId(id);
          executeSync();
        }}
        currentUser={currentUser}
        isLoggingIn={isLoggingIn}
        onGoogleLogin={handleGoogleLogin}
        onGoogleLogout={handleGoogleLogout}
        isSheetRestricted={isSheetRestricted}
      />
    </div>
  );
}
