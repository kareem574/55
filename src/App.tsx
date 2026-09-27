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
import { WhatsAppNotificationToast } from './components/WhatsAppNotificationToast';
import { SheetUrlSyncBar } from './components/SheetUrlSyncBar';
import { GoogleDriveSheetPickerModal } from './components/GoogleDriveSheetPickerModal';
import { SPREADSHEET_ID } from './services/sheets';

export default function App() {
  // Theme state
  const [currentThemeId, setCurrentThemeId] = useState<ThemeId>(() => {
    return (localStorage.getItem('nasr_city_theme') as ThemeId) || 'navy-ops';
  });
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isDrivePickerOpen, setIsDrivePickerOpen] = useState(false);

  const theme: ThemeConfig = THEMES[currentThemeId] || THEMES['navy-ops'];

  const handleSelectTheme = (newThemeId: ThemeId) => {
    setCurrentThemeId(newThemeId);
    localStorage.setItem('nasr_city_theme', newThemeId);
  };

  // Tabs state - Default to 'replies' since user specifically requested:
  // "انا كل ال محتاجه التطبيق يقراء كل البيانات زي كده ويبعت مين اترد عليه مقبول ومين مرفوض"
  const [activeMainTab, setActiveMainTab] = useState<MainTabId>('replies');
  const [activeSheetTabId, setActiveSheetTabId] = useState<string>('tab-increase-shifts');

  // Live Sheet Engine (Direct link fetch, Zero login required, 500+ rows)
  const {
    spreadsheetId,
    sheetUrl,
    updateSheetUrl,
    sheets,
    totalRowsCount,
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
    resetToOriginalData,
    toastNotification,
    dismissToast,
    testWhatsAppAlert,
    hasPushPermission,
    enableNotifications,
    isSheetRestricted,
    lastFetchStatusMessage,
    user,
    accessToken,
    isAuthLoading,
    authError,
    loginWithGoogle,
    logoutGoogle,
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
        user={user}
        onLogin={loginWithGoogle}
        onLogout={logoutGoogle}
        isAuthLoading={isAuthLoading}
        authError={authError}
        onOpenDrivePicker={() => setIsDrivePickerOpen(true)}
      />

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
      <main className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-3 sm:py-6">
        
        {/* Direct Google Sheets Link Sync Bar with Google Auth & Sheet Picker */}
        <SheetUrlSyncBar
          theme={theme}
          sheetUrl={sheetUrl}
          onUpdateSheetUrl={updateSheetUrl}
          isSyncing={isSyncing}
          onManualSync={executeSync}
          totalRowsCount={totalRowsCount}
          isSheetRestricted={isSheetRestricted}
          lastFetchStatusMessage={lastFetchStatusMessage}
          user={user}
          onLogin={loginWithGoogle}
          onOpenPicker={() => setIsDrivePickerOpen(true)}
          isAuthLoading={isAuthLoading}
          authError={authError}
        />
        
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
            spreadsheetId={SPREADSHEET_ID}
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

        {/* Tab 4: Live 1-Second Changes Diff Audit */}
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
          />
        )}
      </main>

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

      {/* Google Drive Sheet Picker Modal */}
      <GoogleDriveSheetPickerModal
        isOpen={isDrivePickerOpen}
        onClose={() => setIsDrivePickerOpen(false)}
        theme={theme}
        accessToken={accessToken}
        currentSpreadsheetId={spreadsheetId}
        onSelectSpreadsheet={(id) => {
          updateSheetUrl(`https://docs.google.com/spreadsheets/d/${id}/edit`);
        }}
      />
    </div>
  );
}
