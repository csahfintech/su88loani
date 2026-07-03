const SHEET_ID = '請貼上你的 Google Sheet ID';
const SHEET_NAME = '案件管理';
function doPost(e){
  const body = JSON.parse(e.postData.contents || '{}');
  const d = body.data || {};
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if(sh.getLastRow() === 0){
    sh.appendRow(['建立時間','案件編號','LINE User ID','LINE名稱','姓名','電話','身分證','生日','手機型號','目前步驟','狀態','原始資料']);
  }
  sh.appendRow([new Date(), d.caseNo, d.lineUserId, d.lineId, d.name, d.phone, d.idno, d.birthday, d.iphone, body.step, '資料已送出', JSON.stringify(d)]);
  return ContentService.createTextOutput(JSON.stringify({ok:true,caseNo:d.caseNo})).setMimeType(ContentService.MimeType.JSON);
}
function doGet(){return ContentService.createTextOutput('SU88 API OK');}
