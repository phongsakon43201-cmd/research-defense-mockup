const state={
  leaveRequests:[{id:'L-001',child:'น้องข้าวหอม',type:'ลาป่วย',date:'18 ส.ค. 2569',reason:'มีไข้และต้องพักรักษาตัวที่บ้าน',status:'PENDING'}],
  attendance:[
    {id:'S01',name:'น้องข้าวหอม',status:'PRESENT',time:'08:05 น.'},
    {id:'S02',name:'น้องภูมิ',status:'PRESENT',time:'08:01 น.'},
    {id:'S03',name:'น้องขิม',status:'LEAVE',time:'-'},
    {id:'S04',name:'น้องปั้น',status:'ABSENT',time:'-'},
    {id:'S05',name:'น้องมิน',status:'PRESENT',time:'08:03 น.'},
    {id:'S06',name:'น้องฟ้า',status:'PRESENT',time:'07:58 น.'}
  ],
  dev:{physical:90,emotional:85,social:88,intellectual:92},
  devNote:'สามารถจับคู่สีและรูปทรงได้ดี รอคิวและแบ่งปันอุปกรณ์กับเพื่อนได้',
  audit:[
    ['10:15','คุณสมชาย','SUBMIT_LEAVE'],
    ['09:05','ครูอรทัย','ATTENDANCE'],
    ['08:30','ผู้บริหาร','VIEW_DASHBOARD'],
    ['08:15','System','AUTH'],
    ['08:00','System','BACKUP_CHECK']
  ]
};

const $=s=>document.querySelector(s); const $$=s=>[...document.querySelectorAll(s)];
function show(id){$$('.screen').forEach(x=>x.classList.remove('active')); $('#'+id).classList.add('active'); $$('.nav').forEach(x=>x.classList.toggle('active',x.dataset.screen===id)); window.scrollTo({top:0,behavior:'smooth'}); render();}
$$('[data-screen]').forEach(b=>b.onclick=()=>show(b.dataset.screen)); $$('[data-jump]').forEach(b=>b.onclick=()=>show(b.dataset.jump));
function tabs(prefix,dataAttr){$$(`[data-${dataAttr}]`).forEach(b=>b.onclick=()=>{const key=b.dataset[dataAttr]; $$(`[data-${dataAttr}]`).forEach(x=>x.classList.remove('active')); b.classList.add('active'); $$(`[id^="${prefix}-"]`).forEach(x=>x.classList.remove('active')); $(`#${prefix}-${key}`).classList.add('active'); render();});}
tabs('p','parent'); tabs('t','teacher');
function statusLabel(s){return s==='APPROVED'?'อนุมัติแล้ว':s==='REJECTED'?'ไม่อนุมัติ':'รออนุมัติ'}
function statusClass(s){return s==='APPROVED'?'approved':s==='REJECTED'?'rejected':'pending'}
function renderLeave(){
  $('#p-leave-count').textContent=state.leaveRequests.length;
  const latest=state.leaveRequests[0];
  $('#p-latest').innerHTML=latest?`<div class="request"><div class="request-head"><b>${latest.type} • ${latest.date}</b><span class="status ${statusClass(latest.status)}">${statusLabel(latest.status)}</span></div><p>${latest.reason}</p></div>`:'ไม่มีคำขอ';
  $('#p-history').innerHTML=state.leaveRequests.map(x=>`<div class="request"><div class="request-head"><b>${x.type} • ${x.date}</b><span class="status ${statusClass(x.status)}">${statusLabel(x.status)}</span></div><p>${x.reason}</p></div>`).join('');
  const pending=state.leaveRequests.filter(x=>x.status==='PENDING');
  $('#t-pending').textContent=pending.length; $('#e-pending').textContent=pending.length;
  $('#t-preview').innerHTML=pending.length?pending.map(x=>`<div class="request"><div class="request-head"><b>${x.child} • ${x.type}</b><span class="status pending">รอตรวจสอบ</span></div><p>${x.date} — ${x.reason}</p></div>`).join(''):'<p>ไม่มีคำขอรอตรวจสอบ</p>';
  $('#t-leave-list').innerHTML=state.leaveRequests.map(x=>`<div class="request"><div class="request-head"><b>${x.child} • ${x.type} • ${x.date}</b><span class="status ${statusClass(x.status)}">${statusLabel(x.status)}</span></div><p>${x.reason}</p>${x.status==='PENDING'?`<button class="btn teacher-btn" onclick="approveLeave('${x.id}','APPROVED')">อนุมัติ</button> <button class="btn ghost" onclick="approveLeave('${x.id}','REJECTED')">ไม่อนุมัติ</button>`:''}</div>`).join('');
}
window.approveLeave=(id,status)=>{const r=state.leaveRequests.find(x=>x.id===id); if(!r)return; r.status=status; if(status==='APPROVED'){const a=state.attendance.find(x=>x.id==='S01');a.status='LEAVE';a.time='-';} state.audit.unshift([new Date().toLocaleTimeString('th-TH',{hour:'2-digit',minute:'2-digit'}),'ครูอรทัย',status==='APPROVED'?'APPROVE_LEAVE':'REJECT_LEAVE']); toast(status==='APPROVED'?'อนุมัติคำขอแล้ว':'ไม่อนุมัติคำขอแล้ว'); render();};
$('#leave-form').onsubmit=e=>{e.preventDefault(); const id='L-'+Date.now(); const d=new Date($('#leave-date').value); const date=isNaN(d)?'18 ส.ค. 2569':d.toLocaleDateString('th-TH',{day:'numeric',month:'short',year:'numeric'}); state.leaveRequests.unshift({id,child:'น้องข้าวหอม',type:$('#leave-type').value,date,reason:$('#leave-reason').value,status:'PENDING'}); state.audit.unshift([new Date().toLocaleTimeString('th-TH',{hour:'2-digit',minute:'2-digit'}),'คุณสมชาย','SUBMIT_LEAVE']); toast('ส่งคำขอแจ้งลาแล้ว'); render();};
function renderAttendance(){
  $('#p-att-table').innerHTML=state.attendance.slice(0,5).map(x=>`<tr><td>17 ส.ค. 2569</td><td>${x.status==='PRESENT'?'มาเรียน':x.status==='LEAVE'?'ลา':'ขาด'}</td><td>${x.time}</td></tr>`).join('');
  $('#t-att-list').innerHTML=state.attendance.map(x=>`<div class="attendance-row"><div><b>${x.name}</b><div style="color:#6b7280;font-size:13px">สถานะปัจจุบัน: ${x.status}</div></div><div class="att-actions">${['PRESENT','LEAVE','ABSENT'].map(s=>`<button class="${x.status===s?'active':''}" onclick="setAttendance('${x.id}','${s}')">${s==='PRESENT'?'มา':s==='LEAVE'?'ลา':'ขาด'}</button>`).join('')}</div></div>`).join('');
  const c={PRESENT:0,LEAVE:0,ABSENT:0}; state.attendance.forEach(x=>c[x.status]++); const extra=24-state.attendance.length; const present=21+(c.PRESENT-4); const leave=2+(c.LEAVE-1); const absent=1+(c.ABSENT-1); $('#t-present').textContent=present;$('#t-leave').textContent=leave;$('#t-absent').textContent=absent;$('#e-present').textContent=present;$('#att-summary').textContent=`สรุป: มา ${present} • ลา ${leave} • ขาด ${absent}`;$('#e-rate').textContent=Math.round(present/24*100)+'%';
  const s01=state.attendance.find(x=>x.id==='S01'); $('#p-status').textContent=s01.status==='PRESENT'?'มาเรียน':s01.status==='LEAVE'?'ลา':'ขาด';
}
window.setAttendance=(id,status)=>{const r=state.attendance.find(x=>x.id===id);r.status=status;r.time=status==='PRESENT'?new Date().toLocaleTimeString('th-TH',{hour:'2-digit',minute:'2-digit'})+' น.':'-';state.audit.unshift([new Date().toLocaleTimeString('th-TH',{hour:'2-digit',minute:'2-digit'}),'ครูอรทัย','ATTENDANCE']);render();};
function devBars(target){const labels={physical:'ร่างกาย',emotional:'อารมณ์และจิตใจ',social:'สังคม',intellectual:'สติปัญญา'}; $(target).innerHTML=Object.entries(state.dev).map(([k,v])=>`<div class="progress"><div class="progress-head"><b>${labels[k]}</b><span>${v}%</span></div><div class="track"><span style="width:${v}%"></span></div></div>`).join('');}
function renderDev(){devBars('#p-dev-bars');devBars('#e-dev-bars');$('#p-note').textContent=state.devNote;$('#p-dev-note').textContent=state.devNote;$('#dev-inputs').innerHTML=Object.entries(state.dev).map(([k,v])=>`<label>${k}<input type="range" min="0" max="100" value="${v}" data-dev="${k}"> <span>${v}%</span></label>`).join(''); $$('[data-dev]').forEach(r=>r.oninput=()=>r.nextElementSibling.textContent=r.value+'%');}
$('#dev-form').onsubmit=e=>{e.preventDefault();$$('[data-dev]').forEach(r=>state.dev[r.dataset.dev]=Number(r.value));state.devNote=$('#dev-note').value;state.audit.unshift([new Date().toLocaleTimeString('th-TH',{hour:'2-digit',minute:'2-digit'}),'ครูอรทัย','UPDATE_DEVELOPMENT']);toast('บันทึกพัฒนาการแล้ว');render();};
function renderAudit(){$('#audit').innerHTML=state.audit.slice(0,8).map(x=>`<tr><td>${x[0]}</td><td>${x[1]}</td><td>${x[2]}</td></tr>`).join('');$('#e-audit').textContent=state.audit.length;}
function render(){renderLeave();renderAttendance();renderDev();renderAudit();}
function toast(msg){const t=$('#toast');t.textContent=msg;t.style.display='block';setTimeout(()=>t.style.display='none',1800)}
$('#reset').onclick=()=>location.reload();
const guideSteps=[
  ['asis','1/9','เริ่มจากปัญหาเดิม','ชี้ให้เห็นข้อมูลกระจัดกระจาย งานซ้ำ และการติดตามสถานะที่ยาก'],
  ['objectives','2/9','เชื่อมกับวัตถุประสงค์','อธิบายว่า 3 บทบาทและการประเมินผลตรงกับวัตถุประสงค์วิจัย'],
  ['parent','3/9','มุมมองผู้ปกครอง','เปิดแท็บคำขอแจ้งลา แล้วส่งคำขอใหม่'],
  ['teacher','4/9','มุมมองครู','เปิดแท็บอนุมัติการลา แล้วกดอนุมัติคำขอ'],
  ['parent','5/9','กลับมาที่ผู้ปกครอง','แสดงว่าสถานะเปลี่ยนและตรวจสอบย้อนหลังได้'],
  ['teacher','6/9','งานประจำวันของครู','แสดงการเช็กชื่อและบันทึกพัฒนาการ'],
  ['executive','7/9','Dashboard ผู้บริหาร','ชี้ให้เห็นข้อมูลที่ถูกสรุปจากงานประจำวัน'],
  ['privacy','8/9','Privacy by Design','อธิบาย RBAC, Least Privilege และ Audit Log'],
  ['kpi','9/9','ปิดด้วย KPI','ย้ำว่างานมีเกณฑ์วัดผล ไม่ได้จบเพียงสร้างเว็บสำเร็จ']
]; let gi=0;
function showGuide(){const s=guideSteps[gi];show(s[0]);$('#guide-step').textContent=s[1];$('#guide-title').textContent=s[2];$('#guide-text').textContent=s[3];$('#guide').classList.add('active');}
$('#guided').onclick=()=>{gi=0;showGuide()};$('#guide-next').onclick=()=>{if(gi<guideSteps.length-1){gi++;showGuide()}else{$('#guide').classList.remove('active')}};$('#guide-prev').onclick=()=>{if(gi>0){gi--;showGuide()}};$('#guide-close').onclick=()=>$('#guide').classList.remove('active');
render();