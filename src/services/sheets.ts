import { SheetTab, RiderRequest, RequestStatus } from '../types';

export const SPREADSHEET_ID = '1bQLV0lHu45yHwGGqVSYp4FC1zoJlUIrZBrbJySxDGKQ';
export const SPREADSHEET_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit?usp=drivesdk`;

export function classifyReplyStatus(reply: string, stateText?: string): RequestStatus {
  const r = (reply || '').trim().toLowerCase();
  const s = (stateText || '').trim().toLowerCase();

  // If stateText or reply indicates pending review
  if (
    s.includes('إنتظار') || 
    s.includes('انتظار') || 
    s.includes('معلق') ||
    r.includes('إنتظار') || 
    r.includes('انتظار') || 
    r.includes('قيد') || 
    r.includes('مراجعة') ||
    r.includes('تحت') ||
    r === '' ||
    r === '-'
  ) {
    return 'pending';
  }

  // Accepted
  if (r === 'مقبول' || (r.includes('مقبول') && !r.includes('غير') && !r.includes('مرفوض'))) {
    return 'accepted';
  }

  // Rejected / Ignored
  return 'rejected';
}

export function getNasrCityInitialData(): SheetTab[] {
  return [
    {
      id: 'tab-increase-shifts',
      title: 'تزويد الشيفتات',
      rowCount: 0,
      columnCount: 7,
      headers: ['Timestamp', 'شيفتات الطيارين', 'إلى الساعة كام', 'Rider ID', 'حالة الطلب', 'الرد علي الطلب', 'سبب الرفض'],
      rows: [],
      updatedAt: 'في انتظار المزامنة',
    },
    {
      id: 'tab-break-release',
      title: 'فك البريك',
      rowCount: 0,
      columnCount: 6,
      headers: ['Timestamp', 'شيفتات الطيارين', 'Rider ID', 'حالة الطلب', 'الرد علي الطلب', 'سبب الرفض'],
      rows: [],
      updatedAt: 'في انتظار المزامنة',
    },
    {
      id: 'tab-shift-actions',
      title: 'رفع و قفل شيفت',
      rowCount: 0,
      columnCount: 8,
      headers: ['Timestamp', 'أختار قفل أو رفع', 'السبب', 'Rider ID', 'الإثبات', 'حالة الطلب', 'الرد علي الطلب', 'سبب الرفض'],
      rows: [],
      updatedAt: 'في انتظار المزامنة',
    },
    {
      id: 'tab-join-shift',
      title: 'لحم الشيفت',
      rowCount: 0,
      columnCount: 6,
      headers: ['Timestamp', 'كود الطيار', 'من', 'حالة الطلب', 'الرد على الطلب', 'سبب الرفض'],
      rows: [],
      updatedAt: 'في انتظار المزامنة',
    },
    {
      id: 'tab-inquiries',
      title: 'الاستفسارات',
      rowCount: 0,
      columnCount: 7,
      headers: ['Timestamp', 'سبب الإستفسار', 'اشرح الحاله', 'كود الطيار', 'الاثبات', 'حالة الطلب', 'الرد على الطلب'],
      rows: [],
      updatedAt: 'في انتظار المزامنة',
    },
    {
      id: 'tab-modify-shift',
      title: 'تعديل الشيفت',
      rowCount: 0,
      columnCount: 9,
      headers: ['Timestamp', 'تعديل شيفت', 'السبب', 'من', 'المكتب', 'كود الطيار', 'سبب الرفض', 'Assigned For', 'Comments'],
      rows: [],
      updatedAt: 'في انتظار المزامنة',
    },
    {
      id: 'tab-order-inquiry',
      title: 'استفسار عن اوردر',
      rowCount: 0,
      columnCount: 5,
      headers: ['Timestamp', 'سبب الإستفسار', 'كود الأوردر', 'اشرح الحاله', 'كود الطيار'],
      rows: [],
      updatedAt: 'في انتظار المزامنة',
    },
    {
      id: 'tab-change-point',
      title: 'تغيير نقطه',
      rowCount: 0,
      columnCount: 8,
      headers: ['Timestamp', 'سبب الإستفسار', 'من', 'إلى', 'اشرح الحاله', 'كود الطيار', 'الاثبات', 'حالة الطلب'],
      rows: [],
      updatedAt: 'في انتظار المزامنة',
    },
  ];
}

// Convert all sheets rows to uniform RiderRequest records for unified filtering & searching
export function extractAllRiderRequests(sheets: SheetTab[]): RiderRequest[] {
  const requests: RiderRequest[] = [];

  sheets.forEach((sheet) => {
    const headers = sheet.headers;
    
    // Find column indexes
    const riderIdColIdx = headers.findIndex(h => /rider\s*id|كود\s*الطيار/i.test(h));
    const statusColIdx = headers.findIndex(h => /حالة\s*الطلب/i.test(h));
    const replyColIdx = headers.findIndex(h => /الرد\s*عل[يى]\s*الطلب/i.test(h));
    const rejectReasonColIdx = headers.findIndex(h => /سبب\s*الرفض/i.test(h));
    const timeColIdx = headers.findIndex(h => /الساعة\s*كام|من|إلى/i.test(h));
    const reasonColIdx = headers.findIndex(h => /السبب|سبب\s*الإستفسار/i.test(h));
    const typeColIdx = headers.findIndex(h => /شيفتات\s*الطيارين|أختار\s*قفل\s*أو\s*رفع|تعديل\s*شيفت/i.test(h));

    sheet.rows.forEach((row, rowIdx) => {
      const riderId = riderIdColIdx !== -1 && row[riderIdColIdx] ? String(row[riderIdColIdx]).trim() : '';
      if (!riderId) return;

      const replyRaw = replyColIdx !== -1 && row[replyColIdx] != null ? String(row[replyColIdx]).trim() : '';
      const statusRaw = statusColIdx !== -1 && row[statusColIdx] != null ? String(row[statusColIdx]).trim() : '';
      const rejectReasonRaw = rejectReasonColIdx !== -1 && row[rejectReasonColIdx] != null ? String(row[rejectReasonColIdx]).trim() : '';

      const statusType = classifyReplyStatus(replyRaw, statusRaw);

      const timestamp = String(row[0] || 'اليوم');
      const targetTime = timeColIdx !== -1 && row[timeColIdx] ? String(row[timeColIdx]).trim() : undefined;
      const reason = reasonColIdx !== -1 && row[reasonColIdx] ? String(row[reasonColIdx]).trim() : undefined;
      const requestType = typeColIdx !== -1 && row[typeColIdx] ? String(row[typeColIdx]).trim() : sheet.title;

      // Determine explicit rejection reason exactly from sheet data
      let rejectReason: string | undefined = undefined;
      if (statusType === 'rejected') {
        if (rejectReasonRaw && rejectReasonRaw !== '') {
          rejectReason = rejectReasonRaw;
        } else if (replyRaw && !['مرفوض', 'غير مقبول', 'تم الرد'].includes(replyRaw)) {
          rejectReason = replyRaw.replace(/^متجاهل:\s*/i, '').trim();
        } else if (reason && reason !== '') {
          rejectReason = reason;
        }
      }

      // Display reply text
      let displayReply = replyRaw;
      if (!displayReply) {
        displayReply = statusType === 'accepted' ? 'مقبول' : statusType === 'pending' ? 'قيد المراجعة' : 'مرفوض';
      }

      requests.push({
        id: `${sheet.id}-${rowIdx}-${riderId}`,
        tabTitle: sheet.title,
        timestamp,
        riderId,
        requestType,
        targetTime,
        reason,
        status: statusType === 'pending' ? 'قيد الإنتظار' : 'تم الرد',
        reply: displayReply,
        rejectReason,
        statusType,
      });
    });
  });

  return requests;
}

// Generate formatted WhatsApp message for a single rider
export function formatRiderWhatsAppMessage(req: RiderRequest): string {
  const isAccepted = req.statusType === 'accepted';
  const icon = isAccepted ? '✅' : req.statusType === 'pending' ? '⏳' : '❌';
  const statusLabel = isAccepted ? 'مقبول' : req.statusType === 'pending' ? 'قيد الإنتظار والمراجعة' : `مرفوض (${req.reply})`;

  let msg = `السلام عليكم ورحمة الله وبركاته\n`;
  msg += `*إدارة تشغيل العز - مدينة نصر* 🛵\n\n`;
  msg += `👤 *كود الطيار (Rider ID):* ${req.riderId}\n`;
  msg += `📋 *نوع الطلب:* ${req.requestType} (${req.tabTitle})\n`;
  if (req.targetTime) {
    msg += `⏰ *التوقيت المطلوب:* ${req.targetTime}\n`;
  }
  msg += `${icon} *حالة الطلب:* ${statusLabel}\n`;
  if (req.rejectReason) {
    msg += `⚠️ *سبب الرفض:* ${req.rejectReason}\n`;
  } else if (!isAccepted && req.reply && req.reply !== 'مرفوض') {
    msg += `ℹ️ *ملاحظة:* ${req.reply}\n`;
  }
  msg += `\n📅 *وقت التسجيل:* ${req.timestamp}\n`;
  msg += `بالتوفيق والسلامة لجميع كباتن التشغيل 🌟`;

  return msg;
}

// Generate bulk summary message for group broadcast
export function formatBulkRidersSummary(requests: RiderRequest[], filterType: 'all' | 'accepted' | 'rejected' | 'pending'): string {
  const filtered = requests.filter(r => filterType === 'all' || r.statusType === filterType);
  const now = new Date().toLocaleTimeString('ar-EG');

  let text = `📢 *تقرير تشغيل العز - مدينة نصر (${now})*\n`;
  text += `═══════════════════════════\n`;
  text += `إجمالي الطلبات المعروضة: ${filtered.length}\n\n`;

  filtered.slice(0, 50).forEach((req, idx) => {
    const icon = req.statusType === 'accepted' ? '✅ مقبول' : req.statusType === 'pending' ? '⏳ قيد المراجعة' : `❌ ${req.reply}`;
    text += `${idx + 1}. كود: *${req.riderId}* | ${req.requestType} | ${icon}`;
    if (req.rejectReason) {
      text += ` (${req.rejectReason})`;
    }
    text += `\n`;
  });

  if (filtered.length > 50) {
    text += `\n... والمزيد (${filtered.length - 50} طلب آخر)`;
  }

  text += `\n═══════════════════════════\nغرفة عمليات تشغيل العز مدينة نصر`;
  return text;
}

/**
 * Extract clean Spreadsheet ID from URL or raw ID string
 */
export function parseSpreadsheetId(input: string): string {
  if (!input) return SPREADSHEET_ID;
  const match = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) return match[1];
  return input.trim();
}

/**
 * Fetch all sheets using official Google Sheets API v4 with OAuth Bearer token
 */
export async function fetchSpreadsheetWithOAuth(
  spreadsheetId: string,
  accessToken: string
): Promise<{ sheets: SheetTab[]; error?: string }> {
  try {
    // 1. Fetch spreadsheet metadata to get all sheet tabs
    const metaRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties(sheetId,title)`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      }
    );

    if (!metaRes.ok) {
      const errJson = await metaRes.json().catch(() => ({}));
      const msg = errJson?.error?.message || `HTTP ${metaRes.status}`;
      return { sheets: [], error: msg };
    }

    const metaData = await metaRes.json();
    const sheetProps = metaData.sheets || [];
    if (sheetProps.length === 0) {
      return { sheets: [], error: 'لا توجد تبويبات في هذا الشيت' };
    }

    const titles: string[] = sheetProps.map((s: any) => s.properties?.title || '').filter(Boolean);

    // 2. Batch get all ranges in a single request
    const rangesQuery = titles
      .map(t => `ranges=${encodeURIComponent(`'${t}'!A1:Z600`)}`)
      .join('&');

    const valuesRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?${rangesQuery}&valueRenderOption=FORMATTED_VALUE`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      }
    );

    if (!valuesRes.ok) {
      const errJson = await valuesRes.json().catch(() => ({}));
      return { sheets: [], error: errJson?.error?.message || `HTTP ${valuesRes.status}` };
    }

    const valuesData = await valuesRes.json();
    const valueRanges = valuesData.valueRanges || [];
    const nowTime = new Date().toLocaleTimeString('ar-EG');

    const resultSheets: SheetTab[] = titles.map((title, idx) => {
      const rangeItem = valueRanges[idx];
      const rawRows: any[][] = rangeItem?.values || [];

      let headers: string[] = [];
      let rows: (string | number | boolean | null)[][] = [];

      if (rawRows.length > 0) {
        headers = rawRows[0].map(h => String(h || '').trim());
        rows = rawRows.slice(1);
      }

      // Generate stable tab id
      const tabId = `tab-${title.replace(/[\s\W]+/g, '-').toLowerCase()}`;

      return {
        id: tabId,
        title,
        headers,
        rows,
        rowCount: rows.length,
        columnCount: headers.length,
        updatedAt: nowTime,
      };
    });

    return { sheets: resultSheets };
  } catch (err: any) {
    return { sheets: [], error: err?.message || 'FAILED_OAUTH_FETCH' };
  }
}

/**
 * Real live Google Sheet fetcher via Google Visualization API (for public/link-shared sheets)
 */
export async function fetchLiveGoogleSheetTab(
  spreadsheetId: string, 
  sheetTitle: string
): Promise<{ headers: string[]; rows: (string | number | boolean | null)[][]; error?: string }> {
  try {
    const timestamp = Date.now();
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetTitle)}&tq=&_=${timestamp}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      return { headers: [], rows: [], error: `HTTP ${res.status}` };
    }
    const text = await res.text();
    if (
      text.includes('Sign in to your Google Account') || 
      text.includes('accounts.google.com') || 
      text.includes('Allow Google Sheets access') ||
      text.includes('show-login-page') ||
      text.includes('request-storage-access')
    ) {
      return { headers: [], rows: [], error: 'RESTRICTED_ACCESS' };
    }
    
    // Parse Google Visualization JSON
    const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]+)\);?/);
    if (!jsonMatch || !jsonMatch[1]) {
      return { headers: [], rows: [], error: 'INVALID_FORMAT' };
    }

    const data = JSON.parse(jsonMatch[1]);
    const table = data.table;
    if (!table || !table.cols || !table.rows) {
      return { headers: [], rows: [], error: 'NO_TABLE' };
    }

    const headers: string[] = table.cols.map((col: any) => col.label || col.id || '');
    const rows: (string | number | boolean | null)[][] = table.rows.map((row: any) => {
      if (!row || !row.c) return [];
      return row.c.map((cell: any) => {
        if (!cell) return '';
        return cell.f !== undefined ? cell.f : (cell.v !== undefined ? cell.v : '');
      });
    });

    return { headers, rows };
  } catch (err: any) {
    return { headers: [], rows: [], error: err?.message || 'FETCH_FAILED' };
  }
}

/**
 * Parse TSV/CSV data (e.g. copied from Google Sheets / Excel directly)
 */
export function parsePastedSpreadsheetText(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };

  const delimiter = lines[0].includes('\t') ? '\t' : ',';
  const parsed = lines.map(line => line.split(delimiter).map(cell => cell.replace(/^"(.*)"$/, '$1').trim()));
  
  return {
    headers: parsed[0] || [],
    rows: parsed.slice(1) || [],
  };
}
