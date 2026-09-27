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
      rowCount: 82,
      columnCount: 7,
      headers: ['Timestamp', 'شيفتات الطيارين', 'إلى الساعة كام', 'Rider ID', 'حالة الطلب', 'الرد علي الطلب', 'سبب الرفض'],
      rows: [
        ['9/26/2026 11:53:02', 'تزويدات شيفتات الطيارين', '10:00 PM', '3908789', 'تم الرد', 'مقبول', ''],
        ['9/26/2026 12:26:23', 'تزويدات شيفتات الطيارين', '8:00 PM', '2061279', 'تم الرد', 'شيفت مكسور', ''],
        ['9/26/2026 12:30:23', 'تزويدات شيفتات الطيارين', '6:00 PM', '2054351', 'تم الرد', 'مقبول', ''],
        ['9/26/2026 12:31:12', 'تزويدات شيفتات الطيارين', '10:00 PM', '1861432', 'تم الرد', 'مقبول', ''],
        ['9/26/2026 12:41:50', 'تزويدات شيفتات الطيارين', '12:00 AM', '2061279', 'تم الرد', 'شيفت مكسور', ''],
        ['9/26/2026 13:28:50', 'تزويدات شيفتات الطيارين', '12:00 AM', '2461192', 'تم الرد', 'مقبول', ''],
        ['9/26/2026 13:29:49', 'تزويدات شيفتات الطيارين', '10:00 PM', '3901584', 'تم الرد', 'مقبول', ''],
        ['9/26/2026 13:43:13', 'تزويدات شيفتات الطيارين', '10:00 PM', '2598675', 'تم الرد', 'مقبول', ''],
        ['9/26/2026 14:02:10', 'تزويدات شيفتات الطيارين', '7:00 PM', '1549621', 'تم الرد', 'مقبول', ''],
        ['9/26/2026 14:34:22', 'تزويدات شيفتات الطيارين', '10:00 PM', '2118527', 'تم الرد', 'مقبول', ''],
        ['9/26/2026 14:34:50', 'تزويدات شيفتات الطيارين', '10:00 PM', '2536024', 'تم الرد', 'مقبول', ''],
        ['9/26/2026 14:35:28', 'تزويدات شيفتات الطيارين', '6:00 PM', '2054529', 'تم الرد', 'مقبول', ''],
        ['9/26/2026 14:37:02', 'تزويدات شيفتات الطيارين', '8:00 PM', '2094038', 'تم الرد', 'مقبول', ''],
        ['9/26/2026 15:18:22', 'تزويدات شيفتات الطيارين', '11:00 PM', '2211502', 'تم الرد', 'مقبول', ''],
        ['9/26/2026 15:33:54', 'تزويدات شيفتات الطيارين', '11:00 PM', '4246613', 'تم الرد', 'مقبول', ''],
        ['9/26/2026 15:36:35', 'تزويدات شيفتات الطيارين', '5:00 PM', '4857381', 'تم الرد', 'مقبول', ''],
        ['9/26/2026 15:38:01', 'تزويدات شيفتات الطيارين', '12:00 AM', '3684466', 'تم الرد', 'مقبول', ''],
        ['9/26/2026 15:55:22', 'تزويدات شيفتات الطيارين', '10:00 PM', '2028547', 'تم الرد', 'مقبول', ''],
        ['9/26/2026 15:55:58', 'تزويدات شيفتات الطيارين', '9:00 PM', '2537356', 'تم الرد', 'مقبول', ''],
        ['9/26/2026 15:56:51', 'تزويدات شيفتات الطيارين', '10:00 PM', '2194656', 'تم الرد', 'مقبول', ''],
        ['9/26/2026 16:14:34', 'تزويدات شيفتات الطيارين', '10:00 PM', '4685635', 'تم الرد', 'مقبول', ''],
        ['9/26/2026 16:25:14', 'تزويدات شيفتات الطيارين', '12:00 AM', '2449127', 'تم الرد', 'مقبول', ''],
        ['9/26/2026 16:41:55', 'تزويدات شيفتات الطيارين', '10:00 PM', '4040869', 'تم الرد', 'مقبول', ''],
        ['9/26/2026 16:42:16', 'تزويدات شيفتات الطيارين', '9:00 PM', '2148590', 'تم الرد', 'مقبول', ''],
        ['9/26/2026 16:42:42', 'تزويدات شيفتات الطيارين', '11:00 PM', '4141630', 'تم الرد', 'مقبول', ''],
        ['9/26/2026 16:44:27', 'تزويدات شيفتات الطيارين', '12:00 AM', '4284486', 'تم الرد', 'مقبول', ''],
        ['9/26/2026 16:50:55', 'تزويدات شيفتات الطيارين', '12:00 AM', '4164614', 'تم الرد', 'شيفت مكسور', ''],
        ['9/26/2026 16:57:29', 'تزويدات شيفتات الطيارين', '10:00 PM', '3900300', 'تم الرد', 'مقبول', ''],
        ['9/26/2026 17:21:45', 'تزويدات شيفتات الطيارين', '9:00 PM', '2052350', 'تم الرد', 'مقبول', ''],
        ['9/26/2026 17:26:05', 'تزويدات شيفتات الطيارين', '9:00 PM', '3862986', 'تم الرد', 'مقبول', ''],
        ['9/26/2026 17:30:21', 'تزويدات شيفتات الطيارين', '10:00 PM', '1556449', 'تم الرد', 'مقبول', ''],
        ['9/26/2026 17:53:06', 'تزويدات شيفتات الطيارين', '2:00 AM', '1928798', 'تم الرد', 'مقبول', ''],
        ['9/26/2026 17:53:36', 'تزويدات شيفتات الطيارين', '11:00 PM', '2610136', 'تم الرد', 'مقبول', ''],
        ['9/26/2026 18:02:59', 'تزويدات شيفتات الطيارين', '4:00 AM', '4567549', 'تم الرد', 'مقبول', ''],
        ['9/26/2026 18:15:43', 'تزويدات شيفتات الطيارين', '11:00 PM', '2061438', 'تم الرد', 'مقبول', ''],
        ['9/26/2026 18:19:28', 'تزويدات شيفتات الطيارين', '2:00 AM', '3991446', 'تم الرد', 'مقبول', ''],
        ['9/26/2026 18:23:54', 'تزويدات شيفتات الطيارين', '12:00 AM', '3842883', 'تم الرد', 'مقبول', ''],
        ['9/26/2026 18:24:41', 'تزويدات شيفتات الطيارين', '4:00 AM', '3845152', 'تم الرد', 'مقبول', ''],
        ['9/26/2026 18:43:10', 'تزويدات شيفتات الطيارين', '12:00 AM', '4594470', 'تم الرد', 'مقبول', ''],
        ['9/26/2026 18:54:57', 'تزويدات شيفتات الطيارين', '2:00 AM', '2049517', 'تم الرد', 'مقبول', ''],
        ['9/26/2026 19:00:52', 'تزويدات شيفتات الطيارين', '12:00 AM', '4685635', 'تم الرد', 'مقبول', ''],
        ['9/26/2026 19:08:11', 'تزويدات شيفتات الطيارين', '12:00 AM', '4593558', 'تم الرد', 'شيفت مكسور', ''],
        ['9/26/2026 19:26:20', 'تزويدات شيفتات الطيارين', '9:00 PM', '4857381', 'تم الرد', 'متجاهل: الشيفت منتهي بالفعل للوقت الحالي', ''],
        ['9/26/2026 19:33:08', 'تزويدات شيفتات الطيارين', '4:00 PM', '4665795', 'تم الرد', 'مقبول', ''],
        ['9/26/2026 19:33:31', 'تزويدات شيفتات الطيارين', '1:00 AM', '2194656', 'تم الرد', 'مقبول', ''],
        ['9/26/2026 19:34:50', 'تزويدات شيفتات الطيارين', '3:00 PM', '2589520', 'تم الرد', 'مقبول', ''],
        ['9/26/2026 19:46:18', 'تزويدات شيفتات الطيارين', '10:00 PM', '4012355', 'تم الرد', 'مقبول', ''],
        ['9/26/2026 20:01:13', 'تزويدات شيفتات الطيارين', '10:00 PM', '4564938', 'تم الرد', 'شيفت مكسور', ''],
        ['9/26/2026 20:08:13', 'تزويدات شيفتات الطيارين', '12:00 AM', '3908789', 'تم الرد', 'مقبول', ''],
        ['9/26/2026 20:13:37', 'تزويدات شيفتات الطيارين', '10:00 PM', '3862986', 'تم الرد', 'مقبول', ''],
        ['9/26/2026 20:17:35', 'تزويدات شيفتات الطيارين', '10:00 PM', '2148590', 'تم الرد', 'مقبول', ''],
        ['9/26/2026 20:34:23', 'تزويدات شيفتات الطيارين', '4:00 AM', '2213042', 'تم الرد', 'مقبول', ''],
        ['9/26/2026 21:09:35', 'تزويدات شيفتات الطيارين', '3:00 AM', '4704957', 'تم الرد', 'مقبول', ''],
        ['9/26/2026 21:10:32', 'تزويدات شيفتات الطيارين', '3:00 AM', '2430061', 'تم الرد', 'مقبول', ''],
        ['9/26/2026 21:38:21', 'تزويدات شيفتات الطيارين', '1:00 AM', '2061438', 'تم الرد', 'مقبول', ''],
        ['9/26/2026 21:47:34', 'تزويدات شيفتات الطيارين', '12:00 AM', '1391920', 'تم الرد', 'متجاهل: الوقت المطلوب أقل من أو يساوي نهاية الشيفت', ''],
        ['9/26/2026 22:11:25', 'تزويدات شيفتات الطيارين', '1:00 AM', '3833064', 'تم الرد', 'مقبول', ''],
        ['9/26/2026 22:12:57', 'تزويدات شيفتات الطيارين', '4:00 AM', '4562335', 'تم الرد', 'مقبول', ''],
        ['9/26/2026 22:19:18', 'تزويدات شيفتات الطيارين', '12:00 AM', '2148971', 'تم الرد', 'متجاهل: الوقت المطلوب أقل من أو يساوي نهاية الشيفت', ''],
        ['9/26/2026 22:22:09', 'تزويدات شيفتات الطيارين', '4:00 AM', '4894646', 'تم الرد', 'شيفت مكسور', ''],
        ['9/26/2026 22:24:33', 'تزويدات شيفتات الطيارين', '2:00 AM', '4685635', 'تم الرد', 'مقبول', ''],
        ['9/26/2026 22:33:37', 'تزويدات شيفتات الطيارين', '1:00 AM', '2526063', 'تم الرد', 'متجاهل: الشيفت منتهي بالفعل للوقت الحالي', ''],
        ['9/26/2026 22:34:13', 'تزويدات شيفتات الطيارين', '1:00 AM', '2366801', 'تم الرد', 'متجاهل: الشيفت منتهي بالفعل للوقت الحالي', ''],
        ['9/26/2026 22:52:31', 'تزويدات شيفتات الطيارين', '3:00 AM', '4825281', 'تم الرد', 'مقبول', ''],
        ['9/26/2026 23:10:57', 'تزويدات شيفتات الطيارين', '4:00 AM', '4245383', 'تم الرد', 'مقبول', ''],
        ['9/26/2026 23:11:20', 'تزويدات شيفتات الطيارين', '2:00 AM', '4594470', 'تم الرد', 'مقبول', ''],
      ],
      updatedAt: 'الآن',
    },
    {
      id: 'tab-break-release',
      title: 'فك البريك',
      rowCount: 16,
      columnCount: 6,
      headers: ['Timestamp', 'شيفتات الطيارين', 'Rider ID', 'حالة الطلب', 'الرد علي الطلب', 'سبب الرفض'],
      rows: [
        ['9/26/2026 14:10:00', 'فك بريك', '1875870', 'تم الرد', 'مقبول', ''],
        ['9/26/2026 14:22:15', 'فك بريك', '1301869', 'تم الرد', 'مقبول', ''],
        ['9/26/2026 14:45:00', 'فك بريك', '2049517', 'تم الرد', 'مقبول', ''],
        ['9/26/2026 15:10:20', 'فك بريك', '1564613', 'تم الرد', 'مقبول', ''],
        ['9/26/2026 15:30:10', 'فك بريك', '1875870', 'تم الرد', 'مقبول', ''],
        ['9/26/2026 16:05:40', 'فك بريك', '2049517', 'تم الرد', 'مقبول', ''],
        ['9/26/2026 16:20:12', 'فك بريك', '2417814', 'تم الرد', 'مقبول', ''],
        ['9/26/2026 17:15:30', 'فك بريك', '2459212', 'تم الرد', 'مقبول', ''],
        ['9/26/2026 17:40:00', 'فك بريك', '4044197', 'تم الرد', 'غير مقبول', 'لا يوجد شيفت'],
        ['9/26/2026 18:12:15', 'فك بريك', '4576409', 'تم الرد', 'مقبول', ''],
        ['9/26/2026 18:50:00', 'فك بريك', '4694142', 'تم الرد', 'مقبول', ''],
        ['9/26/2026 19:25:30', 'فك بريك', '4910948', 'تم الرد', 'مقبول', ''],
        ['9/26/2026 20:00:10', 'فك بريك', '2461192', 'تم الرد', 'غير مقبول', 'بريك سيستم'],
        ['9/26/2026 20:30:20', 'فك بريك', '2461192', 'تم الرد', 'غير مقبول', 'بريك سيستم'],
        ['9/26/2026 21:10:45', 'فك بريك', '4339436', 'تم الرد', 'غير مقبول', 'بريك سيستم'],
        ['9/26/2026 22:05:00', 'فك بريك', '1391920', 'تم الرد', 'مقبول', ''],
      ],
      updatedAt: 'الآن',
    },
    {
      id: 'tab-shift-actions',
      title: 'رفع و قفل شيفت',
      rowCount: 5,
      columnCount: 8,
      headers: ['Timestamp', 'أختار قفل أو رفع', 'السبب', 'Rider ID', 'الإثبات', 'حالة الطلب', 'الرد علي الطلب', 'سبب الرفض'],
      rows: [
        ['9/26/2026 17:05:27', 'قفل شيفت', 'شغال 11 ساعه نقط فضلا', '4910948', 'تم المرفق', 'تم الرد', 'مرفوض', 'تم استهلاك الحد الأقصى'],
        ['9/26/2026 18:01:10', 'قفل شيفت', 'شفت فصلا بنتو تعبان وريحله', '4910948', 'تم المرفق', 'تم الرد', 'مرفوض', 'إثبات غير مكتمل'],
        ['9/26/2026 18:55:53', 'قفل شيفت', 'شغال 11 ساعه نفقلو فضلا', '2537356', 'تم المرفق', 'تم الرد', 'مرفوض', 'غير مستوفي الشروط'],
        ['9/26/2026 23:25:15', 'قفل شيفت', 'نفظو فصلا شغال 13 ساعه نفقلو فضلا', '1391920', 'تم المرفق', 'تم الرد', 'مرفوض', 'تجاوز وقت الشيفت'],
        ['9/27/2026 0:01:53', 'قفل شيفت', 'مندوب شغال 13 ساعه نفقلو فقط', '1391920', 'تم المرفق', 'قيد الإنتظار', 'قيد المراجعة', ''],
      ],
      updatedAt: 'الآن',
    },
    {
      id: 'tab-join-shift',
      title: 'لحم الشيفت',
      rowCount: 4,
      columnCount: 6,
      headers: ['Timestamp', 'كود الطيار', 'من', 'حالة الطلب', 'الرد على الطلب', 'سبب الرفض'],
      rows: [
        ['9/26/2026 15:20:00', '3908789', '4:00 PM', 'تم الرد', 'مقبول', ''],
        ['9/26/2026 17:10:30', '2061279', '6:00 PM', 'تم الرد', 'مرفوض', 'تضارب مواعيد الشيفت'],
        ['9/26/2026 19:40:15', '2461192', '8:00 PM', 'تم الرد', 'مقبول', ''],
        ['9/26/2026 21:05:00', '1861432', '10:00 PM', 'قيد الإنتظار', 'قيد المراجعة', ''],
      ],
      updatedAt: 'الآن',
    },
    {
      id: 'tab-inquiries',
      title: 'الاستفسارات',
      rowCount: 3,
      columnCount: 7,
      headers: ['Timestamp', 'سبب الإستفسار', 'اشرح الحاله', 'كود الطيار', 'الاثبات', 'حالة الطلب', 'الرد على الطلب'],
      rows: [
        ['9/26/2026 14:50:10', 'استفسار عن بونص', 'لم ينزل بونص الأسبوع الماضي', '2598675', 'كشف حساب', 'تم الرد', 'مقبول - تم التوضيح والإيداع'],
        ['9/26/2026 16:30:22', 'استفسار عن باقة النت', 'مشكلة في سرعة التطبيق الميداني', '1549621', 'سكرين شوت', 'تم الرد', 'جاري المتابعة مع الدعم الفني'],
        ['9/26/2026 20:15:00', 'مشكلة في الحساب', 'طلب تصحيح ساعات العمل', '2054529', 'إيصال', 'قيد الإنتظار', 'قيد المراجعة'],
      ],
      updatedAt: 'الآن',
    },
    {
      id: 'tab-modify-shift',
      title: 'تعديل الشيفت',
      rowCount: 2,
      columnCount: 9,
      headers: ['Timestamp', 'تعديل شيفت', 'السبب', 'من', 'المكتب', 'كود الطيار', 'سبب الرفض', 'Assigned For', 'Comments'],
      rows: [
        ['9/26/2026 13:10:00', 'تعديل وقت البدء', 'ظرف طارئ', '12:00 PM', 'مكتب مكرم عبيد', '2094038', '', 'إدارة التشغيل', 'تم التعديل'],
        ['9/26/2026 16:45:00', 'تغيير الموعد', 'عطل دراجة نارية', '2:00 PM', 'مكتب عباس العقاد', '4246613', 'وقت غير متاح', 'إدارة الحركة', 'غير مقبول'],
      ],
      updatedAt: 'الآن',
    },
    {
      id: 'tab-order-inquiry',
      title: 'استفسار عن اوردر',
      rowCount: 3,
      columnCount: 5,
      headers: ['Timestamp', 'سبب الإستفسار', 'كود الأوردر', 'اشرح الحاله', 'كود الطيار'],
      rows: [
        ['9/26/2026 15:40:11', 'العميل لا يستجيب', 'ORD-99214', 'اتصال مكرر بدون رد من المستلم', '4857381'],
        ['9/26/2026 18:20:00', 'العنوان غير دقيق', 'ORD-99302', 'المبنى غير موجود بشارع البطراوي', '3684466'],
        ['9/26/2026 21:15:40', 'إلغاء أوردر', 'ORD-99415', 'تأخر المتجر في تجهيز الوجبة', '2194656'],
      ],
      updatedAt: 'الآن',
    },
    {
      id: 'tab-change-point',
      title: 'تغيير نقطه',
      rowCount: 2,
      columnCount: 8,
      headers: ['Timestamp', 'سبب الإستفسار', 'من', 'إلى', 'اشرح الحاله', 'كود الطيار', 'الاثبات', 'حالة الطلب'],
      rows: [
        ['9/26/2026 16:10:00', 'تغيير النقطة', 'زون عباس العقاد', 'زون مكرم عبيد', 'كثافة طلبات أعلى في مكرم', '4685635', 'موقع GPS', 'تم الرد'],
        ['9/26/2026 19:30:00', 'تغيير النقطة', 'زون الحي السابع', 'زون الحي العاشر', 'قرب السكن', '2449127', 'إثبات عنوان', 'قيد الإنتظار'],
      ],
      updatedAt: 'الآن',
    },
  ];
}

// Convert all sheets rows to uniform RiderRequest records for unified filtering & searching
export function extractAllRiderRequests(sheets: SheetTab[]): RiderRequest[] {
  const requests: RiderRequest[] = [];

  sheets.forEach((sheet) => {
    const headers = sheet.headers;
    
    // Find column indexes
    const timestampColIdx = headers.findIndex(h => /timestamp|طابع\s*زمني|تاريخ|date|وقت/i.test(h));
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

      // Extract exact Timestamp from sheet column or row[0]
      const timestamp = (timestampColIdx !== -1 && row[timestampColIdx] != null && String(row[timestampColIdx]).trim() !== '')
        ? String(row[timestampColIdx]).trim()
        : (row[0] != null && String(row[0]).trim() !== '' ? String(row[0]).trim() : 'غير مسجل');

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
 * Real live Google Sheet fetcher via Google Visualization API
 */
export async function fetchLiveGoogleSheetTab(
  spreadsheetId: string, 
  sheetTitle: string
): Promise<{ headers: string[]; rows: (string | number | boolean | null)[][]; error?: string }> {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetTitle)}`;
    const res = await fetch(url);
    if (!res.ok) {
      return { headers: [], rows: [], error: `HTTP ${res.status}` };
    }
    const text = await res.text();
    if (text.includes('Sign in to your Google Account') || text.includes('accounts.google.com') || text.includes('Allow Google Sheets access')) {
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
