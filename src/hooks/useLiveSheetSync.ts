import { useState, useEffect, useRef, useCallback } from 'react';
import { SheetTab, SheetDiff, SyncStats, RiderRequest } from '../types';
import { 
  SPREADSHEET_ID, 
  getNasrCityInitialData, 
  extractAllRiderRequests,
  classifyReplyStatus,
  fetchLiveGoogleSheetTab,
  fetchSpreadsheetWithOAuth,
  parseSpreadsheetId,
  parsePastedSpreadsheetText,
  parseExcelWorkbookBuffer
} from '../services/sheets';
import { 
  initAuth, 
  googleSignIn, 
  getAccessToken, 
  logout, 
  User 
} from '../services/firebase';
import { 
  playWhatsAppChime, 
  sendWhatsAppSystemNotification, 
  requestNotificationPermission 
} from '../utils/audio';
import { ToastNotificationData } from '../components/WhatsAppNotificationToast';

export function useLiveSheetSync() {
  const [spreadsheetId, setSpreadsheetIdState] = useState<string>(() => {
    return localStorage.getItem('nasr_city_spreadsheet_id') || SPREADSHEET_ID;
  });

  const setSpreadsheetId = (idOrUrl: string) => {
    const cleanId = parseSpreadsheetId(idOrUrl);
    setSpreadsheetIdState(cleanId);
    try {
      localStorage.setItem('nasr_city_spreadsheet_id', cleanId);
    } catch {}
  };

  const [sheets, setSheets] = useState<SheetTab[]>(() => {
    // Clear legacy empty cache
    try {
      localStorage.removeItem('nasr_city_sheets_exact_v4');
      localStorage.removeItem('nasr_city_sheets_data');
    } catch {}

    const saved = localStorage.getItem('nasr_city_sheets_live_v3') || localStorage.getItem('nasr_city_sheets_live_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const totalRows = parsed.reduce((acc: number, s: any) => acc + (s.rows?.length || 0), 0);
          if (totalRows > 0) return parsed;
        }
      } catch {}
    }
    return getNasrCityInitialData();
  });

  const [diffs, setDiffs] = useState<SheetDiff[]>([]);
  const [syncIntervalSec, setSyncIntervalSec] = useState<number>(2);
  const [isPollingActive, setIsPollingActive] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);
  const [hasChangesInLastTick, setHasChangesInLastTick] = useState<boolean>(false);
  const [isSheetRestricted, setIsSheetRestricted] = useState<boolean>(false);
  const [lastSyncError, setLastSyncError] = useState<string | null>(null);

  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // WhatsApp Notification State
  const [toastNotification, setToastNotification] = useState<ToastNotificationData | null>(null);
  const [hasPushPermission, setHasPushPermission] = useState<boolean>(() => {
    return typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted';
  });

  // Keep ref to sheets to avoid stale closure during sync diff calculation
  const sheetsRef = useRef<SheetTab[]>(sheets);
  useEffect(() => {
    sheetsRef.current = sheets;
  }, [sheets]);

  // Compute live Rider Requests
  const riderRequests = extractAllRiderRequests(sheets);
  const totalAccepted = riderRequests.filter(r => r.statusType === 'accepted').length;
  const totalRejected = riderRequests.filter(r => r.statusType === 'rejected').length;
  const totalPending = riderRequests.filter(r => r.statusType === 'pending').length;

  const [syncStats, setSyncStats] = useState<SyncStats>({
    syncCount: 1,
    lastSyncTime: new Date(),
    latencyMs: 75,
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

  // Initialize auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, _token) => {
        setCurrentUser(user);
        setIsSheetRestricted(false);
      },
      () => {
        setCurrentUser(null);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

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

  // Execute live sync from Google Sheet
  const executeSync = useCallback(async () => {
    const startTime = performance.now();
    setIsSyncing(true);
    setLastSyncError(null);

    try {
      const token = await getAccessToken();
      let newSheetsData: SheetTab[] | null = null;

      // 1. If user is logged in with Google, use official Google Sheets API v4
      if (token) {
        const oauthResult = await fetchSpreadsheetWithOAuth(spreadsheetId, token);
        if (oauthResult.sheets && oauthResult.sheets.length > 0) {
          newSheetsData = oauthResult.sheets;
          setIsSheetRestricted(false);
        } else if (oauthResult.error) {
          setLastSyncError(oauthResult.error);
        }
      }

      // 2. Fallback: If not logged in or OAuth failed, try public Google Visualization API
      if (!newSheetsData) {
        const currentTitles = sheetsRef.current.map(s => s.title);
        const fetchResults = await Promise.allSettled(
          currentTitles.map(title => fetchLiveGoogleSheetTab(spreadsheetId, title))
        );

        const hasRestricted = fetchResults.some(
          r => r.status === 'fulfilled' && r.value.error === 'RESTRICTED_ACCESS'
        );

        if (hasRestricted && !token) {
          setIsSheetRestricted(true);
        } else {
          setIsSheetRestricted(false);
        }

        const anyRowsFetched = fetchResults.some(
          r => r.status === 'fulfilled' && r.value.rows && r.value.rows.length > 0
        );

        if (anyRowsFetched) {
          const nowTime = new Date().toLocaleTimeString('ar-EG');
          newSheetsData = sheetsRef.current.map((s, idx) => {
            const res = fetchResults[idx];
            if (res.status === 'fulfilled' && res.value.rows && res.value.rows.length > 0) {
              return {
                ...s,
                headers: res.value.headers.length > 0 ? res.value.headers : s.headers,
                rows: res.value.rows,
                rowCount: res.value.rows.length,
                updatedAt: nowTime,
              };
            }
            return s;
          });
        }
      }

      const endTime = performance.now();
      const latency = Math.max(30, Math.round(endTime - startTime));
      const nowTime = new Date().toLocaleTimeString('ar-EG');

      if (newSheetsData && newSheetsData.length > 0) {
        // Compare with old requests to detect changes
        const oldRequests = extractAllRiderRequests(sheetsRef.current);
        const newRequests = extractAllRiderRequests(newSheetsData);

        const oldMap = new Map(oldRequests.map(r => [r.id, r]));
        const detectedDiffs: SheetDiff[] = [];

        newRequests.forEach(newReq => {
          const oldReq = oldMap.get(newReq.id);
          if (!oldReq) {
            detectedDiffs.push({
              id: `live-${newReq.id}-${Date.now()}`,
              sheetTitle: newReq.tabTitle,
              rowIndex: 1,
              columnIndex: 1,
              columnName: 'طلب جديد وارد من الشيت',
              oldValue: '(غير موجود)',
              newValue: `كابتن ${newReq.riderId} - ${newReq.reply}`,
              timestamp: nowTime,
            });
          } else if (oldReq.statusType !== newReq.statusType || oldReq.reply !== newReq.reply) {
            detectedDiffs.push({
              id: `diff-${newReq.id}-${Date.now()}`,
              sheetTitle: newReq.tabTitle,
              rowIndex: 1,
              columnIndex: 5,
              columnName: 'تحديث الرد',
              oldValue: oldReq.reply,
              newValue: newReq.reply,
              timestamp: nowTime,
            });
          }
        });

        if (detectedDiffs.length > 0) {
          setDiffs(prev => [...detectedDiffs, ...prev].slice(0, 100));
          setHasChangesInLastTick(true);
          setTimeout(() => setHasChangesInLastTick(false), 1500);

          if (isSoundEnabled) {
            playWhatsAppChime();
          }

          const firstNew = detectedDiffs[0];
          triggerWhatsAppAlert('تحديث شيت', firstNew.sheetTitle, firstNew.columnName, firstNew.newValue);
        }

        setSheets(newSheetsData);
        try {
          localStorage.setItem('nasr_city_sheets_live_v2', JSON.stringify(newSheetsData));
        } catch {}

        setSyncStats(prev => ({
          ...prev,
          syncCount: prev.syncCount + 1,
          lastSyncTime: new Date(),
          latencyMs: latency,
          status: 'connected',
        }));
      } else {
        setSyncStats(prev => ({
          ...prev,
          syncCount: prev.syncCount + 1,
          lastSyncTime: new Date(),
          latencyMs: latency,
          status: isSheetRestricted ? 'error' : 'connected',
        }));
      }
    } catch (err: any) {
      setSyncStats(prev => ({
        ...prev,
        status: 'error',
        errorMessage: err?.message,
      }));
    } finally {
      setIsSyncing(false);
    }
  }, [spreadsheetId, isSoundEnabled, isSheetRestricted]);

  // Immediate fetch on mount & whenever spreadsheetId changes
  useEffect(() => {
    executeSync();
  }, [executeSync]);

  // Periodic polling ticker
  useEffect(() => {
    if (!isPollingActive) return;

    const intervalId = setInterval(() => {
      executeSync();
    }, syncIntervalSec * 1000);

    return () => clearInterval(intervalId);
  }, [isPollingActive, syncIntervalSec, executeSync]);

  // Google Sign-In handler
  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      const res = await googleSignIn();
      if (res?.accessToken) {
        setCurrentUser(res.user);
        setIsSheetRestricted(false);
        setTimeout(() => executeSync(), 200);
      }
    } catch (err: any) {
      setAuthError(err?.message || 'تعذر تسجيل الدخول بـ Google');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Google Sign-Out handler
  const handleGoogleLogout = async () => {
    await logout();
    setCurrentUser(null);
  };

  // Clear all data permanently and re-trigger sync
  const clearAllSystemData = () => {
    const clean = getNasrCityInitialData();
    setSheets(clean);
    setDiffs([]);
    try {
      localStorage.removeItem('nasr_city_sheets_live_v2');
      localStorage.removeItem('nasr_city_sheets_exact_v4');
      localStorage.removeItem('nasr_city_sheets_data');
    } catch {}
    executeSync();
  };

  // Import pasted data (Instant TSV/CSV from Google Sheet)
  const importPastedData = (tabTitle: string, rawText: string) => {
    const parsed = parsePastedSpreadsheetText(rawText);
    if (parsed.rows.length === 0) {
      return { success: false, message: 'لم يتم العثور على أسطر صالحة في النص المنسوخ' };
    }

    const nowTime = new Date().toLocaleTimeString('ar-EG');
    setSheets(current => {
      const updated = current.map(sheet => {
        if (sheet.title !== tabTitle) return sheet;
        return {
          ...sheet,
          headers: parsed.headers.length > 0 ? parsed.headers : sheet.headers,
          rows: parsed.rows,
          rowCount: parsed.rows.length,
          updatedAt: nowTime,
        };
      });

      try {
        localStorage.setItem('nasr_city_sheets_live_v2', JSON.stringify(updated));
      } catch {}

      return updated;
    });

    if (isSoundEnabled) {
      playWhatsAppChime();
    }

    return { success: true, count: parsed.rows.length };
  };

  // Import entire Excel workbook (.xlsx / .xls) with multiple tabs
  const importExcelFile = async (file: File): Promise<{ success: boolean; totalRows?: number; count?: number; message?: string }> => {
    try {
      const buffer = await file.arrayBuffer();
      const { sheets: parsedSheets, totalRows } = parseExcelWorkbookBuffer(buffer);
      if (parsedSheets.length === 0 || totalRows === 0) {
        return { success: false, message: 'الملف فارغ أو لا يحتوي على صفوف صالحة' };
      }

      setSheets(parsedSheets);
      try {
        localStorage.setItem('nasr_city_sheets_live_v3', JSON.stringify(parsedSheets));
        localStorage.setItem('nasr_city_sheets_live_v2', JSON.stringify(parsedSheets));
      } catch {}

      if (isSoundEnabled) {
        playWhatsAppChime();
      }

      return { success: true, totalRows, count: parsedSheets.length };
    } catch (err: any) {
      return { success: false, message: err?.message || 'تعذر قراءة ملف الإكسيل' };
    }
  };

  // Update single row reply status (e.g. approve or reject request directly)
  const updateRequestReply = (tabTitle: string, riderId: string, newReply: 'مقبول' | 'مرفوض', reason?: string) => {
    setSheets(current => {
      const updated = current.map(sheet => {
        if (sheet.title !== tabTitle) return sheet;

        const riderColIdx = sheet.headers.findIndex(h => /rider\s*id|كود\s*الطيار/i.test(h));
        const replyColIdx = sheet.headers.findIndex(h => /الرد\s*عل[يى]\s*الطلب/i.test(h));
        const statusColIdx = sheet.headers.findIndex(h => /حالة\s*الطلب/i.test(h));
        const reasonColIdx = sheet.headers.findIndex(h => /سبب\s*الرفض/i.test(h));

        if (riderColIdx === -1) return sheet;

        const targetRowIdx = sheet.rows.findIndex(r => String(r[riderColIdx]).trim() === riderId.trim());
        if (targetRowIdx === -1) return sheet;

        const newRows = [...sheet.rows];
        const newRow = [...newRows[targetRowIdx]];
        
        if (replyColIdx !== -1) newRow[replyColIdx] = newReply;
        if (statusColIdx !== -1) newRow[statusColIdx] = 'تم الرد';
        if (reasonColIdx !== -1) {
          newRow[reasonColIdx] = newReply === 'مقبول' ? '' : (reason || 'شيفت مكسور / سيستم');
        }

        const oldReply = String(sheet.rows[targetRowIdx][replyColIdx] || '');
        
        const newDiff: SheetDiff = {
          id: `${sheet.title}-${riderId}-${Date.now()}`,
          sheetTitle: sheet.title,
          rowIndex: targetRowIdx + 1,
          columnIndex: replyColIdx + 1,
          columnName: sheet.headers[replyColIdx] || 'الرد على الطلب',
          oldValue: oldReply || 'قيد الإنتظار',
          newValue: newReply,
          timestamp: new Date().toLocaleTimeString('ar-EG'),
        };

        setDiffs(prev => [newDiff, ...prev].slice(0, 100));
        setHasChangesInLastTick(true);
        setTimeout(() => setHasChangesInLastTick(false), 1200);

        if (isSoundEnabled) {
          playWhatsAppChime();
        }

        newRows[targetRowIdx] = newRow;
        return {
          ...sheet,
          rows: newRows,
          updatedAt: new Date().toLocaleTimeString('ar-EG'),
        };
      });

      try {
        localStorage.setItem('nasr_city_sheets_live_v2', JSON.stringify(updated));
      } catch {}

      return updated;
    });
  };

  // Add a new fast rider request & trigger notification
  const addNewRiderRequest = (tabTitle: string, riderId: string, timeOrNote: string) => {
    triggerWhatsAppAlert(riderId, tabTitle, 'طلب جديد', timeOrNote);

    setSheets(current => {
      const now = new Date().toLocaleString('ar-EG');
      const updated = current.map(sheet => {
        if (sheet.title !== tabTitle) return sheet;

        let newRow: (string | number | boolean | null)[] = [];
        if (sheet.id === 'tab-increase-shifts') {
          newRow = [now, 'تزويدات شيفتات الطيارين', timeOrNote || '12:00 AM', riderId, 'قيد الإنتظار', 'قيد المراجعة', ''];
        } else if (sheet.id === 'tab-break-release') {
          newRow = [now, 'فك بريك', riderId, 'قيد الإنتظار', 'قيد المراجعة', ''];
        } else if (sheet.id === 'tab-shift-actions') {
          newRow = [now, 'قفل شيفت', timeOrNote || 'ظرف طارئ', riderId, 'مرفق', 'قيد الإنتظار', 'قيد المراجعة', ''];
        } else {
          newRow = [now, riderId, timeOrNote || 'طلب جديد', 'قيد الإنتظار', 'قيد المراجعة', ''];
        }

        const newRows = [newRow, ...sheet.rows];

        const newDiff: SheetDiff = {
          id: `new-${sheet.title}-${riderId}-${Date.now()}`,
          sheetTitle: sheet.title,
          rowIndex: 2,
          columnIndex: 1,
          columnName: 'إضافة طلب طيار جديد',
          oldValue: '(طلب جديد)',
          newValue: `كود ${riderId} - ${sheet.title}`,
          timestamp: new Date().toLocaleTimeString('ar-EG'),
        };
        setDiffs(prev => [newDiff, ...prev].slice(0, 100));
        setHasChangesInLastTick(true);
        setTimeout(() => setHasChangesInLastTick(false), 1200);

        return {
          ...sheet,
          rows: newRows,
          rowCount: newRows.length,
          updatedAt: new Date().toLocaleTimeString('ar-EG'),
        };
      });

      try {
        localStorage.setItem('nasr_city_sheets_live_v2', JSON.stringify(updated));
      } catch {}

      return updated;
    });
  };

  const loadActiveOperationalData = () => {
    const data = getNasrCityInitialData();
    setSheets(data);
    try {
      localStorage.setItem('nasr_city_sheets_live_v3', JSON.stringify(data));
      localStorage.setItem('nasr_city_sheets_live_v2', JSON.stringify(data));
    } catch {}
    if (isSoundEnabled) {
      playWhatsAppChime();
    }
  };

  const resetToOriginalData = () => {
    loadActiveOperationalData();
  };

  const togglePolling = () => setIsPollingActive(p => !p);
  const toggleSound = () => setIsSoundEnabled(s => !s);
  const clearDiffs = () => setDiffs([]);
  const dismissToast = () => setToastNotification(null);

  return {
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
    clearAllSystemData,
    toastNotification,
    dismissToast,
    triggerWhatsAppAlert,
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
    importExcelFile,
  };
}
