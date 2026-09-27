import { useState, useEffect, useRef, useCallback } from 'react';
import { User } from 'firebase/auth';
import { SheetTab, SheetDiff, SyncStats, RiderRequest } from '../types';
import { 
  SPREADSHEET_ID, 
  SPREADSHEET_URL,
  DEFAULT_SHEET_TABS,
  extractSpreadsheetId,
  getNasrCityInitialData, 
  extractAllRiderRequests,
  fetchAllSheetTabsViaLink,
  fetchLiveGoogleSheetTab
} from '../services/sheets';
import { 
  initAuth, 
  googleSignIn, 
  googleLogout, 
  getAccessToken 
} from '../services/googleAuth';
import { 
  fetchAllSheetsFromGoogleApi 
} from '../services/googleSheetsApi';
import { 
  playWhatsAppChime, 
  sendWhatsAppSystemNotification, 
  requestNotificationPermission 
} from '../utils/audio';
import { ToastNotificationData } from '../components/WhatsAppNotificationToast';

export function useLiveSheetSync() {
  // Configurable Sheet URL / ID - default to user's sheet link
  const [sheetUrl, setSheetUrl] = useState<string>(() => {
    return localStorage.getItem('nasr_city_custom_sheet_url') || SPREADSHEET_URL;
  });

  const [sheets, setSheets] = useState<SheetTab[]>(() => {
    const saved = localStorage.getItem('nasr_city_sheets_exact_v4');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    const initial = getNasrCityInitialData();
    try {
      localStorage.setItem('nasr_city_sheets_exact_v4', JSON.stringify(initial));
    } catch {}
    return initial;
  });

  const [diffs, setDiffs] = useState<SheetDiff[]>([]);
  const [syncIntervalSec, setSyncIntervalSec] = useState<number>(2);
  const [isPollingActive, setIsPollingActive] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);
  const [hasChangesInLastTick, setHasChangesInLastTick] = useState<boolean>(false);
  const [isSheetRestricted, setIsSheetRestricted] = useState<boolean>(false);
  const [lastFetchStatusMessage, setLastFetchStatusMessage] = useState<string>('جاهز للقراءة');

  // Google OAuth (Optional fallback)
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // WhatsApp Notification State
  const [toastNotification, setToastNotification] = useState<ToastNotificationData | null>(null);
  const [hasPushPermission, setHasPushPermission] = useState<boolean>(() => {
    return typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted';
  });

  // Track previous row count to notify upon new entries in Google Sheets
  const prevRowsCountRef = useRef<number>(0);

  // Compute live Rider Requests
  const riderRequests = extractAllRiderRequests(sheets);
  const totalAccepted = riderRequests.filter(r => r.statusType === 'accepted').length;
  const totalRejected = riderRequests.filter(r => r.statusType === 'rejected').length;
  const totalPending = riderRequests.filter(r => r.statusType === 'pending').length;
  const totalRowsCount = sheets.reduce((sum, s) => sum + s.rows.length, 0);

  const [syncStats, setSyncStats] = useState<SyncStats>({
    syncCount: 1,
    lastSyncTime: new Date(),
    latencyMs: 65,
    status: 'connected',
    totalAccepted,
    totalRejected,
    totalPending,
  });

  // Update sync stats whenever totals change
  useEffect(() => {
    setSyncStats(prev => ({
      ...prev,
      totalAccepted,
      totalRejected,
      totalPending,
    }));
  }, [totalAccepted, totalRejected, totalPending]);

  // Update sheet URL
  const updateSheetUrl = (newUrl: string) => {
    const trimmed = newUrl.trim();
    if (!trimmed) return;
    setSheetUrl(trimmed);
    localStorage.setItem('nasr_city_custom_sheet_url', trimmed);
    // Trigger sync immediately on url change
    setTimeout(() => {
      executeSync();
    }, 100);
  };

  // Optional Firebase Auth listener for users who still want OAuth
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setAccessToken(token);
        setIsSheetRestricted(false);
        setAuthError(null);
      },
      () => {
        setUser(null);
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Login handler (optional)
  const loginWithGoogle = async () => {
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setAccessToken(res.accessToken);
        setIsSheetRestricted(false);
      }
    } catch (err: any) {
      console.error('Google Sign in failed:', err);
      setAuthError(err?.message || 'تعذر تسجيل الدخول بحساب جوجل');
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Logout handler
  const logoutGoogle = async () => {
    try {
      await googleLogout();
      setUser(null);
      setAccessToken(null);
    } catch (err: any) {
      console.error('Logout failed:', err);
    }
  };

  // Request browser notification permission
  const enableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setHasPushPermission(granted);
    if (granted) {
      sendWhatsAppSystemNotification(
        'تم تفعيل إشعارات تشغيل العز',
        'ستصلك إشعارات فورية بكل طلب جديد للطيارين مثل الواتساب تماماً'
      );
    }
    return granted;
  };

  // Trigger WhatsApp notification for a request
  const triggerWhatsAppAlert = (riderId: string, tabTitle: string, requestType: string, timeOrNote?: string) => {
    const toast: ToastNotificationData = {
      id: `${Date.now()}-${riderId}`,
      riderId,
      tabTitle,
      requestType,
      targetTime: timeOrNote,
      timestamp: new Date().toLocaleTimeString('ar-EG'),
    };

    setToastNotification(toast);

    if (isSoundEnabled) {
      playWhatsAppChime();
      sendWhatsAppSystemNotification(
        `🛵 طلب طيار جديد: ${riderId}`,
        `قام الكابتن ${riderId} بتقديم طلب ${requestType} في تبويب ${tabTitle} (${timeOrNote || ''})`
      );
    }

    // Auto dismiss after 6 seconds
    setTimeout(() => {
      setToastNotification(current => current?.id === toast.id ? null : current);
    }, 6000);
  };

  // Test WhatsApp notification
  const testWhatsAppAlert = () => {
    triggerWhatsAppAlert('3908789', 'تزويد الشيفتات', 'تزويد شيفت طيار', '12:00 AM');
  };

  // Main sync execution loop: Fetch all 500+ rows directly from sheet link WITHOUT login
  const executeSync = useCallback(async () => {
    setIsSyncing(true);
    const startTime = performance.now();
    const cleanId = extractSpreadsheetId(sheetUrl);

    try {
      // 1. If user is logged into Google and has an access token, use Google Sheets REST API
      if (accessToken) {
        const apiRes = await fetchAllSheetsFromGoogleApi(accessToken);
        const endTime = performance.now();
        const latency = Math.max(20, Math.round(endTime - startTime));

        if (apiRes.success && apiRes.sheets && apiRes.sheets.length > 0) {
          setIsSheetRestricted(false);
          setLastFetchStatusMessage(`تم جلب ${apiRes.sheets.reduce((a, b) => a + b.rows.length, 0)} صف من جوجل مباشرة`);
          setSheets(apiRes.sheets);
          try {
            localStorage.setItem('nasr_city_sheets_exact_v4', JSON.stringify(apiRes.sheets));
          } catch {}

          setSyncStats(prev => ({
            ...prev,
            syncCount: prev.syncCount + 1,
            lastSyncTime: new Date(),
            latencyMs: latency,
            status: 'connected',
          }));
          setIsSyncing(false);
          return;
        }
      }

      // 2. PRIMARY PATH: Fetch directly from the Google Sheet link without any login
      const linkRes = await fetchAllSheetTabsViaLink(cleanId, DEFAULT_SHEET_TABS);
      const endTime = performance.now();
      const latency = Math.max(20, Math.round(endTime - startTime));

      if (linkRes.success && linkRes.sheets && linkRes.sheets.length > 0) {
        setIsSheetRestricted(false);
        const totalRowsFetched = linkRes.sheets.reduce((acc, s) => acc + s.rows.length, 0);
        setLastFetchStatusMessage(`تم سحب ${totalRowsFetched} صف عبر رابط الشيت بنجاح`);

        // Check if there are newly added requests to trigger notification
        if (prevRowsCountRef.current > 0 && totalRowsFetched > prevRowsCountRef.current) {
          const firstSheet = linkRes.sheets[0];
          if (firstSheet && firstSheet.rows.length > 0) {
            const latestRow = firstSheet.rows[0];
            const riderId = String(latestRow[3] || latestRow[1] || 'جديد');
            triggerWhatsAppAlert(riderId, firstSheet.title, 'طلب جديد تم رصده في الشيت', String(latestRow[2] || ''));
          }
        }
        prevRowsCountRef.current = totalRowsFetched;

        // Merge with existing tabs to keep any unrepresented tabs intact
        setSheets(currentSheets => {
          const newMap = new Map(linkRes.sheets!.map(s => [s.title, s]));
          return currentSheets.map(s => newMap.get(s.title) || s);
        });

        try {
          localStorage.setItem('nasr_city_sheets_exact_v4', JSON.stringify(sheets));
        } catch {}

        setSyncStats(prev => ({
          ...prev,
          syncCount: prev.syncCount + 1,
          lastSyncTime: new Date(),
          latencyMs: latency,
          status: 'connected',
        }));
      } else if (linkRes.isRestricted) {
        setIsSheetRestricted(true);
        setLastFetchStatusMessage('الشيت محمي في جوجل درايف - اضبط المشاركة على "أي شخص لديه الرابط"');
        setSyncStats(prev => ({
          ...prev,
          status: 'error',
          errorMessage: 'الشيت محمي - اضبط إذن المشاركة',
        }));
      } else {
        // Keep current data and report status
        setSyncStats(prev => ({
          ...prev,
          status: 'connected',
        }));
      }
    } catch (err: any) {
      console.warn('Sync error:', err);
      setSyncStats(prev => ({
        ...prev,
        status: 'error',
        errorMessage: err?.message,
      }));
    } finally {
      setIsSyncing(false);
    }
  }, [sheetUrl, accessToken, sheets]);

  // Polling Interval
  useEffect(() => {
    if (!isPollingActive) return;

    const intervalId = setInterval(() => {
      executeSync();
    }, syncIntervalSec * 1000);

    return () => clearInterval(intervalId);
  }, [isPollingActive, syncIntervalSec, executeSync]);

  const resetToOriginalData = () => {
    const fresh = getNasrCityInitialData();
    setSheets(fresh);
    localStorage.removeItem('nasr_city_sheets_exact_v4');
    setDiffs([]);
  };

  const togglePolling = () => setIsPollingActive(p => !p);
  const toggleSound = () => setIsSoundEnabled(s => !s);
  const clearDiffs = () => setDiffs([]);
  const dismissToast = () => setToastNotification(null);

  return {
    spreadsheetId: extractSpreadsheetId(sheetUrl),
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
    triggerWhatsAppAlert,
    testWhatsAppAlert,
    hasPushPermission,
    enableNotifications,
    isSheetRestricted,
    lastFetchStatusMessage,
    // Google Auth (Optional)
    user,
    accessToken,
    isAuthLoading,
    authError,
    loginWithGoogle,
    logoutGoogle,
  };
}
