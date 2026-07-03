const TOTAL_STEPS = 9;
const STEP_NAMES = [
  "基本資料確認",
  "居住資料",
  "工作資料",
  "撥款帳戶確認",
  "緊急聯絡人",
  "身分驗證",
  "手機驗證",
  "確認送出",
  "完成頁"
];
const STORAGE_KEY = "su88_apply_v1";
let currentStep = 1;
const form = document.getElementById("applyForm");
const steps = document.querySelectorAll(".step-panel");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const progressFill = document.getElementById("progressFill");
const stepText = document.getElementById("stepText");
const progressPercent = document.getElementById("progressPercent");
const timeText = document.getElementById("timeText");
const progressRemain = document.getElementById("progressRemain");
const caseNumber = document.getElementById("caseNumber");

function formatTime(step) {
  if (step >= 9) return "完成";
  const remain = TOTAL_STEPS - step;
  const minutes = Math.max(1, Math.ceil(remain * 1.2));
  return `約需 ${minutes} 分鐘`;
}

function saveForm() {
  const data = { currentStep };
  const formData = new FormData(form);
  formData.forEach((value, key) => {
    if (value instanceof File) {
      if (value.name) {
        data[`${key}_fileName`] = value.name;
      }
    } else {
      data[key] = value;
    }
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function restoreForm() {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  if (!Object.keys(saved).length) return;
  currentStep = saved.currentStep || 1;
  Object.entries(saved).forEach(([key, value]) => {
    if (key === "currentStep") return;
    if (key.endsWith("_fileName")) {
      const sourceKey = key.replace(/_fileName$/, "");
      const holder = document.querySelector(`[data-file-name="${sourceKey}"]`);
      if (holder) holder.textContent = value;
      return;
    }
    const element = form.elements[key];
    if (!element) return;
    if (element.type === "radio") {
      const radio = [...form.elements[key]].find((item) => item.value === value);
      if (radio) radio.checked = true;
    } else {
      element.value = value;
    }
  });
}

function buildContacts() {
  const container = document.getElementById("contactArea");
  const titles = ["緊急聯絡人 1", "緊急聯絡人 2", "備用聯絡人"];
  titles.forEach((title, index) => {
    const card = document.createElement("div");
    card.className = "contact-card";
    card.innerHTML = `
      <h2>${title}</h2>
      <label>姓名<input type="text" name="contact${index + 1}Name" placeholder="請輸入姓名"></label>
      <label>關係<input type="text" name="contact${index + 1}Relation" placeholder="例：父親、朋友"></label>
      <label>電話<input type="tel" name="contact${index + 1}Phone" placeholder="0912-345-678"></label>
    `;
    container.appendChild(card);
  });
}

function buildPhoneShots() {
  const container = document.getElementById("phoneShotArea");
  const items = [
    "手機設定畫面截圖",
    "關於本機截圖",
    "行動服務截圖",
    "FaceTime 設定截圖",
    "電池健康截圖",
    "序號資訊截圖"
  ];
  items.forEach((labelText, index) => {
    const card = document.createElement("div");
    card.className = "phone-card";
    card.innerHTML = `
      <h2>截圖 ${index + 1}</h2>
      <p class="file-note">${labelText}，支援拍照上傳</p>
      <label>${labelText}<input type="file" name="phoneShot${index + 1}" accept="image/*" capture="environment"></label>
    `;
    container.appendChild(card);
  });
}

function updateStepUI() {
  steps.forEach((step) => {
    step.classList.toggle("active", Number(step.dataset.step) === currentStep);
  });
  const percent = Math.round((currentStep / TOTAL_STEPS) * 100);
  progressFill.style.width = `${percent}%`;
  stepText.textContent = `STEP ${currentStep} / ${TOTAL_STEPS}`;
  progressPercent.textContent = `完成 ${percent}%`;
  timeText.textContent = formatTime(currentStep);
  progressRemain.textContent = currentStep < TOTAL_STEPS ? `剩 ${TOTAL_STEPS - currentStep} 步` : "";
  prevBtn.style.display = currentStep === 1 || currentStep === 9 ? "none" : "inline-flex";
  if (currentStep === 8) {
    nextBtn.textContent = "確認送出";
  } else if (currentStep === 9) {
    nextBtn.textContent = "返回首頁";
  } else {
    nextBtn.textContent = "下一步";
  }
}

function goToStep(step) {
  currentStep = Math.max(1, Math.min(TOTAL_STEPS, step));
  updateStepUI();
  saveForm();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function submitStep() {
  if (currentStep === 8) {
    if (!form.reportValidity()) return;
    const token = Date.now().toString().slice(-6);
    caseNumber.textContent = `案件編號 SU${new Date().toISOString().slice(0,10).replace(/-/g,"")} ${token}`;
    localStorage.removeItem(STORAGE_KEY);
    goToStep(9);
    return;
  }
  if (currentStep === 9) {
    location.href = "index.html";
    return;
  }
  if (currentStep < 8) {
    goToStep(currentStep + 1);
  }
}

form.addEventListener("input", saveForm);
form.addEventListener("change", saveForm);
nextBtn.addEventListener("click", submitStep);
prevBtn.addEventListener("click", () => goToStep(currentStep - 1));

buildContacts();
buildPhoneShots();
restoreForm();
updateStepUI();
