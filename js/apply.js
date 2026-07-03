const LIFF_ID='YOUR_LIFF_ID';
const API_URL='YOUR_APPS_SCRIPT_WEB_APP_URL';
let step=1;
const data=JSON.parse(localStorage.getItem('su88_apply')||'{}');
const $=id=>document.getElementById(id);
const steps=[
  renderBasic,renderHome,renderWork,renderBank,renderContacts,renderId,renderPhone,renderConfirm,renderDone
];
function save(){localStorage.setItem('su88_apply',JSON.stringify(data));}
function syncInputs(){document.querySelectorAll('[data-k]').forEach(el=>{data[el.dataset.k]=el.value});save();}
function input(k,label,type='text',ph=''){return `<div class="field"><label>${label}</label><input data-k="${k}" type="${type}" value="${data[k]||''}" placeholder="${ph}"></div>`}
function select(k,label,opts){return `<div class="field"><label>${label}</label><select data-k="${k}"><option value="">請選擇</option>${opts.map(o=>`<option ${data[k]==o?'selected':''}>${o}</option>`).join('')}</select></div>`}
function file(k,label){return `<div class="upload"><b>${label}</b><input data-k="${k}" type="file" accept="image/*"></div>`}
function renderBasic(){return `<h1 class="title">基本資料確認</h1><p class="sub">以下資料已由網站同步，請確認後繼續。</p>${['姓名:name','電話:phone','身分證:idno','出生年月日:birthday','手機型號:iphone'].map(x=>{let [a,k]=x.split(':');return `<div class="readonly"><b>${a}</b><br>${data[k]||'尚未帶入'}</div>`}).join('')}<div class="ok">✓ 已同步網站初步資料</div>`}
function renderHome(){return `<h1 class="title">居住資料</h1><p class="sub">請填寫目前居住與戶籍資料。</p>${input('lineId','LINE ID / LINE名稱')}${input('currentAddress','現居地址')}${input('householdAddress','戶籍地址')}${select('houseType','居住狀況',['自有','租屋'])}`}
function renderWork(){return `<h1 class="title">工作資料</h1><p class="sub">作為審核聯繫與資料確認使用。</p>${input('company','公司名稱')}${input('companyPhone','公司電話','tel')}${input('jobTitle','工作職位')}${input('companyAddress','公司地址')}${input('income','薪水收入','number')}`}
function renderBank(){return `<h1 class="title">撥款帳戶確認</h1><p class="sub">核准後款項將匯入此帳戶。</p>${select('bank','銀行（含代碼）',['004 臺灣銀行','005 土地銀行','006 合作金庫','007 第一銀行','008 華南銀行','012 台北富邦','013 國泰世華','822 中國信託'])}${input('branch','收款分行')}${input('account','收款帳號')}${input('accountName','收款戶名')}${file('bankCover','銀行帳戶封面照')}<div class="hint">📌 僅能使用此次提供帳戶交易；日後如需變更，請聯絡客服。</div>`}
function renderContacts(){let one=(n,t)=>`<div class="contact"><b>${t}</b>${input(`c${n}name`,'姓名')}${input(`c${n}relation`,'關係')}${input(`c${n}phone`,'電話','tel')}</div>`;return `<h1 class="title">緊急聯絡人</h1><p class="sub">請提供 2 位家人與 1 位朋友。</p>${one(1,'家人 1')}${one(2,'家人 2')}${one(3,'朋友 1')}`}
function renderId(){return `<h1 class="title">身分驗證</h1><p class="sub">請依序拍照上傳，系統後續可做 OCR 自動比對。</p>${file('idFront','身分證正面')}${file('idBack','身分證反面')}${file('idSelfie','手持身分證自拍')}`}
function renderPhone(){return `<h1 class="title">手機驗證</h1><p class="sub">請依照指示完成 6 張截圖。</p>${['設定▶最上方','設定▶一般▶關於本機▶最上面','設定▶一般▶關於本機▶最底下','設定▶行動服務▶最底下','設定▶FaceTime▶號碼與信箱','設定▶電池▶過去十天'].map((x,i)=>file(`phoneShot${i+1}`,`${i+1}. ${x}`)).join('')}<div class="ok">上傳後可辨識：型號、容量、SN、IMEI、IMEI2</div>`}
function renderConfirm(){return `<h1 class="title">確認送出</h1><p class="sub">請確認資料已完成。</p><ul class="list"><li>✓ 基本資料</li><li>✓ 居住資料</li><li>✓ 工作資料</li><li>✓ 撥款帳戶</li><li>✓ 緊急聯絡人</li><li>✓ 身分驗證</li><li>✓ 手機驗證</li></ul><div class="hint">送出後案件將進入專員審核。</div>`}
function renderDone(){return `<div class="done"><div class="check">✓</div><h1>資料已成功送出！</h1><p>您的案件已建立，專員將開始審核。</p><b>最快今日完成</b><div class="readonly">案件編號：${data.caseNo||'SU'+Date.now()}</div></div>`}
async function submit(){syncInputs();data.caseNo=data.caseNo||('SU'+new Date().toISOString().slice(0,10).replaceAll('-','')+String(Date.now()).slice(-5));save(); if(API_URL.includes('YOUR_')) return; await fetch(API_URL,{method:'POST',body:JSON.stringify({type:'apply',step,data})});}
async function init(){try{if(!LIFF_ID.includes('YOUR_')){await liff.init({liffId:LIFF_ID}); if(liff.isLoggedIn()){let p=await liff.getProfile(); data.lineUserId=p.userId; data.lineId=p.displayName; save();}}}catch(e){} const q=new URLSearchParams(location.search); ['name','phone','idno','birthday','iphone','caseNo','token'].forEach(k=>{if(q.get(k)) data[k]=q.get(k)});save();paint();}
function paint(){if(step<1)step=1;if(step>9)step=9;$('page').innerHTML=steps[step-1]();$('stepText').textContent=`STEP ${step} / 9`;$('bar').style.width=Math.round(step/9*100)+'%';$('timeHint').textContent=`完成 ${Math.round(step/9*100)}%｜約 ${Math.max(1,4-Math.floor(step/3))} 分鐘`;$('prev').style.display=step===1?'none':'block';$('next').textContent=step===8?'確認送出':step===9?'返回首頁':'下一步';document.querySelectorAll('[data-k]').forEach(el=>el.onchange=syncInputs)}
$('prev').onclick=()=>{syncInputs();step--;paint()};$('next').onclick=async()=>{syncInputs(); if(step===8){await submit(); step=9;} else if(step===9){location.href='./';return}else step++; paint()};init();
