const API_URL = "";

async function submitCase(payload) {
  console.log("submitCase payload:", payload);
  const cases = JSON.parse(localStorage.getItem("su88_cases") || "[]");
  cases.push(payload);
  localStorage.setItem("su88_cases", JSON.stringify(cases));
  return { ok: true, payload };
}

async function uploadFile(file) {
  console.log("uploadFile mock:", file);
  return { ok: true, fileName: file.name, url: `mock://uploads/${file.name}` };
}

async function notifyAdmin(payload) {
  console.log("notifyAdmin payload:", payload);
  return { ok: true, message: "已模擬通知 LINE 管理員" };
}
