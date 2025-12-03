// وظائف موقع دليل الأطباء - script.js

function toggleMenu(){
  const m=document.getElementById('menu');
  if(!m) return;
  m.style.display = (m.style.display==='flex') ? 'none' : 'flex';
}

// توليد خيارات الفلاتر من البيانات
function populateFilters(){
  const spSet = new Set();
  const hSet = new Set();
  doctors.forEach(d=>{spSet.add(d.specialty); hSet.add(d.hospital);} );

  const sSel = document.getElementById('filterSpecialty');
  const hSel = document.getElementById('filterHospital');
  if(sSel){
    spSet.forEach(s=>{ const o=document.createElement('option'); o.value=s; o.textContent=s; sSel.appendChild(o); });
  }
  if(hSel){
    hSet.forEach(h=>{ const o=document.createElement('option'); o.value=h; o.textContent=h; hSel.appendChild(o); });
  }
}

// بناء بطاقة واحد
function buildCard(d){
  return `<div class="card">
     <h3>${d.name}</h3>
     <p><strong>التخصص:</strong> ${d.specialty}</p>
     <p><strong>المستشفى:</strong> ${d.hospital}</p>
     <p><strong>الدوام:</strong> ${d.time}</p>
     <div style="margin-top:10px"><a class="btn" href="doctor.html?id=${d.id}">عرض الملف</a> <a class="btn" href="https://wa.me/967${d.phone}">واتساب</a></div>
  </div>`;
}

// تحميل البطاقات وفق الفلاتر والبحث
function loadCardsFiltered(){
  const q = (document.getElementById('searchInput')?document.getElementById('searchInput').value.trim().toLowerCase():'').replace(/\s+/g,'');
  const spec = document.getElementById('filterSpecialty')?document.getElementById('filterSpecialty').value:'';
  const hosp = document.getElementById('filterHospital')?document.getElementById('filterHospital').value:'';
  const container = document.getElementById('cards');
  if(!container) return;
  container.innerHTML='';
  const result = doctors.filter(d=>{
    const matchQ = (d.name + d.specialty + d.hospital).toLowerCase().replace(/\s+/g,'').includes(q);
    const matchSpec = spec? d.specialty===spec : true;
    const matchHosp = hosp? d.hospital===hosp : true;
    return matchQ && matchSpec && matchHosp;
  });
  if(result.length===0){ document.getElementById('noresult').style.display='block'; return; } else { document.getElementById('noresult').style.display='none'; }
  result.forEach(d=> container.innerHTML+= buildCard(d) );
}

// صفحة الملف: عرض تفاصيل طبيب
function renderProfile(d){
  const el = document.getElementById('profile');
  if(!el) return;
  el.innerHTML = `<div class="profile-card">
    <h2>${d.name}</h2>
    <p><strong>التخصص:</strong> ${d.specialty}</p>
    <p><strong>المستشفى:</strong> ${d.hospital}</p>
    <p><strong>الدوام:</strong> ${d.time}</p>
    <p><strong>الهاتف:</strong> ${d.phone}</p>
    <p>${d.bio}</p>
    <div style="margin-top:12px"><a class="btn" href="https://wa.me/967${d.phone}">اتصل عبر واتساب</a></div>
  </div>`;
}

// تهيئة الصفحة عند التحميل
window.addEventListener('DOMContentLoaded', ()=>{
  populateFilters();
  if(document.getElementById('cards')){
    const q = localStorage.getItem('searchQuery');
    if(q){ document.getElementById('searchInput').value = q; localStorage.removeItem('searchQuery'); }
    loadCardsFiltered();
    ['searchInput','filterSpecialty','filterHospital'].forEach(id=>{
      const el = document.getElementById(id);
      if(el) el.addEventListener('input', ()=> loadCardsFiltered());
    });
  }
});
