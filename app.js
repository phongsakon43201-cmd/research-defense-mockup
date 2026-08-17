const EXAM_DATE_LABEL='19 ส.ค. 2569';
const NEXT_DAY_LABEL='20 ส.ค. 2569';

const rosterNames=['น้องข้าวหอม','น้องภูมิ','น้องขิม','น้องปั้น','น้องมิน','น้องฟ้า','น้องวิน','น้องแก้ม','น้องพอล','น้องณิชา','น้องคุณ','น้องวาฬ','น้องนัท','น้องปาน','น้องป๋อ','น้องพาย','น้องภีม','น้องโมเม','น้องภพ','น้องมายด์','น้องอ๋อง','น้องเอม','น้องต้นกล้า','น้องน้ำใส'];
const initialStatuses=['PRESENT','PRESENT','LEAVE','ABSENT',...Array(19).fill('PRESENT'), 'LEAVE'];

const state={
  leaveRequests:[{id:'L-001',child:'น้องข้าวหอม',type:'ลากิจ',date:NEXT_DAY_LABEL,reason:'มีธุระครอบครัวและแจ้งล่วงหน้า',status:'PENDING'}],
  attendance:rosterNames.map((name,i)=>({id:`S${String(i+1).padStart(2,'0')}`,name,status:initialStatuses[i],time:initialStatuses[i]==='PRESENT'?(i===0?'08:05 น.':`08:${String((i%8)+1).padStart(2,'0')} น.`):'-'})),
  parentHistory:[
    {date:'19 ส.ค. 2569',status:'PRESENT',time:'08:05 น.'},
    {date:'18 ส.ค. 2569',status:'PRESENT',time:'08:02 น.'},
    {date:'17 ส.ค. 2569',status:'PRESENT',time:'08:06 น.'},
    {date:'14 ส.ค. 2569',status:'LEAVE',time:'-'},
    {date:'13 ส.ค. 2569',status:'PRESENT',time:'08:04 น.'}
  ],
  dev:{physical:90,emotional:85,social:88,intellectual:92},
  devNote:'สามารถจับคู่สีและรูปทรงได้ดี รอคิวและแบ่งปันอุปกรณ์กับเพื่อนได้',
  audit:[
    ['10:15','คุณสมชาย','SUBMIT_LEAVE'],
    ['09:05','ครูอรทัย','ATTENDANCE'],
    ['08:30','ผู้บริหาร','VIEW_DASHBOARD'],
    ['08:15','System','AUTH'],
    ['08:00','System','BACKUP_CHECK']
  ],
  announcements:[
    {date:'19 ส.ค. 2569',title:'แจ้งเตรียมอุปกรณ์กิจกรรมศิลปะ',body:'กรุณาเตรียมเสื้อคลุมหรือเสื้อเก่าสำหรับกิจกรรมระบายสี'},
    {date:'18 ส.ค. 2569',title:'แจ้งกำหนดกิจกรรมผู้ปกครองสัมพันธ์',body:'กิจกรรมจัดในวันศุกร์ เวลา 09:00–11:00 น.'}
  ]
};

const $=s=>document.querySelector(s); const $$=s=>[...document.querySelectorAll(s)];
function show(id){$$('.screen').forEach(x=>x.classList.remove('active')); const target=$('#'+id); if(!target)return; target.classList.add('active'); $$('.nav').forEach(x=>x.classList.toggle('active',x.dataset.screen===id)); window.scrollTo({top:0,behavior:'smooth'}); render();}
$$('[data-screen]').forEach(b=>b.onclick=()=>show(b.dataset.screen)); $$('[data-jump]').forEach(b=>b.onclick=()=>show(b.dataset.jump));
function tabs(prefix,dataAttr){$$(`[data-${dataAttr}]`).forEach(b=>b.onclick=()=>openTab(prefix,dataAttr,b.dataset[dataAttr]));}
function openTab(prefix,dataAttr,key){$$(`[data-${dataAttr}]`).forEach(x=>x.classList.toggle('active',x.dataset[dataAttr]===key)); $$(`[id^="${prefix}-"]`).filter(x=>x.classList.contains('panel')).forEach(x=>x.classList.remove('active')); const panel=$(`#${prefix}-${key}`); if(panel)panel.classList.add('active'); render();}
tabs('p','parent'); tabs('t','teacher'); tabs('e','executive');

function statusLabel(s){return s==='APPROVED'?'อนุมัติแล้ว':s==='REJECTED'?'ไม่อนุมัติ':'รออนุมัติ'}
function statusClass(s){return s==='APPROVED'?'approved':s==='REJECTED'?'rejected':'pending'}
function attendanceThai(s){return s==='PRESENT'?'มาเรียน':s==='LEAVE'?'ลา':'ขาด'}
function nowTime(){return new Date().toLocaleTimeString('th-TH',{hour:'2-digit',minute:'2-digit'});}

function renderLeave(){
  $('#p-leave-count').textContent=state.leaveRequests.length;
  const latest=state.leaveRequests[0];
  $('#p-latest').innerHTML=latest?`<div class="request"><div class="request-head"><b>${latest.type} • ${latest.date}</b><span class="status ${statusClass(latest.status)}">${statusLabel(latest.status)}</span></div><p>${latest.reason}</p></div>`:'ไม่มีคำขอ';
  $('#p-history').innerHTML=state.leaveRequests.map(x=>`<div class="request"><div class="request-head"><b>${x.type} • ${x.date}</b><span class="status ${statusClass(x.status)}">${statusLabel(x.status)}</span></div><p>${x.reason}</p></div>`).join('');
  const pending=state.leaveRequests.filter(x=>x.status==='PENDING');
  $('#t-pending').textContent=pending.length; $('#e-pending').textContent=pending.length;
  $('#t-preview').innerHTML=pending.length?pending.map(x=>`<div class="request"><div class="request-head"><b>${x.child} • ${x.type}</b><span class="status pending">รอตรวจสอบ</span></div><p>${x.date} — ${x.reason}</p></div>`).join(''):'<p class="empty-text">ไม่มีคำขอรอตรวจสอบ</p>';
  $('#t-leave-list').innerHTML=state.leaveRequests.map(x=>`<div class="request"><div class="request-head"><b>${x.child} • ${x.type} • ${x.date}</b><span class="status ${statusClass(x.status)}">${statusLabel(x.status)}</span></div><p>${x.reason}</p>${x.status==='PENDING'?`<div class="request-actions"><button class="btn teacher-btn" onclick="approveLeave('${x.id}','APPROVED')">✓ อนุมัติ</button><button class="btn danger-soft" onclick="approveLeave('${x.id}','REJECTED')">ไม่อนุมัติ</button></div>`:''}</div>`).join('');
}
window.approveLeave=(id,status)=>{const r=state.leaveRequests.find(x=>x.id===id); if(!r)return; r.status=status; state.audit.unshift([nowTime(),'ครูอรทัย',status==='APPROVED'?'APPROVE_LEAVE':'REJECT_LEAVE']); toast(status==='APPROVED'?'อนุมัติคำขอเรียบร้อย — ผู้ปกครองเห็นสถานะได้ทันที':'บันทึกผลไม่อนุมัติแล้ว'); render();};
$('#leave-form').onsubmit=e=>{e.preventDefault(); const reason=$('#leave-reason').value.trim(); const dateValue=$('#leave-date').value; if(!dateValue||!reason){toast('กรุณาระบุวันที่ลาและเหตุผลให้ครบ'); return;} const id='L-'+Date.now(); const d=new Date(dateValue+'T00:00:00'); const date=d.toLocaleDateString('th-TH',{day:'numeric',month:'short',year:'numeric'}); state.leaveRequests.unshift({id,child:'น้องข้าวหอม',type:$('#leave-type').value,date,reason,status:'PENDING'}); state.audit.unshift([nowTime(),'คุณสมชาย','SUBMIT_LEAVE']); toast('ส่งคำขอแจ้งลาแล้ว — สถานะ: รอครูอนุมัติ'); render();};

function renderAttendance(){
  $('#p-att-table').innerHTML=state.parentHistory.map(x=>`<tr><td>${x.date}</td><td><span class="attendance-pill ${x.status.toLowerCase()}">${attendanceThai(x.status)}</span></td><td>${x.time}</td></tr>`).join('');
  $('#t-att-list').innerHTML=state.attendance.map(x=>`<div class="attendance-row"><div><b>${x.name}</b><div class="subtle">สถานะปัจจุบัน: ${attendanceThai(x.status)}</div></div><div class="att-actions">${['PRESENT','LEAVE','ABSENT'].map(s=>`<button class="${x.status===s?'active':''}" onclick="setAttendance('${x.id}','${s}')">${s==='PRESENT'?'มา':s==='LEAVE'?'ลา':'ขาด'}</button>`).join('')}</div></div>`).join('');
  const c={PRESENT:0,LEAVE:0,ABSENT:0}; state.attendance.forEach(x=>c[x.status]++); $('#t-present').textContent=c.PRESENT;$('#t-leave-count').textContent=c.LEAVE;$('#t-absent').textContent=c.ABSENT;$('#e-present').textContent=c.PRESENT;$('#att-summary').textContent=`สรุป: มา ${c.PRESENT} • ลา ${c.LEAVE} • ขาด ${c.ABSENT}`;$('#e-rate').textContent=Math.round(c.PRESENT/24*100)+'%';
  const s01=state.attendance[0]; $('#p-status').textContent=attendanceThai(s01.status); $('#p-status-time').textContent=s01.status==='PRESENT'?s01.time:'—';
}
window.setAttendance=(id,status)=>{const r=state.attendance.find(x=>x.id===id); if(!r)return;r.status=status;r.time=status==='PRESENT'?nowTime()+' น.':'-'; if(id==='S01'){state.parentHistory[0]={date:EXAM_DATE_LABEL,status,time:r.time};} state.audit.unshift([nowTime(),'ครูอรทัย',`ATTENDANCE_${status}`]); toast(`บันทึก ${r.name}: ${attendanceThai(status)}`);render();};

function devBars(target){const labels={physical:'ร่างกาย',emotional:'อารมณ์และจิตใจ',social:'สังคม',intellectual:'สติปัญญา'}; $(target).innerHTML=Object.entries(state.dev).map(([k,v])=>`<div class="progress"><div class="progress-head"><b>${labels[k]}</b><span>${v}%</span></div><div class="track"><span style="width:${v}%"></span></div></div>`).join('');}
function renderDev(){devBars('#p-dev-bars');devBars('#e-dev-bars');$('#p-note').textContent=state.devNote;$('#p-dev-note').textContent=state.devNote;$('#dev-inputs').innerHTML=Object.entries(state.dev).map(([k,v])=>`<label>${({physical:'ร่างกาย',emotional:'อารมณ์และจิตใจ',social:'สังคม',intellectual:'สติปัญญา'})[k]}<input type="range" min="0" max="100" value="${v}" data-dev="${k}"> <span>${v}%</span></label>`).join(''); $$('[data-dev]').forEach(r=>r.oninput=()=>r.nextElementSibling.textContent=r.value+'%');}
$('#dev-form').onsubmit=e=>{e.preventDefault();const note=$('#dev-note').value.trim();if(!note){toast('กรุณาระบุบันทึกการสังเกต');return;}$$('[data-dev]').forEach(r=>state.dev[r.dataset.dev]=Number(r.value));state.devNote=note;state.audit.unshift([nowTime(),'ครูอรทัย','UPDATE_DEVELOPMENT']);toast('บันทึกพัฒนาการแล้ว — ผู้ปกครองและผู้บริหารเห็นข้อมูลล่าสุด');render();};

function renderNews(){const news=$('#p-news-list'); if(news)news.innerHTML=state.announcements.map(n=>`<article class="news-item"><span>${n.date}</span><div><b>${n.title}</b><p>${n.body}</p></div></article>`).join('');}
$('#announcement-form').onsubmit=e=>{e.preventDefault();const title=$('#announcement-title').value.trim();const body=$('#announcement-body').value.trim();if(!title||!body){toast('กรุณากรอกหัวข้อและรายละเอียดประกาศ');return;}state.announcements.unshift({date:EXAM_DATE_LABEL,title,body});state.audit.unshift([nowTime(),'ครูอรทัย','PUBLISH_ANNOUNCEMENT']);toast('เผยแพร่ประกาศตัวอย่างแล้ว');renderNews();};

function renderAudit(){$('#audit').innerHTML=state.audit.slice(0,10).map(x=>`<tr><td>${x[0]}</td><td>${x[1]}</td><td><code>${x[2]}</code></td></tr>`).join('');$('#e-audit-count').textContent=state.audit.length;}

$('#report-form').onsubmit=e=>{e.preventDefault();const type=$('#report-type').value;const c={PRESENT:0,LEAVE:0,ABSENT:0};state.attendance.forEach(x=>c[x.status]++);const pending=state.leaveRequests.filter(x=>x.status==='PENDING').length;const approved=state.leaveRequests.filter(x=>x.status==='APPROVED').length;const preview=$('#report-preview'); if(type==='การเข้าเรียน'){preview.innerHTML=`<div class="report-card"><b>รายงานการเข้าเรียน — ${EXAM_DATE_LABEL}</b><div class="report-metrics"><span><strong>${c.PRESENT}</strong> มาเรียน</span><span><strong>${c.LEAVE}</strong> ลา</span><span><strong>${c.ABSENT}</strong> ขาด</span><span><strong>${Math.round(c.PRESENT/24*100)}%</strong> อัตรามาเรียน</span></div><p>ตัวอย่าง Preview สำหรับการสอบ — Production สามารถส่งออก PDF/CSV ตามสิทธิ์ได้</p></div>`;}else if(type==='คำขอแจ้งลา'){preview.innerHTML=`<div class="report-card"><b>รายงานคำขอแจ้งลา</b><div class="report-metrics"><span><strong>${state.leaveRequests.length}</strong> ทั้งหมด</span><span><strong>${pending}</strong> รออนุมัติ</span><span><strong>${approved}</strong> อนุมัติแล้ว</span></div></div>`;}else{const avg=Math.round(Object.values(state.dev).reduce((a,b)=>a+b,0)/4);preview.innerHTML=`<div class="report-card"><b>ภาพรวมพัฒนาการ 4 ด้าน</b><div class="report-metrics"><span><strong>${avg}%</strong> ค่าเฉลี่ยตัวอย่าง</span></div><p>ใช้แสดงแนวโน้มจากบันทึกกิจกรรม ไม่ใช่การวินิจฉัยทางการแพทย์</p></div>`;}state.audit.unshift([nowTime(),'ผู้บริหาร','GENERATE_REPORT']);renderAudit();};

function render(){renderLeave();renderAttendance();renderDev();renderNews();renderAudit();}
function toast(msg){const t=$('#toast');t.textContent=msg;t.style.display='block';clearTimeout(window.__toastTimer);window.__toastTimer=setTimeout(()=>t.style.display='none',2200)}
$('#reset').onclick=()=>location.reload();

const guideSteps=[
  {screen:'asis',sub:null,label:'1/11',title:'เริ่มจากปัญหาเดิม',text:'ชี้ให้เห็นข้อมูลกระจัดกระจาย งานซ้ำ และการติดตามสถานะที่ยาก'},
  {screen:'objectives',sub:null,label:'2/11',title:'เชื่อมกับวัตถุประสงค์',text:'อธิบายว่า 3 บทบาทและการประเมินผลตรงกับวัตถุประสงค์วิจัย'},
  {screen:'parent',sub:['p','parent','leave'],label:'3/11',title:'ผู้ปกครองส่งคำขอ',text:'กรอกวันที่ 20 ส.ค. และกดส่งคำขอแจ้งลา'},
  {screen:'teacher',sub:['t','teacher','leave'],label:'4/11',title:'ครูตรวจสอบและอนุมัติ',text:'คำขอเดียวกันปรากฏในฝั่งครู กดอนุมัติเพื่อเปลี่ยนสถานะ'},
  {screen:'parent',sub:['p','parent','leave'],label:'5/11',title:'ผู้ปกครองเห็นผลทันที',text:'ชี้สถานะ “อนุมัติแล้ว” และอธิบายว่าตรวจสอบย้อนหลังได้'},
  {screen:'teacher',sub:['t','teacher','attendance'],label:'6/11',title:'เช็กชื่อรายวัน',text:'เปลี่ยนสถานะเด็ก 1 คน แล้วชี้ให้เห็นตัวเลขสรุปที่อัปเดต'},
  {screen:'teacher',sub:['t','teacher','dev'],label:'7/11',title:'บันทึกพัฒนาการ',text:'ย้ำว่าเป็นการติดตามจากกิจกรรม ไม่ใช่เครื่องมือวินิจฉัยทางการแพทย์'},
  {screen:'teacher',sub:['t','teacher','activity'],label:'8/11',title:'กิจกรรมและข่าวสาร',text:'แสดงการบันทึกกิจกรรมและการเผยแพร่ประกาศไปยังผู้ปกครอง'},
  {screen:'executive',sub:['e','executive','dashboard'],label:'9/11',title:'Dashboard ผู้บริหาร',text:'ชี้ให้เห็นข้อมูลสรุปจากงานประจำวัน โดยไม่ต้องรวบรวมไฟล์ใหม่'},
  {screen:'executive',sub:['e','executive','reports'],label:'10/11',title:'รายงานตามช่วงเวลา',text:'สร้าง Preview รายงานเพื่ออธิบายการนำข้อมูลกลางไปใช้ต่อ'},
  {screen:'privacy',sub:null,label:'11/11',title:'ปิดด้วย Privacy และ KPI',text:'อธิบาย RBAC แล้วกดเมนู KPI เพื่อสรุปเกณฑ์ความสำเร็จ'}
]; let gi=0;
function showGuide(){const s=guideSteps[gi];show(s.screen);if(s.sub)openTab(...s.sub);$('#guide-step').textContent=s.label;$('#guide-title').textContent=s.title;$('#guide-text').textContent=s.text;$('#guide').classList.add('active');$('#guide-prev').disabled=gi===0;$('#guide-next').textContent=gi===guideSteps.length-1?'จบ Demo ✓':'ถัดไป →';}
$('#guided').onclick=()=>{gi=0;showGuide()};$('#guide-next').onclick=()=>{if(gi<guideSteps.length-1){gi++;showGuide()}else{$('#guide').classList.remove('active');show('kpi')}};$('#guide-prev').onclick=()=>{if(gi>0){gi--;showGuide()}};$('#guide-close').onclick=()=>$('#guide').classList.remove('active');

document.addEventListener('keydown',e=>{if(!$('#guide').classList.contains('active'))return;if(e.key==='ArrowRight')$('#guide-next').click();if(e.key==='ArrowLeft')$('#guide-prev').click();if(e.key==='Escape')$('#guide-close').click();});

render();