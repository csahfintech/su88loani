const TOTAL_STEPS = 9;
const STEP_NAMES = [
  "基本資料確認",
  "LINE 帳號驗證",
  "居住資料",
  "工作資料",
  "撥款帳戶確認",
  "緊急聯絡人",
  "身份驗證",
  "手機驗證",
  "確認送出"
];
const STORAGE_KEY = "su88_apply_v1";
const LINE_STORAGE_KEY = "su88_line_profile";
const LIFF_ID = "2010595360-scKYOHig";
const LINE_MOCK_PROFILE = {
  displayName: "LINE 使用者",
  userId: "",
  pictureUrl: "",
  verified: false
};
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
const lineVerifyBtn = document.getElementById("lineVerifyBtn");
const lineStatus = document.getElementById("lineStatus");
const lineDisplayName = document.getElementById("lineDisplayName");
const lineAvatarImg = document.getElementById("lineAvatarImg");
const lineError = document.getElementById("lineError");
const stepTabs = document.getElementById("stepTabs");
let lineProfile = null;

function formatTime(step) {
  if (step > TOTAL_STEPS) return "完成";
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
    } else if (element.length && element[0] && element[0].type === 'radio') {
      const radio = [...element].find((item) => item.value === value);
      if (radio) radio.checked = true;
    } else {
      element.value = value;
    }
  });
}

function loadBasicData() {
  const saved = localStorage.getItem('su88_basic_data');
  const caseId = localStorage.getItem('su88_case_id');
  if (caseId) {
    const caseLabel = document.querySelector('.case-value');
    if (caseLabel) caseLabel.textContent = caseId;
  }
  if (!saved) return;
  let data = {};
  try {
    data = JSON.parse(saved);
  } catch (e) {
    return;
  }
  const basicFields = {
    name: 'name',
    phone: 'phone',
    idNumber: 'idNumber',
    birthDate: 'birthday',
    phoneModel: 'phoneModel'
  };

  const normalizeDate = (value) => {
    if (!value) return '';
    const trimmed = value.trim();
    const digitOnly = trimmed.replace(/[^0-9]/g, '');
    if (/^\d{8}$/.test(digitOnly)) {
      return `${digitOnly.slice(0, 4)}-${digitOnly.slice(4, 6)}-${digitOnly.slice(6)}`;
    }
    const iso = trimmed.replace(/\//g, '-');
    const parts = iso.split('-').map(part => part.padStart(2, '0'));
    if (parts.length === 3) {
      const [a, b, c] = parts;
      if (a.length === 4) return `${a}-${b}-${c}`;
      if (c.length === 4) return `${c}-${b}-${a}`;
    }
    return iso;
  };
  Object.entries(basicFields).forEach(([key, fieldName]) => {
    const input = form.elements[fieldName];
    if (!input) return;
    if (!input.value || input.value.trim() === '') {
      const value = data[key] || '';
      if (fieldName === 'birthday') {
        input.value = normalizeDate(value);
      } else {
        input.value = value;
      }
    }
  });
}

async function initLineLiff() {
  try {
    if (!window.liff) {
      return false;
    }
    await liff.init({ liffId: LIFF_ID });
    if (!liff.isInClient()) {
      return false;
    }
    if (!liff.isLoggedIn()) {
      liff.login();
      return false;
    }
    return true;
  } catch (error) {
    console.error('LIFF init failed', error);
    if (window.liff && liff.isInClient && liff.isInClient()) {
      showLineError('LINE 驗證失敗，請重新從 LINE 開啟。');
    }
    return false;
  }
}

async function fetchLineProfile() {
  const initialized = await initLineLiff();
  if (!initialized) {
    return LINE_MOCK_PROFILE;
  }
  try {
    const profile = await liff.getProfile();
    return {
      displayName: profile.displayName,
      userId: profile.userId,
      pictureUrl: profile.pictureUrl,
      verified: true
    };
  } catch (error) {
    console.error('LIFF profile error', error);
    showLineError('LINE 驗證失敗，請重新從 LINE 開啟。');
    return LINE_MOCK_PROFILE;
  }
}

function showLineError(message) {
  if (lineError) lineError.textContent = message;
  if (lineStatus) {
    lineStatus.textContent = 'LINE 驗證失敗';
    lineStatus.classList.remove('verified');
  }
  if (lineAvatarImg) lineAvatarImg.removeAttribute('src');
  if (lineDisplayName) lineDisplayName.textContent = '等待 LINE 授權...';
  lineProfile = null;
  if (lineVerifyBtn) {
    lineVerifyBtn.textContent = '重新同步 LINE';
  }
  updateStepUI();
}

function normalizeLineProfile(profile) {
  if (!profile || typeof profile !== 'object') {
    return {
      displayName: '等待 LINE 授權...',
      userId: '',
      pictureUrl: '',
      verified: false
    };
  }
  return {
    displayName: profile.displayName || profile.lineDisplayName || 'LINE 使用者',
    userId: profile.userId || profile.lineUserId || '',
    pictureUrl: profile.pictureUrl || profile.linePictureUrl || '',
    verified: profile.verified || profile.lineVerified || false
  };
}

function applyLineProfile(profile) {
  lineProfile = normalizeLineProfile(profile);
  localStorage.setItem(LINE_STORAGE_KEY, JSON.stringify(lineProfile));
  if (lineError) lineError.textContent = '';
  if (lineProfile.verified) {
    lineStatus.textContent = 'LINE 已驗證 ✅';
    lineStatus.classList.add('verified');
  } else {
    lineStatus.textContent = 'LINE 尚未驗證';
    lineStatus.classList.remove('verified');
  }
  if (lineDisplayName) lineDisplayName.textContent = lineProfile.displayName;
  if (lineAvatarImg) {
    if (lineProfile.pictureUrl) {
      lineAvatarImg.src = lineProfile.pictureUrl;
    } else {
      lineAvatarImg.removeAttribute('src');
    }
  }
  if (lineVerifyBtn) {
    lineVerifyBtn.textContent = lineProfile.verified ? '重新同步 LINE' : '同步 LINE';
  }
  updateStepUI();
  if (lineProfile.verified) {
    setTimeout(() => {
      if (currentStep === 2) goToStep(3);
    }, 1000);
  }
}

async function loadLineProfile() {
  const saved = localStorage.getItem(LINE_STORAGE_KEY);
  if (saved) {
    try {
      const profile = JSON.parse(saved);
      applyLineProfile(profile);
      return;
    } catch (e) {
      // ignore invalid saved data
    }
  }
  applyLineProfile(LINE_MOCK_PROFILE);
}

async function refreshLineProfile() {
  const fetched = await fetchLineProfile();
  if (fetched) {
    applyLineProfile(fetched);
  }
}

function buildContacts() {
  const container = document.getElementById("contactArea");
  const titles = ["第一位（家人）", "第二位（家人）", "第三位（朋友）"];
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

function buildIdUploads() {
  const container = document.getElementById("idUploadArea");
  const items = [
    { label: "身分證正面", name: "idFront", capture: "environment" },
    { label: "身分證反面", name: "idBack", capture: "environment" },
    { label: "手持身分證自拍", name: "idSelfie", capture: "user" }
  ];
  items.forEach((item) => {
    const card = document.createElement("label");
    card.className = "upload-card";
    card.innerHTML = `
      ${item.label}
      <input type="file" name="${item.name}" accept="image/*" capture="${item.capture}">
      <div class="file-status" data-file-status="${item.name}">尚未上傳</div>
    `;
    container.appendChild(card);
  });
}

function buildPhoneShots() {
  const container = document.getElementById("phoneShotArea");
  const items = [
    "Apple ID",
    "關於本機（上方）",
    "關於本機（下方）",
    "行動服務",
    "FaceTime",
    "電池（十天）"
  ];
  items.forEach((labelText, index) => {
    const card = document.createElement("div");
    card.className = "phone-card";
    card.innerHTML = `
      <h2>${labelText}</h2>
      <p class="file-note">請上傳 ${labelText} 示意圖</p>
      <label>${labelText}<input type="file" name="phoneShot${index + 1}" accept="image/*" capture="environment"></label>
      <div class="file-status" data-file-status="phoneShot${index + 1}">尚未完成</div>
    `;
    container.appendChild(card);
  });
}

function updateFileStatus(input) {
  const fileName = input.files && input.files.length ? input.files[0].name : null;
  const status = document.querySelector(`[data-file-status="${input.name}"]`);
  if (!status) return;
  status.textContent = fileName ? `已上傳：${fileName}` : "尚未上傳";
  if (input.name.startsWith("phoneShot") && fileName) {
    status.textContent = "✅ 已完成";
  }
}

function updateStepUI() {
  steps.forEach((step) => {
    step.classList.toggle("active", Number(step.dataset.step) === currentStep);
  });
  const percent = Math.round((Math.min(currentStep, TOTAL_STEPS) / TOTAL_STEPS) * 100);
  progressFill.style.width = `${percent}%`;
  stepText.textContent = currentStep <= TOTAL_STEPS ? `STEP ${currentStep} / ${TOTAL_STEPS}` : `STEP ${TOTAL_STEPS} / ${TOTAL_STEPS}`;
  progressPercent.textContent = `完成 ${percent}%`;
  timeText.textContent = formatTime(currentStep);
  progressRemain.textContent = currentStep < TOTAL_STEPS ? `剩 ${TOTAL_STEPS - currentStep} 步` : "";
  prevBtn.style.display = currentStep === 1 || currentStep === TOTAL_STEPS + 1 ? "none" : "inline-flex";

  if (stepTabs) {
    stepTabs.querySelectorAll(".step-tab").forEach((tab, index) => {
      tab.classList.toggle("active", index + 1 === currentStep);
    });
  }

  if (currentStep === TOTAL_STEPS) {
    nextBtn.textContent = "確認送出";
  } else if (currentStep === TOTAL_STEPS + 1) {
    nextBtn.textContent = "返回首頁";
  } else {
    nextBtn.textContent = "確認資料，下一步";
  }

  if (currentStep === 2 && !lineProfile?.verified) {
    nextBtn.disabled = true;
  } else {
    nextBtn.disabled = false;
  }
}

function canNavigateToStep(step) {
  if (step > 2 && !lineProfile?.verified) {
    return false;
  }
  return true;
}

function goToStep(step) {
  if (!canNavigateToStep(step)) {
    currentStep = 2;
  } else {
    currentStep = Math.max(1, Math.min(TOTAL_STEPS + 1, step));
  }
  updateStepUI();
  saveForm();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function submitStep() {
  if (currentStep === TOTAL_STEPS) {
    if (!form.reportValidity()) return;
    const token = Date.now().toString().slice(-6);
    caseNumber.textContent = `案件編號 SU${new Date().toISOString().slice(0,10).replace(/-/g,"")}${token}`;
    localStorage.removeItem(STORAGE_KEY);
    goToStep(TOTAL_STEPS + 1);
    return;
  }
  if (currentStep === TOTAL_STEPS + 1) {
    location.href = "index.html";
    return;
  }
  if (currentStep < TOTAL_STEPS) {
    goToStep(currentStep + 1);
  }
}

form.addEventListener("input", saveForm);
form.addEventListener("change", (event) => {
  if (event.target && event.target.type === "file") {
    updateFileStatus(event.target);
  }
  saveForm();
});
nextBtn.addEventListener("click", submitStep);
prevBtn.addEventListener("click", () => goToStep(currentStep - 1));
if (lineVerifyBtn) {
  lineVerifyBtn.addEventListener('click', refreshLineProfile);
}

function buildStepTabs() {
  if (!stepTabs) return;
  STEP_NAMES.forEach((label, index) => {
    const tab = document.createElement("button");
    tab.type = "button";
    tab.className = "step-tab";
    tab.innerHTML = `${index + 1} <span>${label}</span>`;
    tab.addEventListener("click", () => goToStep(index + 1));
    stepTabs.appendChild(tab);
  });
}

buildContacts();
buildIdUploads();
buildPhoneShots();
buildStepTabs();
restoreForm();
loadBasicData();
loadLineProfile();
updateStepUI();
