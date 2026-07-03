const cases = [
  { id: "SU23070001", name: "王小明", phone: "0912-345-678", step: 7, stepLabel: "手機驗證", status: "review", time: "今天 09:12" },
  { id: "SU23070002", name: "林小華", phone: "0928-123-456", step: 4, stepLabel: "撥款帳戶確認", status: "supplement", time: "今天 08:45" },
  { id: "SU23070003", name: "陳小英", phone: "0987-654-321", step: 2, stepLabel: "居住資料", status: "video", time: "昨天 16:20" },
  { id: "SU23070004", name: "張志豪", phone: "0933-222-111", step: 9, stepLabel: "待撥款", status: "pay", time: "昨天 14:10" },
  { id: "SU23070005", name: "楊雅筑", phone: "0955-887-743", step: 5, stepLabel: "緊急聯絡人", status: "review", time: "今天 10:08" }
];

const statusMap = {
  all: "全部案件",
  review: "待審核",
  supplement: "需補件",
  video: "待視訊",
  pay: "待撥款"
};

const countToday = document.getElementById("countToday");
const countReview = document.getElementById("countReview");
const countSupplement = document.getElementById("countSupplement");
const countVideo = document.getElementById("countVideo");
const countPay = document.getElementById("countPay");
const caseList = document.getElementById("caseList");
const searchInput = document.getElementById("searchInput");
const tabButtons = document.querySelectorAll(".tab-button");
let activeFilter = "all";

function getStatusClass(status) {
  return {
    review: "status-review",
    supplement: "status-supplement",
    video: "status-video",
    pay: "status-pay"
  }[status] || "status-complete";
}

function getStatusLabel(status) {
  return {
    review: "待審核",
    supplement: "需補件",
    video: "待視訊",
    pay: "待撥款"
  }[status] || "完成";
}

function renderSummary() {
  countToday.textContent = cases.filter((item) => item.time.includes("今天")).length;
  countReview.textContent = cases.filter((item) => item.status === "review").length;
  countSupplement.textContent = cases.filter((item) => item.status === "supplement").length;
  countVideo.textContent = cases.filter((item) => item.status === "video").length;
  countPay.textContent = cases.filter((item) => item.status === "pay").length;
}

function renderCases() {
  const query = searchInput.value.trim().toLowerCase();
  caseList.innerHTML = "";
  cases
    .filter((item) => activeFilter === "all" || item.status === activeFilter)
    .filter((item) => {
      if (!query) return true;
      return [item.id, item.name, item.phone].some((value) => value.toLowerCase().includes(query));
    })
    .forEach((item) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${item.id}</td>
        <td>${item.name}</td>
        <td>${item.phone}</td>
        <td>STEP ${item.step} ${item.stepLabel}</td>
        <td><span class="status-tag ${getStatusClass(item.status)}">${getStatusLabel(item.status)}</span></td>
        <td>${item.time}</td>
      `;
      caseList.appendChild(row);
    });
}

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    tabButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    activeFilter = button.dataset.filter;
    renderCases();
  });
});

searchInput.addEventListener("input", renderCases);

renderSummary();
renderCases();
