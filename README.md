# 速88貸 V2 架構

## 系統架構說明

- GitHub Pages 前端：
  - `index.html`、`apply.html`、`dashboard.html`
  - 使用純前端 JavaScript 與 `localStorage` 模擬案件流程

- LINE LIFF：
  - `apply.html` 已整合 LIFF SDK
  - 使用 `LIFF_ID = "2010595360-scKYOHig"` 進行 LINE 帳號登入與資料擷取

- Google Apps Script：
  - `apps_script/Code.gs` 為後端骨架
  - 提供 `doPost(e)` 接收 payload 並寫入 Google Sheets
  - 預留 Google Drive 上傳與 LINE 管理員通知功能

- Google Sheets：
  - 作為案件資料儲存的後端表單
  - `Code.gs` 自動建立 `案件管理` 分頁與標頭

- Google Drive：
  - 目前於 `Code.gs` 中預留上傳位置註解
  - 後續可串接檔案上傳、影像存檔

- OCR：
  - `js/ocr.js` 提供 OCR 結構函式
  - `parseIdCardImage()`、`parseBankCoverImage()`、`parseIphoneScreenshot()` 目前回傳 mock 結果

- Dashboard：
  - `dashboard.html` / `js/dashboard.js` 提供案件管理後台架構
  - 讀取 `localStorage` 中 `su88_cases` 並顯示統計與列表

- 後續 Supabase 擴充：
  - 後端 API 可切換為 Supabase
  - `js/api.js` 為統一 API 管理入口，可擴充成 REST 或 Supabase client
