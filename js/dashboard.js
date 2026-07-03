const statusMap = {
  all: "全部案件",
  review: "待審核",
  supplement: "需補件",
  video: "待視訊",
  pay: "待撥款",
  paid: "已撥款"
};

const statusFilterMap = {
  all: null,
  review: "待審核",
  supplement: "需補件",
  video: "待視訊",
  pay: "待撥款",
  paid: "已撥款"
};

const countToday = document.getElementById("countToday");
const countReview = document.getElementById("countReview");
const countSupplement = document.getElementById("countSupplement");
const countVideo = document.getElementById("countVideo");
const countPay = document.getElementById("countPay");
const countPaid = document.getElementById("countPaid");
const caseList = document.getElementById("caseList");
const searchInput = document.getElementById("searchInput");
const tabButtons = document.querySelectorAll(".tab-button");
let activeFilter = "all";

function loadCases() {
  try {
    return JSON.parse(localStorage.getItem("su88_cases") || "[]");
  } catch (error) {
    console.error("loadCases error", error);
    return [];
  }
}

function getStatusClass(status) {
  return {
    "待審核": "status-review",
    "需補件": "status-supplement",
    "待視訊": "status-video",
    "待撥款": "status-pay",
    "已撥款": "status-paid"
  }[status] || "status-complete";
}

function formatCaseTime(createdAt) {
  if (!createdAt) return "未知";
  try {
    const date = new Date(createdAt);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return `今天 ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
    }
    return date.toLocaleString("zh-TW", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  } catch {
    return createdAt;
  }
}

function renderSummary(cases) {
  const todayCases = cases.filter((item) => {
    if (!item.createdAt) return false;
    const created = new Date(item.createdAt);
    return created.toDateString() === new Date().toDateString();
  });
  countToday.textContent = todayCases.length;
  countReview.textContent = cases.filter((item) => item.status === "待審核").length;
  countSupplement.textContent = cases.filter((item) => item.status === "需補件").length;
  countVideo.textContent = cases.filter((item) => item.status === "待視訊").length;
  countPay.textContent = cases.filter((item) => item.status === "待撥款").length;
  if (countPaid) countPaid.textContent = cases.filter((item) => item.status === "已撥款").length;
}

function renderCases(cases) {
  const query = searchInput.value.trim().toLowerCase();
  const statusFilter = statusFilterMap[activeFilter];
  caseList.innerHTML = "";
  cases
    .filter((item) => !statusFilter || item.status === statusFilter)
    .filter((item) => {
      if (!query) return true;
      return [item.caseId, item.basicData?.name, item.basicData?.phone, item.lineProfile?.displayName]
        .some((value) => String(value || "").toLowerCase().includes(query));
    })
    .forEach((item) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${item.caseId}</td>
        <td>${item.basicData?.name || "-"}</td>
        <td>${item.basicData?.phone || "-"}</td>
        <td>${item.lineProfile?.displayName || "-"}</td>
        <td><span class="status-tag ${getStatusClass(item.status)}">${item.status || "待審核"}</span></td>
        <td>${formatCaseTime(item.createdAt)}</td>
        <td><button class="action-button" data-id="${item.caseId}">查看</button></td>
      `;
      caseList.appendChild(row);
    });
}

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    tabButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    activeFilter = button.dataset.filter;
    const cases = loadCases();
    renderCases(cases);
  });
});

searchInput.addEventListener("input", () => {
  const cases = loadCases();
  renderCases(cases);
});

function updateDashboard() {
  const cases = loadCases();
  renderSummary(cases);
  renderCases(cases);
}

updateDashboard();
