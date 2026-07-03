const SHEET_ID = '請貼上你的 Google Sheet ID';
const SHEET_NAME = '案件管理';

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || '{}');
    const payload = body.payload || {};
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'createdAt',
        'caseId',
        'status',
        'name',
        'phone',
        'lineName',
        'bank',
        'step',
        'rawData'
      ]);
    }

    sheet.appendRow([
      payload.createdAt || new Date().toISOString(),
      payload.caseId || '',
      payload.status || '',
      payload.basicData?.name || '',
      payload.basicData?.phone || '',
      payload.lineProfile?.displayName || '',
      payload.bankData?.bank || '',
      payload.currentStep || '',
      JSON.stringify(payload)
    ]);

    // TODO: 預留 Google Drive 上傳位置
    // const folder = DriveApp.getFolderById('YOUR_DRIVE_FOLDER_ID');
    // const file = folder.createFile(...);

    // TODO: 預留 LINE 管理員通知 function
    // notifyLineAdmin(payload);

    return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.message })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ success: true, message: 'SU88 API OK' })).setMimeType(ContentService.MimeType.JSON);
}

function notifyLineAdmin(payload) {
  // TODO: 實作 LINE Notify 或 Messaging API 通知管理員
  console.log('notifyLineAdmin', payload);
}
