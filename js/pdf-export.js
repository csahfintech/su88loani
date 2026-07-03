function exportCasePdf(caseData) {
  console.log("exportCasePdf mock:", caseData);
  const page = window.open("", "case-pdf-preview", "width=900,height=700");
  if (!page) return;
  page.document.write("<html><head><title>案件預覽</title></head><body>");
  page.document.write(`<h1>案件 ${caseData.caseId}</h1>`);
  page.document.write(`<p>姓名：${caseData.basicData.name}</p>`);
  page.document.write(`<p>電話：${caseData.basicData.phone}</p>`);
  page.document.write(`<p>LINE 名稱：${caseData.lineProfile.displayName}</p>`);
  page.document.write(`<p>狀態：${caseData.status}</p>`);
  page.document.write(`<pre>${JSON.stringify(caseData, null, 2)}</pre>`);
  page.document.write("</body></html>");
  page.document.close();
  page.print();
}
