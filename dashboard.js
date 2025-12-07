// dashboard.js
// مطلوب: ملف firebase-config.js يصدّر `db` و `auth`
// Firestore v12 modular
import { auth, db } from "./firebase-config.js";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

/* -------------------------------------------------
   عناصر DOM الأساسية
-------------------------------------------------*/
const tabDoctors = document.getElementById("tabDoctors");
const tabHospitals = document.getElementById("tabHospitals");

const doctorSection = document.getElementById("doctorSection");
const hospitalSection = document.getElementById("hospitalSection");

const doctorsList = document.getElementById("doctorsList");
const hospitalsList = document.getElementById("hospitalsList");

const addDoctorBtn = document.getElementById("addDoctorBtn");
const addHospitalBtn = document.getElementById("addHospitalBtn");

const popup = document.getElementById("popup");
const popupTitle = document.getElementById("popupTitle");
const popupForm = document.getElementById("popupForm");
const saveBtn = document.getElementById("saveBtn");
const closePopup = document.getElementById("closePopup");

/* حالة التحرير */
let editingType = null; // "doctor" | "hospital" | null
let editingId = null;

/* -------------------------------------------------
   فحص المصادقة (تأكد أن المستخدم مسجل)
-------------------------------------------------*/
onAuthStateChanged(auth, (user) => {
  if (!user) {
    // لو تم استدعاء الملف بدون تسجيل (نادر لأن HTML يستدعي بعد auth)
    window.location.href = "login.html";
  } else {
    // بداية تحميل البيانات
    showDoctors();
    // event listeners
    bindUI();
  }
});

/* -------------------------------------------------
   ربط أحداث الواجهة
-------------------------------------------------*/
function bindUI() {
  // Tabs
  tabDoctors.addEventListener("click", () => {
    tabDoctors.classList.add("active");
    tabHospitals.classList.remove("active");
    doctorSection.classList.remove("hidden");
    hospitalSection.classList.add("hidden");
    showDoctors();
  });
  tabHospitals.addEventListener("click", () => {
    tabHospitals.classList.add("active");
    tabDoctors.classList.remove("active");
    hospitalSection.classList.remove("hidden");
    doctorSection.classList.add("hidden");
    showHospitals();
  });

  // Add buttons
  addDoctorBtn.addEventListener("click", () => openDoctorForm(null));
  addHospitalBtn.addEventListener("click", () => openHospitalForm(null));

  // Popup close/save
  closePopup?.addEventListener("click", () => closeModal());
  saveBtn?.addEventListener("click", async (e) => {
    e.preventDefault();
    await handleSave();
  });

  // Logout button (if موجود)
  const logoutBtn = document.getElementById("logout");
  if (logoutBtn) logoutBtn.addEventListener("click", async () => { await signOut(auth); window.location.href = "login.html"; });
}

/* -------------------------------------------------
   عرض الأطباء (قائمة منسقة – جدول)
-------------------------------------------------*/
export async function showDoctors() {
  doctorsList.innerHTML = `<div style="padding:18px;color:#475569">جارِ التحميل...</div>`;

  try {
    const snap = await getDocs(collection(db, "doctors"));
    if (snap.empty) {
      doctorsList.innerHTML = `<div style="padding:14px;color:#475569">لا يوجد أطباء</div>`;
      return;
    }

    // نبني جدول HTML
    let html = `<div style="overflow:auto"><table class="table"><thead>
      <tr>
        <th>الطبيب</th>
        <th>التخصص</th>
        <th>المستشفى</th>
        <th>أيام العمل</th>
        <th>أوقات</th>
        <th>إجراءات</th>
      </tr></thead><tbody>`;

    snap.forEach(docu => {
      const d = docu.data();
      const id = docu.id;

      // نعرض الصورة والاسم
      const img = d.img ? `<img src="${escapeHtml(d.img)}" class="row-img" alt="صورة">` : "";
      const nameHtml = `<div style="display:flex;align-items:center;justify-content:flex-end;gap:8px">${img}<div style="text-align:right"><strong>${escapeHtml(d.name || "-")}</strong><div style="font-size:12px;color:var(--muted)">${escapeHtml(d.phone || "")}</div></div></div>`;

      // schedule: اجعل الأيام تظهر كسطر لكل يوم
      const schedule = d.schedule || {};
      const daysNames = ["saturday","sunday","monday","tuesday","wednesday","thursday","friday"];
      const daysLabelAr = ["السبت","الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة"];
      let daysHtml = "";
      let timesHtml = "";
      daysNames.forEach((key, idx) => {
        const t = (schedule[key] && schedule[key].time) ? schedule[key].time : "";
        daysHtml += `<div style="font-size:13px;padding:2px 0">${daysLabelAr[idx]}</div>`;
        timesHtml += `<div style="font-size:13px;padding:2px 0">${escapeHtml(t || "-")}</div>`;
      });

      html += `<tr>
        <td>${nameHtml}</td>
        <td>${escapeHtml(d.specialty || "-")}</td>
        <td>${escapeHtml(d.hospital || "-")}</td>
        <td style="min-width:120px">${daysHtml}</td>
        <td style="min-width:140px">${timesHtml}</td>
        <td>
          <button class="btn edit" onclick="openEditDoctor('${id}')">تعديل</button>
          <button class="btn delete" onclick="deleteDoctorConfirm('${id}')">حذف</button>
        </td>
      </tr>`;
    });

    html += `</tbody></table></div>`;
    doctorsList.innerHTML = html;

  } catch (err) {
    console.error("خطأ في جلب الأطباء:", err);
    doctorsList.innerHTML = `<div style="padding:18px;color:var(--danger)">حدث خطأ أثناء جلب الأطباء</div>`;
  }
}

/* -------------------------------------------------
   عرض المستشفيات
-------------------------------------------------*/
export async function showHospitals() {
  hospitalsList.innerHTML = `<div style="padding:18px;color:#475569">جارِ التحميل...</div>`;
  try {
    const snap = await getDocs(collection(db, "hospitals"));
    if (snap.empty) {
      hospitalsList.innerHTML = `<div style="padding:14px;color:#475569">لا يوجد مستشفيات</div>`;
      return;
    }

    let html = `<div style="overflow:auto"><table class="table"><thead>
      <tr>
        <th>المستشفى</th>
        <th>المدينة</th>
        <th>الهاتف</th>
        <th>الأقسام</th>
        <th>إجراءات</th>
      </tr></thead><tbody>`;

    snap.forEach(docu => {
      const h = docu.data();
      const id = docu.id;
      const img = h.img ? `<img src="${escapeHtml(h.img)}" class="row-img" alt="صورة">` : "";
      const nameHtml = `<div style="display:flex;align-items:center;justify-content:flex-end;gap:8px">${img}<div style="text-align:right"><strong>${escapeHtml(h.name || "-")}</strong></div></div>`;
      html += `<tr>
        <td>${nameHtml}</td>
        <td>${escapeHtml(h.city || "-")}</td>
        <td>${escapeHtml(h.phone || "-")}</td>
        <td style="max-width:280px">${escapeHtml(h.department || "-")}</td>
        <td>
          <button class="btn edit" onclick="openEditHospital('${id}')">تعديل</button>
          <button class="btn delete" onclick="deleteHospitalConfirm('${id}')">حذف</button>
        </td>
      </tr>`;
    });

    html += `</tbody></table></div>`;
    hospitalsList.innerHTML = html;

  } catch (err) {
    console.error("خطأ في جلب المستشفيات:", err);
    hospitalsList.innerHTML = `<div style="padding:18px;color:var(--danger)">حدث خطأ أثناء جلب المستشفيات</div>`;
  }
}

/* -------------------------------------------------
   فتح نموذج إضافة طبيب (أو تعديل)
-------------------------------------------------*/
function openDoctorForm(data) {
  editingType = "doctor";
  editingId = data?.id || null;
  popupTitle.textContent = editingId ? "تعديل بيانات الطبيب" : "إضافة طبيب";
  // بناء الفورم
  popupForm.innerHTML = buildDoctorFormHtml(data?.doc || {});
  showModal();

  // ربط معاينة الصورة لحقل الصورة
  const imgInput = popupForm.querySelector("#d_img");
  const preview = popupForm.querySelector("#d_preview");
  imgInput.addEventListener("input", ()=> {
    const url = imgInput.value.trim();
    if (url) { preview.src = url; preview.style.display = "block"; }
    else preview.style.display = "none";
  });
}

/* -------------------------------------------------
   فتح نموذج تعديل (يدعى من جدول) — wrapper لنافذة
-------------------------------------------------*/
window.openEditDoctor = async function(id) {
  try {
    const ref = doc(db, "doctors", id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return alert("لا يوجد هذا الطبيب");
    openDoctorForm({ id, doc: snap.data() });
  } catch (err) {
    console.error(err);
    alert("خطأ في جلب بيانات الطبيب");
  }
};

/* -------------------------------------------------
   HTML نموذج الطبيب
-------------------------------------------------*/
function buildDoctorFormHtml(d = {}) {
  // ensure schedule object
  const sched = d.schedule || {};
  const val = (k)=> (sched[k] && sched[k].time) ? sched[k].time : (d[k] || "");
  return `
    <div class="form-grid">
      <div class="form-row">
        <label>اسم الطبيب</label>
        <input id="d_name" class="input" value="${escapeHtml(d.name||'')}" required />
      </div>
      <div class="form-row">
        <label>التخصص</label>
        <input id="d_specialty" class="input" value="${escapeHtml(d.specialty||'')}" />
      </div>

      <div class="form-row">
        <label>المستشفى</label>
        <input id="d_hospital" class="input" value="${escapeHtml(d.hospital||'')}" />
      </div>
      <div class="form-row">
        <label>الهاتف</label>
        <input id="d_phone" class="input" value="${escapeHtml(d.phone||'')}" />
      </div>

      <div class="form-row">
        <label>رابط صورة (RAW URL)</label>
        <input id="d_img" class="input" value="${escapeHtml(d.img||'')}" />
      </div>
      <div class="form-row">
        <label>معاينة</label>
        <img id="d_preview" src="${escapeHtml(d.img||'')}" style="${d.img ? '' : 'display:none'}; width:90px;height:90px;border-radius:8px;object-fit:cover;" />
      </div>
    </div>

    <h4>جدول الدوام</h4>
    <table class="schedule-table" role="grid">
      <thead><tr><th>اليوم</th><th>الوقت</th></tr></thead>
      <tbody>
        ${["saturday","sunday","monday","tuesday","wednesday","thursday","friday"].map((key, idx) => `
          <tr>
            <td style="text-align:center">${["السبت","الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة"][idx]}</td>
            <td><input id="sched_${key}" class="input" value="${escapeHtml(val(key))}" placeholder="مثال: 8 ص - 2 م" /></td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

/* -------------------------------------------------
   فتح نموذج مستشفى
-------------------------------------------------*/
function openHospitalForm(data) {
  editingType = "hospital";
  editingId = data?.id || null;
  popupTitle.textContent = editingId ? "تعديل بيانات المستشفى" : "إضافة مستشفى";
  popupForm.innerHTML = buildHospitalFormHtml(data?.doc || {});
  showModal();

  const imgInput = popupForm.querySelector("#h_img");
  const preview = popupForm.querySelector("#h_preview");
  imgInput.addEventListener("input", ()=> {
    const url = imgInput.value.trim();
    if (url) { preview.src = url; preview.style.display = "block"; }
    else preview.style.display = "none";
  });
}

window.openEditHospital = async function(id) {
  try {
    const ref = doc(db, "hospitals", id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return alert("لا يوجد هذا المستشفى");
    openHospitalForm({ id, doc: snap.data() });
  } catch (err) {
    console.error(err);
    alert("خطأ في جلب بيانات المستشفى");
  }
}

function buildHospitalFormHtml(h = {}) {
  return `
    <div class="form-grid">
      <div class="form-row"><label>اسم المستشفى</label><input id="h_name" class="input" value="${escapeHtml(h.name||'')}" /></div>
      <div class="form-row"><label>المدينة</label><input id="h_city" class="input" value="${escapeHtml(h.city||'')}" /></div>
      <div class="form-row"><label>الهاتف</label><input id="h_phone" class="input" value="${escapeHtml(h.phone||'')}" /></div>
      <div class="form-row"><label>الأقسام (مفصولة بـ - )</label><input id="h_department" class="input" value="${escapeHtml(h.department||'')}" /></div>
      <div class="form-row"><label>رابط صورة</label><input id="h_img" class="input" value="${escapeHtml(h.img||'')}" /></div>
      <div class="form-row"><label>معاينة</label><img id="h_preview" src="${escapeHtml(h.img||'')}" style="${h.img ? '' : 'display:none'}; width:100px;height:80px;border-radius:6px;object-fit:cover;" /></div>
      <div class="form-row" style="grid-column:1/-1"><label>وصف</label><textarea id="h_description" class="input">${escapeHtml(h.description||'')}</textarea></div>
      <div class="form-row" style="grid-column:1/-1"><label>رابط الخريطة (Google Maps)</label><input id="h_map" class="input" value="${escapeHtml(h.map||'')}" /></div>
    </div>
  `;
}

/* -------------------------------------------------
   حفظ (إضافة / تعديل) أي نوع
-------------------------------------------------*/
async function handleSave() {
  try {
    if (editingType === "doctor") {
      const docData = {
        name: popupForm.querySelector("#d_name").value.trim(),
        specialty: popupForm.querySelector("#d_specialty").value.trim(),
        phone: popupForm.querySelector("#d_phone").value.trim(),
        hospital: popupForm.querySelector("#d_hospital").value.trim(),
        img: popupForm.querySelector("#d_img").value.trim(),
        schedule: {
          saturday: { time: popupForm.querySelector("#sched_saturday").value.trim() },
          sunday: { time: popupForm.querySelector("#sched_sunday").value.trim() },
          monday: { time: popupForm.querySelector("#sched_monday").value.trim() },
          tuesday: { time: popupForm.querySelector("#sched_tuesday").value.trim() },
          wednesday: { time: popupForm.querySelector("#sched_wednesday").value.trim() },
          thursday: { time: popupForm.querySelector("#sched_thursday").value.trim() },
          friday: { time: popupForm.querySelector("#sched_friday").value.trim() }
        }
      };

      if (editingId) {
        await updateDoc(doc(db, "doctors", editingId), docData);
        alert("تم تحديث بيانات الطبيب");
      } else {
        await addDoc(collection(db, "doctors"), docData);
        alert("تم إضافة طبيب جديد");
      }
      closeModal();
      showDoctors();
    }

    else if (editingType === "hospital") {
      const docData = {
        name: popupForm.querySelector("#h_name").value.trim(),
        city: popupForm.querySelector("#h_city").value.trim(),
        phone: popupForm.querySelector("#h_phone").value.trim(),
        department: popupForm.querySelector("#h_department").value.trim(),
        description: popupForm.querySelector("#h_description").value.trim(),
        img: popupForm.querySelector("#h_img").value.trim(),
        map: popupForm.querySelector("#h_map").value.trim()
      };

      if (editingId) {
        await updateDoc(doc(db, "hospitals", editingId), docData);
        alert("تم تحديث بيانات المستشفى");
      } else {
        await addDoc(collection(db, "hospitals"), docData);
        alert("تم إضافة مستشفى جديد");
      }
      closeModal();
      showHospitals();
    }

  } catch (err) {
    console.error("خطأ في الحفظ:", err);
    alert("حدث خطأ أثناء الحفظ");
  }
}

/* -------------------------------------------------
   حذف مع تأكيد
-------------------------------------------------*/
window.deleteDoctorConfirm = async function(id) {
  if (!confirm("هل تريد حذف هذا الطبيب؟")) return;
  try {
    await deleteDoc(doc(db, "doctors", id));
    alert("تم الحذف");
    showDoctors();
  } catch (err) {
    console.error(err);
    alert("حدث خطأ أثناء الحذف");
  }
};

window.deleteHospitalConfirm = async function(id) {
  if (!confirm("هل تريد حذف هذا المستشفى؟")) return;
  try {
    await deleteDoc(doc(db, "hospitals", id));
    alert("تم الحذف");
    showHospitals();
  } catch (err) {
    console.error(err);
    alert("حدث خطأ أثناء الحذف");
  }
};

/* -------------------------------------------------
   المودال (فتح / غلق)
-------------------------------------------------*/
function showModal() {
  popup.classList.remove("hidden");
  // scroll to top of popup
  popup.querySelector(".popup-content").scrollTop = 0;
}
function closeModal() {
  popup.classList.add("hidden");
  editingType = null;
  editingId = null;
  popupForm.innerHTML = "";
}

/* -------------------------------------------------
   مساعدة - هروب HTML بسيط
-------------------------------------------------*/
function escapeHtml(s){
  if(!s && s!==0) return "";
  return String(s)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'", "&#039;");
}

/* -------------------------------------------------
   تهيئة أولية: عرض الأطباء كبداية
-------------------------------------------------*/
(function init() {
  // افتراضيًا افتح تبويب الأطباء
  tabDoctors?.classList.add("active");
  tabHospitals?.classList.remove("active");
  doctorSection?.classList.remove("hidden");
  hospitalSection?.classList.add("hidden");
})();
