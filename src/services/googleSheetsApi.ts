import { SheetTab } from '../types';
import { SPREADSHEET_ID } from './sheets';

export interface GoogleSheetsFetchResult {
  success: boolean;
  sheets?: SheetTab[];
  error?: string;
  isAuthError?: boolean;
}

/**
 * Fetch all sheets from the Google Sheets API using the OAuth access token
 */
export async function fetchAllSheetsFromGoogleApi(accessToken: string): Promise<GoogleSheetsFetchResult> {
  if (!accessToken) {
    return {
      success: false,
      error: 'لم يتم العثور على رمز الوصول (Access Token). يرجى تسجيل الدخول بحساب جوجل أولاً.',
      isAuthError: true,
    };
  }

  try {
    // 1. Fetch spreadsheet metadata to get all tab titles and sheet IDs
    const metaUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}?fields=sheets.properties`;
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

    // 2. Batch get values for all sheets in one single efficient HTTP request
    const rangesQuery = sheetPropertiesList
      .map(s => `ranges=${encodeURIComponent(`'${s.title}'!A1:Z500`)}`)
      .join('&');

    const batchUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values:batchGet?${rangesQuery}`;
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
