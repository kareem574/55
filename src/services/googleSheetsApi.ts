import { SheetTab } from '../types';
import { SPREADSHEET_ID } from './sheets';

export interface GoogleSheetsFetchResult {
  success: boolean;
  sheets?: SheetTab[];
  error?: string;
  isAuthError?: boolean;
}

export interface DriveSpreadsheetItem {
  id: string;
  name: string;
  modifiedTime?: string;
  webViewLink?: string;
  iconLink?: string;
  owners?: Array<{ displayName?: string; emailAddress?: string }>;
  shared?: boolean;
}

/**
 * List spreadsheets from user's Google Drive (including "Shared with me" files!)
 */
export async function listUserSpreadsheetsFromDrive(accessToken: string): Promise<{
  success: boolean;
  files: DriveSpreadsheetItem[];
  error?: string;
  isAuthError?: boolean;
}> {
  if (!accessToken) {
    return {
      success: false,
      files: [],
      error: 'رمز الوصول مفقود، يرجى تسجيل الدخول بحساب Google أولاً',
      isAuthError: true,
    };
  }

  try {
    // Search both user owned files AND files shared with user ("sharedWithMe" or accessible)
    // includeItemsFromAllDrives=true, supportsAllDrives=true
    const q = encodeURIComponent("mimeType='application/vnd.google-apps.spreadsheet' and trashed=false");
    const fields = encodeURIComponent('files(id, name, modifiedTime, webViewLink, iconLink, owners, shared)');
    const url = `https://www.googleapis.com/drive/v3/files?q=${q}&orderBy=modifiedTime%20desc&pageSize=50&fields=${fields}&includeItemsFromAllDrives=true&supportsAllDrives=true`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (res.status === 401 || res.status === 403) {
      return {
        success: false,
        files: [],
        error: 'انتهت صلاحية الجلسة أو لا توجد صلاحية للوصول لجوجل درايف. يرجى تسجيل الدخول مجدداً.',
        isAuthError: true,
      };
    }

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`خطأ درايف (${res.status}): ${errText}`);
    }

    const data = await res.json();
    let files: DriveSpreadsheetItem[] = data.files || [];

    // Also verify if the default known spreadsheet SPREADSHEET_ID is present; if not, try to fetch its metadata specifically
    const hasDefault = files.some(f => f.id === SPREADSHEET_ID);
    if (!hasDefault && SPREADSHEET_ID) {
      try {
        const singleUrl = `https://www.googleapis.com/drive/v3/files/${SPREADSHEET_ID}?fields=${encodeURIComponent('id, name, modifiedTime, webViewLink, iconLink, owners, shared')}&supportsAllDrives=true`;
        const singleRes = await fetch(singleUrl, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (singleRes.ok) {
          const singleData = await singleRes.json();
          if (singleData && singleData.id) {
            files = [singleData, ...files];
          }
        }
      } catch (e) {
        console.warn('Could not auto-fetch default sheet metadata from drive:', e);
      }
    }

    return {
      success: true,
      files,
    };
  } catch (err: any) {
    console.error('Failed to list spreadsheets from Drive:', err);
    return {
      success: false,
      files: [],
      error: err?.message || 'تعذر جلب ملفات الشيت من Google Drive',
    };
  }
}

/**
 * Fetch a single spreadsheet by ID or link using the user's access token
 */
export async function getSpreadsheetDetailsFromGoogle(
  accessToken: string,
  spreadsheetId: string
): Promise<{ success: boolean; name?: string; error?: string }> {
  try {
    const metaUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId.trim()}?fields=properties.title`;
    const res = await fetch(metaUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      const txt = await res.text();
      return { success: false, error: txt };
    }
    const data = await res.json();
    return { success: true, name: data.properties?.title || 'شيت بدون عنوان' };
  } catch (err: any) {
    return { success: false, error: err?.message || 'خطأ في فحص الشيت' };
  }
}

/**
 * Fetch all sheets & 1000+ rows from Google Sheets API using OAuth access token
 */
export async function fetchAllSheetsFromGoogleApi(
  accessToken: string,
  spreadsheetId: string = SPREADSHEET_ID
): Promise<GoogleSheetsFetchResult> {
  if (!accessToken) {
    return {
      success: false,
      error: 'لم يتم العثور على رمز الوصول (Access Token). يرجى تسجيل الدخول بحساب جوجل أولاً.',
      isAuthError: true,
    };
  }

  try {
    const cleanId = spreadsheetId.trim();

    // 1. Fetch spreadsheet metadata to get all tab titles and sheet IDs
    const metaUrl = `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}?fields=sheets.properties`;
    const metaRes = await fetch(metaUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (metaRes.status === 401 || metaRes.status === 403) {
      return {
        success: false,
        error: 'انتهت صلاحية الجلسة أو لا توجد صلاحية للوصول للشيت. يرجى تسجيل الدخول مجدداً.',
        isAuthError: true,
      };
    }

    if (!metaRes.ok) {
      const errText = await metaRes.text();
      throw new Error(`خطأ في استعلام الشيت (${metaRes.status}): ${errText}`);
    }

    const metaData = await metaRes.json();
    const sheetPropertiesList: Array<{ sheetId: number; title: string }> = 
      (metaData.sheets || []).map((s: any) => ({
        sheetId: s.properties.sheetId,
        title: s.properties.title,
      }));

    if (sheetPropertiesList.length === 0) {
      throw new Error('لم يتم العثور على أي تبويبات في ملف الشيت.');
    }

    // 2. Batch get values for all sheets in one single efficient HTTP request (A1:Z1000 up to 1000 rows)
    const rangesQuery = sheetPropertiesList
      .map(s => `ranges=${encodeURIComponent(`'${s.title}'!A1:Z1000`)}`)
      .join('&');

    const batchUrl = `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}/values:batchGet?${rangesQuery}`;
    const batchRes = await fetch(batchUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!batchRes.ok) {
      const errText = await batchRes.text();
      throw new Error(`خطأ في جلب بيانات التبويبات (${batchRes.status}): ${errText}`);
    }

    const batchData = await batchRes.json();
    const valueRanges: Array<{ range: string; values?: (string | number)[][] }> = batchData.valueRanges || [];
    const nowTime = new Date().toLocaleTimeString('ar-EG');

    // 3. Map to uniform SheetTab objects
    const mappedSheets: SheetTab[] = sheetPropertiesList.map((prop, idx) => {
      const vr = valueRanges[idx];
      const rawRows = vr?.values || [];

      let headers: string[] = [];
      let rows: (string | number | boolean | null)[][] = [];

      if (rawRows.length > 0) {
        // First row is headers
        headers = rawRows[0].map(h => String(h || '').trim());
        // Remaining rows are data rows
        rows = rawRows.slice(1).map(row => {
          // Normalize row length to match headers length
          const rowPadded = [...row];
          while (rowPadded.length < headers.length) {
            rowPadded.push('');
          }
          return rowPadded;
        });
      }

      return {
        id: `tab-${prop.sheetId}`,
        title: prop.title,
        rowCount: rows.length,
        columnCount: headers.length,
        headers,
        rows,
        updatedAt: nowTime,
      };
    });

    return {
      success: true,
      sheets: mappedSheets,
    };
  } catch (err: any) {
    console.error('Failed to fetch from Google Sheets API:', err);
    return {
      success: false,
      error: err?.message || 'حدث خطأ أثناء الاتصال بـ Google Sheets API',
    };
  }
}
