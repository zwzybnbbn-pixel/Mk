// dashboard.js
import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

/* -----------------------------
   عناصرDOM
   ----------------------------- */
const btnHome = document.getElementById("btnHome");
const btnDoctors = document.getElementById("btnDoctors");
const btnHospitals = document.getElementById("btnHospitals");

const homeView = document.getElementById("homeView");
const doctorsView = document.getElementById("doctorsView");
const hospitalsView = document.getElementById("hospitalsView");

const addDoctorBtn = document.getElementById("addDoctorBtn");
const addHospitalBtn = document.getElementById("addHospitalBtn");

const doctorsTbody = document.getElementById("doctorsTbody");
const hospitalsTbody = document.getElementById("hospitalsTbody");

const pageTitle = document.getElementById("pageTitle");
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalForm = document.getElementById("modalForm");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");
const toast = document.getElementById("toast");

const doctorsCountEl = document.getElementById("doctorsCount");
const hospitalsCountEl = document.getElementById("hospitalsCount");

const searchDoctors = document.getElementById("searchDoctors");
const searchHospitals = document.getElementById("searchHospitals");

/* -----------------------------
   حالة التحرير
   ----------------------------- */
let editing = null; // {type: 'doctor'|'hospital', id: 'docId'} or null

/* -----------------------------
   حماية الصفحة — تأكد تسجيل الدخول
   ----------------------------- */
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html"; // عدّل إن أردت التجريب بدون لوجين
  } else {
    // عرض الصفحة الرئيسية افتراضياً
    showView("home");
    updateCounts();
  }
});

/* -----------------------------
   وظائف واجهة العرض (Navigation)
   ----------------------------- */
function clearActive() {
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
  addDoctorBtn.classList.add("hidden");
  addHospitalBtn.classList.add("hidden");
}
function showView(view) {
  clearActive();
  homeView.classList.add("hidden");
  doctorsView.classList.add("hidden");
  hospitalsView.classList.add("hidden");

  if (view === "home") {
    pageTitle.textContent = "الرئيسية";
    btnHome.classList.add("active");
    homeView.classList.remove("hidden");
  } else if (view === "doctors") {
    pageTitle.textContent = "قائمة الأطباء";
    btnDoctors.classList.add("active");
    doctorsView.classList.remove("hidden");
    addDoctorBtn.classList.remove("hidden");
    loadDoctors();
  } else if (view === "hospitals") {
    pageTitle.textContent = "قائمة المستشفيات";
    btnHospitals.classList.add("active");
    hospitalsView.classList.remove("hidden");
    addHospitalBtn.classList.remove("hidden");
    loadHospitals();
  }
}

btnHome.addEventListener("click", () => showView("home"));
btnDoctors.addEventListener("click", () => showView("doctors"));
btnHospitals.addEventListener("click", () => showView("hospitals"));

/* -----------------------------
   Logout
   ----------------------------- */
document.getElementById("logout").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "login.html";
});

/* -----------------------------
   Toast
   ----------------------------- */
function showToast(text, ms=2000) {
  toast.textContent = text;
  toast.classList.remove("hidden");
  setTimeout(()=> toast.classList.add("hidden"), ms);
}

/* -----------------------------
   العدادات
   ----------------------------- */
async function updateCounts() {
  const doctorsSnap = await getDocs(collection(db, "doctors"));
  doctorsCountEl.textContent = doctorsSnap.size;

  const hospitalsSnap = await getDocs(collection(db, "hospitals"));
  hospitalsCountEl.textContent = hospitalsSnap.size;
}

/* -----------------------------
   تحميل الأطباء
   ----------------------------- */
export async function loadDoctors() {
  doctorsTbody.innerHTML = `<tr><td colspan="7">جارِ التحميل...</td></tr>`;
  const snap = await getDocs(collection(db, "doctors"));

  if (snap.empty) {
    doctorsTbody.innerHTML = `<tr><td colspan="7">لا يوجد أطباء</td></tr>`;
    updateCounts();
    return;
  }

  let html = "";
  snap.forEach(docu => {
    const d = docu.data();
    const id = docu.id;

    // جدول دوام منظم - يومي
    const days = ["saturday","sunday","monday","tuesday","wednesday","thursday","friday"];
    let scheduleHtml = '<div class="schedule-list">';
    for (const day of days) {
      const t = d.schedule && d.schedule[day] && d.schedule[day].time ? d.schedule[day].time : '-';
      // اسم اليوم بالعربي
      const mapDay = {
        saturday:"السبت", sunday:"الأحد", monday:"الاثنين",
        tuesday:"الثلاثاء", wednesday:"الأربعاء", thursday:"الخميس", friday:"الجمعة"
      };
      scheduleHtml += `<div class="schedule-item"><strong>${mapDay[day]}:</strong> ${t}</div>`;
    }
    scheduleHtml += '</div>';

    html += `
      <tr>
        <td><img src="${escapeHtml(d.img||'') || 'https://via.placeholder.com/48'}" alt=""></td>
        <td>${escapeHtml(d.name||'—')}</td>
        <td>${escapeHtml(d.specialty||'—')}</td>
        <td>${escapeHtml(d.hospital||'—')}</td>
        <td>${scheduleHtml}</td>
        <td>${escapeHtml(d.phone||'—')}</td>
        <td>
          <button class="btn btn-edit" data-id="${id}" data-type="edit-doctor">تعديل</button>
          <button class="btn btn-delete" data-id="${id}" data-type="del-doctor">حذف</button>
        </td>
      </tr>
    `;
  });

  doctorsTbody.innerHTML = html;
  updateCounts();
}

/* -----------------------------
   تحميل المستشفيات
   ----------------------------- */
export async function loadHospitals() {
  hospitalsTbody.innerHTML = `<tr><td colspan="7">جارِ التحميل...</td></tr>`;
  const snap = await getDocs(collection(db, "hospitals"));

  if (snap.empty) {
    hospitalsTbody.innerHTML = `<tr><td colspan="7">لا يوجد مستشفيات</td></tr>`;
    updateCounts();
    return;
  }

  let html = "";
  snap.forEach(docu => {
    const h = docu.data();
    const id = docu.id;

    // أقسام مفصّلة (تعرض كسطر طويل)
    const dept = h.department ? escapeHtml(h.department) : '-';
    const mapLink = h.map ? `<a target="_blank" href="${escapeHtml(h.map)}">خريطة</a>` : '-';

    html += `
      <tr>
        <td><img src="${escapeHtml(h.img||'') || 'https://via.placeholder.com/48'}" alt=""></td>
        <td>${escapeHtml(h.name||'—')}</td>
        <td>${escapeHtml(h.city||'—')}</td>
        <td style="max-width:300px">${dept}</td>
        <td>${escapeHtml(h.phone||'—')}</td>
        <td>${mapLink}</td>
        <td>
          <button class="btn btn-edit" data-id="${id}" data-type="edit-hospital">تعديل</button>
          <button class="btn btn-delete" data-id="${id}" data-type="del-hospital">حذف</button>
        </td>
      </tr>
    `;
  });

  hospitalsTbody.innerHTML = html;
  updateCounts();
}

/* -----------------------------
   مساعدة: هروب النص قبل الإدراج في HTML
   ----------------------------- */
function escapeHtml(s) {
  if (!s && s !== 0) return '';
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

/* -----------------------------
   الاستماع لأزرار الجدول (تفويض أحداث)
   ----------------------------- */
document.addEventListener("click", async (e) => {
  const target = e.target;
  if (target.dataset && target.dataset.type) {
    const id = target.dataset.id;
    const type = target.dataset.type;

    if (type === 'del-doctor') {
      if (!confirm("هل تريد حذف هذا الطبيب؟")) return;
      await deleteDoc(doc(db, "doctors", id));
      showToast("تم حذف الطبيب");
      loadDoctors();
    }

    if (type === 'del-hospital') {
      if (!confirm("هل تريد حذف هذه المستشفى؟")) return;
      await deleteDoc(doc(db, "hospitals", id));
      showToast("تم حذف المستشفى");
      loadHospitals();
    }

    if (type === 'edit-doctor') {
      openDoctorModal(id);
    }

    if (type === 'edit-hospital') {
      openHospitalModal(id);
    }
  }
});

/* -----------------------------
   إضافة: أزرار الإضافة تفتح مودال
   ----------------------------- */
addDoctorBtn.addEventListener("click", ()=> openDoctorModal(null));
addHospitalBtn.addEventListener("click", ()=> openHospitalModal(null));

/* -----------------------------
   فتح مودال إضافة/تعديل دكتور
   ----------------------------- */
async function openDoctorModal(id=null) {
  editing = id ? {type:'doctor', id} : {type:'doctor', id:null};
  modalTitle.textContent = id ? "تعديل بيانات الطبيب" : "إضافة طبيب";

  // إذا تعديل → جلب البيانات
  let docData = {};
  if (id) {
    const snap = await getDoc(doc(db, "doctors", id));
    if (snap.exists()) docData = snap.data();
  }

  // حقول: صورة URL، اسم، تخصص، مستشفى، هاتف، جدول أيام (7 inputs)
  modalForm.innerHTML = `
    <label class="full">رابط صورة الطبيب (URL)</label>
    <input class="full" name="img" placeholder="https://..." value="${escapeHtml(docData.img||'')}"/>

    <label>الاسم</label>
    <input name="name" required value="${escapeHtml(docData.name||'')}" />

    <label>التخصص</label>
    <input name="specialty" value="${escapeHtml(docData.specialty||'')}" />

    <label>المستشفى</label>
    <input name="hospital" value="${escapeHtml(docData.hospital||'')}" />

    <label>الهاتف</label>
    <input name="phone" value="${escapeHtml(docData.phone||'')}" />

    <div class="full"></div>
    <label class="full">دوام الطبيب (املأ وقت كل يوم)</label>

    <label>السبت</label><input name="sat" value="${escapeHtml((docData.schedule && docData.schedule.saturday && docData.schedule.saturday.time) || '')}" />
    <label>الأحد</label><input name="sun" value="${escapeHtml((docData.schedule && docData.schedule.sunday && docData.schedule.sunday.time) || '')}" />
    <label>الاثنين</label><input name="mon" value="${escapeHtml((docData.schedule && docData.schedule.monday && docData.schedule.monday.time) || '')}" />
    <label>الثلاثاء</label><input name="tue" value="${escapeHtml((docData.schedule && docData.schedule.tuesday && docData.schedule.tuesday.time) || '')}" />
    <label>الأربعاء</label><input name="wed" value="${escapeHtml((docData.schedule && docData.schedule.wednesday && docData.schedule.wednesday.time) || '')}" />
    <label>الخميس</label><input name="thu" value="${escapeHtml((docData.schedule && docData.schedule.thursday && docData.schedule.thursday.time) || '')}" />
    <label>الجمعة</label><input name="fri" value="${escapeHtml((docData.schedule && docData.schedule.friday && docData.schedule.friday.time) || '')}" />
  `;

  modal.classList.remove("hidden");
}

/* -----------------------------
   فتح مودال إضافة/تعديل مستشفى
   ----------------------------- */
async function openHospitalModal(id=null) {
  editing = id ? {type:'hospital', id} : {type:'hospital', id:null};
  modalTitle.textContent = id ? "تعديل بيانات المستشفى" : "إضافة مستشفى";

  let docData = {};
  if (id) {
    const snap = await getDoc(doc(db, "hospitals", id));
    if (snap.exists()) docData = snap.data();
  }

  modalForm.innerHTML = `
    <label class="full">رابط صورة المستشفى (URL)</label>
    <input class="full" name="img" placeholder="https://..." value="${escapeHtml(docData.img||'')}" />

    <label>الاسم</label>
    <input name="name" required value="${escapeHtml(docData.name||'')}" />

    <label>المدينة</label>
    <input name="city" value="${escapeHtml(docData.city||'')}" />

    <label>الهاتف</label>
    <input name="phone" value="${escapeHtml(docData.phone||'')}" />

    <label class="full">الأقسام (افصل بين الأقسام بشرطة أو فاصلة)</label>
    <input class="full" name="department" value="${escapeHtml(docData.department||'')}" />

    <label class="full">وصف</label>
    <textarea class="full" name="description" rows="3">${escapeHtml(docData.description||'')}</textarea>

    <label class="full">رابط الخريطة</label>
    <input class="full" name="map" value="${escapeHtml(docData.map||'')}" />
  `;

  modal.classList.remove("hidden");
}

/* -----------------------------
   إغلاق المودال
   ----------------------------- */
cancelBtn.addEventListener("click", (ev) => {
  ev.preventDefault();
  modal.classList.add("hidden");
  editing = null;
});

/* -----------------------------
   حفظ (إضافة / تعديل)
   ----------------------------- */
saveBtn.addEventListener("click", async (ev) => {
  ev.preventDefault();
  const form = new FormData(modalForm);
  if (!editing) {
    showToast("حالة غير معروفة");
    return;
  }

  if (editing.type === 'doctor') {
    const payload = {
      img: form.get('img') || '',
      name: form.get('name') || '',
      specialty: form.get('specialty') || '',
      hospital: form.get('hospital') || '',
      phone: form.get('phone') || '',
      schedule: {
        saturday: { time: form.get('sat') || '' },
        sunday: { time: form.get('sun') || '' },
        monday: { time: form.get('mon') || '' },
        tuesday: { time: form.get('tue') || '' },
        wednesday: { time: form.get('wed') || '' },
        thursday: { time: form.get('thu') || '' },
        friday: { time: form.get('fri') || '' }
      }
    };

    if (editing.id) {
      await updateDoc(doc(db, "doctors", editing.id), payload);
      showToast("تم تعديل بيانات الطبيب");
    } else {
      await addDoc(collection(db, "doctors"), payload);
      showToast("تم إضافة الطبيب");
    }
    modal.classList.add("hidden");
    loadDoctors();
  }

  if (editing.type === 'hospital') {
    const payload = {
      img: form.get('img') || '',
      name: form.get('name') || '',
      city: form.get('city') || '',
      phone: form.get('phone') || '',
      department: form.get('department') || '',
      description: form.get('description') || '',
      map: form.get('map') || ''
    };

    if (editing.id) {
      await updateDoc(doc(db, "hospitals", editing.id), payload);
      showToast("تم تعديل بيانات المستشفى");
    } else {
      await addDoc(collection(db, "hospitals"), payload);
      showToast("تم إضافة المستشفى");
    }
    modal.classList.add("hidden");
    loadHospitals();
  }

  editing = null;
  updateCounts();
});

/* -----------------------------
   بحث في الجداول (فلترة محلياً)
   ----------------------------- */
searchDoctors?.addEventListener("input", () => {
  const q = searchDoctors.value.trim().toLowerCase();
  document.querySelectorAll("#doctorsTbody tr").forEach(tr=>{
    tr.style.display = tr.innerText.toLowerCase().includes(q) ? "" : "none";
  });
});
searchHospitals?.addEventListener("input", () => {
  const q = searchHospitals.value.trim().toLowerCase();
  document.querySelectorAll("#hospitalsTbody tr").forEach(tr=>{
    tr.style.display = tr.innerText.toLowerCase().includes(q) ? "" : "none";
  });
});

/* -----------------------------
   Expose loaders for HTML usage (optional)
   ----------------------------- */
window.loadDoctors = loadDoctors;
window.loadHospitals = loadHospitals;
window.updateDashboardStats = updateCounts;
