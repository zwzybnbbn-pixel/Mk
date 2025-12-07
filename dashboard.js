// dashboard.js
// صفحة واحدة: عرض / إضافة / تعديل / حذف أطباء و مستشفيات
// يتوقع ملف firebase-config.js في نفس المسار يصدر `auth` و `db`

import { auth, db } from "./firebase-config.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

/* -------------------------
   عناصر الصفحة (DOM)
   -------------------------*/
const doctorsList = document.getElementById("doctorsList");
const hospitalsList = document.getElementById("hospitalsList");
const popup = document.getElementById("popup");
const popupForm = document.getElementById("popupForm");
const popupTitle = document.getElementById("popupTitle");
const saveBtn = document.getElementById("saveBtn");
const closePopupBtn = document.getElementById("closePopup");
const docTitle = document.getElementById("docTitle");
const hosTitle = document.getElementById("hosTitle");

/* -------------------------
   حالة (state)
   -------------------------*/
let currentSection = null; // "doctors" | "hospitals" | null
let currentMode = null; // "add" | "edit"
let editingId = null; // id being edited

/* -------------------------
   auth guard
   -------------------------*/
onAuthStateChanged(auth, (user) => {
  if (!user) {
    // غير مسجل → ارسل للّوجين (HTML الخاص بك يعالج ذلك أيضاً)
    window.location.href = "login.html";
    return;
  }
  // جاهز للعمل — لا نفعل أي شيء تلقائياً (المستخدم يضغط بطاقات)
});

/* =========================
   مساعدة: اظهار/اخفاء اقسام
   ========================= */
function hideAllSections() {
  doctorsList.innerHTML = "";
  hospitalsList.innerHTML = "";
  if (docTitle) docTitle.style.display = "none";
  if (hosTitle) hosTitle.style.display = "none";
  currentSection = null;
}

window.openDoctors = function () {
  hideAllSections();
  if (docTitle) docTitle.style.display = "block";
  currentSection = "doctors";
  loadDoctors();
};

window.openHospitals = function () {
  hideAllSections();
  if (hosTitle) hosTitle.style.display = "block";
  currentSection = "hospitals";
  loadHospitals();
};

/* =========================
   تحميل و عرض الأطباء
   ========================= */
export async function loadDoctors() {
  try {
    doctorsList.innerHTML = `<div class="box"><small>جارٍ التحميل...</small></div>`;
    const snap = await getDocs(collection(db, "doctors"));

    if (snap.empty) {
      doctorsList.innerHTML = `<div class="box"><small>لا يوجد أطباء</small></div>`;
      return;
    }

    let html = "";
    snap.forEach((dDoc) => {
      const d = dDoc.data();
      const id = dDoc.id;

      // Schedule summary (عرض سريع)
      const schedule = d.schedule || {};
      const days = ["saturday","sunday","monday","tuesday","wednesday","thursday","friday"];
      let scheduleHtml = "<table style='width:100%;border-collapse:collapse;margin-top:8px;'><tbody>";
      for (const day of days) {
        const t = (schedule[day] && schedule[day].time) ? schedule[day].time : "";
        scheduleHtml += `
          <tr>
            <td style="padding:6px;border-bottom:1px solid #eee;width:40%;font-weight:700;text-align:right">${day}</td>
            <td style="padding:6px;border-bottom:1px solid #eee;text-align:left">${t || "-"}</td>
          </tr>`;
      }
      scheduleHtml += "</tbody></table>";

      // بطاقة الطبيب
      html += `
        <div class="box" data-id="${id}" style="margin-bottom:12px">
          <div style="display:flex;gap:12px;align-items:center;">
            <img src="${d.img || ''}" onerror="this.style.display='none'" style="width:80px;height:80px;border-radius:12px;object-fit:cover;">
            <div style="flex:1">
              <div style="font-weight:800;color:#00695C;font-size:18px">${escapeHtml(d.name || "-")}</div>
              <div style="color:#444;margin-top:6px">${escapeHtml(d.specialty || "-")}</div>
              <div style="color:#666;margin-top:6px;font-size:14px">المستشفى: ${escapeHtml(d.hospital || "-")}</div>
              <div style="color:#666;margin-top:4px;font-size:14px">الهاتف: ${escapeHtml(d.phone || "-")}</div>
            </div>
          </div>

          <div style="margin-top:10px">${scheduleHtml}</div>

          <div style="margin-top:10px;text-align:left">
            <button class="edit-btn" data-id="${id}" onclick="editDoctor('${id}')">تعديل</button>
            <button class="del-btn" data-id="${id}" onclick="deleteDoctor('${id}')">حذف</button>
          </div>
        </div>
      `;
    });

    doctorsList.innerHTML = html;
  } catch (err) {
    console.error(err);
    doctorsList.innerHTML = `<div class="box"><small>خطأ في تحميل الأطباء</small></div>`;
  }
}

/* =========================
   تحميل و عرض المستشفيات
   ========================= */
export async function loadHospitals() {
  try {
    hospitalsList.innerHTML = `<div class="box"><small>جارٍ التحميل...</small></div>`;
    const snap = await getDocs(collection(db, "hospitals"));

    if (snap.empty) {
      hospitalsList.innerHTML = `<div class="box"><small>لا يوجد مستشفيات</small></div>`;
      return;
    }

    let html = "";
    snap.forEach((hDoc) => {
      const h = hDoc.data();
      const id = hDoc.id;

      html += `
        <div class="box" data-id="${id}" style="margin-bottom:12px">
          <div style="display:flex;gap:12px;align-items:center;">
            <img src="${h.img || ''}" onerror="this.style.display='none'" style="width:80px;height:80px;border-radius:12px;object-fit:cover;">
            <div style="flex:1">
              <div style="font-weight:800;color:#00695C;font-size:18px">${escapeHtml(h.name || "-")}</div>
              <div style="color:#444;margin-top:6px">المدينة: ${escapeHtml(h.city || "-")}</div>
              <div style="color:#666;margin-top:6px;font-size:14px">الهاتف: ${escapeHtml(h.phone || "-")}</div>
              <div style="color:#666;margin-top:6px;font-size:14px">الأقسام: ${escapeHtml(h.department || "-")}</div>
            </div>
          </div>

          <div style="margin-top:10px">${escapeHtml(h.description || "")}</div>

          <div style="margin-top:10px;text-align:left">
            <button class="edit-btn" data-id="${id}" onclick="editHospital('${id}')">تعديل</button>
            <button class="del-btn" data-id="${id}" onclick="deleteHospital('${id}')">حذف</button>
            ${h.map ? `<a href="${h.map}" target="_blank" style="margin-right:8px;color:#00695C;font-weight:800">خريطة</a>` : ""}
          </div>
        </div>
      `;
    });

    hospitalsList.innerHTML = html;
  } catch (err) {
    console.error(err);
    hospitalsList.innerHTML = `<div class="box"><small>خطأ في تحميل المستشفيات</small></div>`;
  }
}

/* =========================
   حذف
   ========================= */
window.deleteDoctor = async function (id) {
  if (!confirm("هل تريد حذف هذا الطبيب؟")) return;
  try {
    await deleteDoc(doc(db, "doctors", id));
    alert("تم الحذف");
    loadDoctors();
  } catch (err) {
    console.error(err);
    alert("فشل الحذف");
  }
};

window.deleteHospital = async function (id) {
  if (!confirm("هل تريد حذف هذا المستشفى؟")) return;
  try {
    await deleteDoc(doc(db, "hospitals", id));
    alert("تم الحذف");
    loadHospitals();
  } catch (err) {
    console.error(err);
    alert("فشل الحذف");
  }
};

/* =========================
   إضافة — تحرير (popup)
   ========================= */

function showPopup(title) {
  popupTitle.textContent = title;
  popup.style.display = "flex";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function hidePopup() {
  popupForm.innerHTML = "";
  popup.style.display = "none";
  editingId = null;
  currentMode = null;
}

// إنشاء فورم للطبيب
function buildDoctorForm(data = {}) {
  // كل يوم حقل input منفصل (كما طلبت)
  const days = ["saturday","sunday","monday","tuesday","wednesday","thursday","friday"];
  let scheduleHtml = "";
  for (const day of days) {
    const t = (data.schedule && data.schedule[day] && data.schedule[day].time) ? data.schedule[day].time : "";
    scheduleHtml += `
      <label style="font-weight:700;margin-top:6px;display:block">${day}</label>
      <input name="sched_${day}" placeholder="مثال: 8 ص - 2 م" value="${escapeAttr(t)}">
    `;
  }

  popupForm.innerHTML = `
    <input name="name" placeholder="اسم الطبيب" value="${escapeAttr(data.name||'')}" required>
    <input name="specialty" placeholder="التخصص" value="${escapeAttr(data.specialty||'')}">
    <input name="phone" placeholder="الهاتف" value="${escapeAttr(data.phone||'')}">
    <input name="hospital" placeholder="المستشفى" value="${escapeAttr(data.hospital||'')}">
    <input name="img" placeholder="رابط صورة (RAW URL)" value="${escapeAttr(data.img||'')}">
    <div style="margin-top:8px;font-weight:800;color:#00695C">جدول الدوام</div>
    ${scheduleHtml}
  `;
}

// إنشاء فورم للمستشفى
function buildHospitalForm(data = {}) {
  popupForm.innerHTML = `
    <input name="name" placeholder="اسم المستشفى" value="${escapeAttr(data.name||'')}" required>
    <input name="city" placeholder="المدينة" value="${escapeAttr(data.city||'')}">
    <input name="phone" placeholder="الهاتف" value="${escapeAttr(data.phone||'')}">
    <input name="department" placeholder="الأقسام (مفصولة بـ - )" value="${escapeAttr(data.department||'')}">
    <textarea name="description" placeholder="الوصف" rows="3">${escapeAttr(data.description||'')}</textarea>
    <input name="img" placeholder="رابط صورة المستشفى" value="${escapeAttr(data.img||'')}">
    <input name="map" placeholder="رابط الخريطة (Google Maps)" value="${escapeAttr(data.map||'')}">
  `;
}

/* إضافة جديد */
window.addDoctor = function () {
  currentMode = "add";
  editingId = null;
  buildDoctorForm({});
  showPopup("إضافة طبيب جديد");
};

window.addHospital = function () {
  currentMode = "add";
  editingId = null;
  buildHospitalForm({});
  showPopup("إضافة مستشفى جديد");
};

/* تعديل */
window.editDoctor = async function (id) {
  try {
    const ref = doc(db, "doctors", id);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      alert("لم يتم العثور على الطبيب");
      return;
    }
    const data = snap.data();
    editingId = id;
    currentMode = "edit";
    buildDoctorForm(data);
    showPopup("تعديل بيانات الطبيب");
  } catch (err) {
    console.error(err);
    alert("خطأ عند جلب بيانات الطبيب");
  }
};

window.editHospital = async function (id) {
  try {
    const ref = doc(db, "hospitals", id);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      alert("لم يتم العثور على المستشفى");
      return;
    }
    const data = snap.data();
    editingId = id;
    currentMode = "edit";
    buildHospitalForm(data);
    showPopup("تعديل بيانات المستشفى");
  } catch (err) {
    console.error(err);
    alert("خطأ عند جلب بيانات المستشفى");
  }
};

/* حفظ (من الفورم) */
saveBtn.addEventListener("click", async (e) => {
  e.preventDefault();

  // تحديد نوع النموذج بواسطة وجود حقل schedule أو city
  // (نحدد عبر currentSection أو عبر حقول الفورم)
  const fm = popupForm;
  const formData = new FormData(fm);
  try {
    if (currentMode === null) {
      // determine by checking form inputs
      if (fm.querySelector("input[name='specialty']")) {
        currentMode = "add";
        currentSection = "doctors";
      } else {
        currentMode = "add";
        currentSection = "hospitals";
      }
    }

    if (currentSection === "doctors" || fm.querySelector("input[name='specialty']")) {
      // doctor
      const name = formData.get("name") || "";
      const specialty = formData.get("specialty") || "";
      const phone = formData.get("phone") || "";
      const hospital = formData.get("hospital") || "";
      const img = formData.get("img") || "";
      const schedule = {};
      const days = ["saturday","sunday","monday","tuesday","wednesday","thursday","friday"];
      for (const day of days) {
        schedule[day] = { time: formData.get(`sched_${day}`) || "" };
      }

      const payload = { name, specialty, phone, hospital, img, schedule };

      if (currentMode === "edit" && editingId) {
        await updateDoc(doc(db, "doctors", editingId), payload);
        alert("تم تحديث بيانات الطبيب");
        hidePopup();
        loadDoctors();
      } else {
        await addDoc(collection(db, "doctors"), payload);
        alert("تم إضافة الطبيب");
        hidePopup();
        loadDoctors();
      }
    } else {
      // hospital
      const name = formData.get("name") || "";
      const city = formData.get("city") || "";
      const phone = formData.get("phone") || "";
      const department = formData.get("department") || "";
      const description = formData.get("description") || "";
      const img = formData.get("img") || "";
      const map = formData.get("map") || "";

      const payload = { name, city, phone, department, description, img, map };

      if (currentMode === "edit" && editingId) {
        await updateDoc(doc(db, "hospitals", editingId), payload);
        alert("تم تحديث بيانات المستشفى");
        hidePopup();
        loadHospitals();
      } else {
        await addDoc(collection(db, "hospitals"), payload);
        alert("تم إضافة المستشفى");
        hidePopup();
        loadHospitals();
      }
    }
  } catch (err) {
    console.error(err);
    alert("فشل الحفظ — تأكد من صلاحيات قاعدة البيانات و الاتصـال");
  }
});

closePopupBtn.addEventListener("click", (e) => {
  e.preventDefault();
  hidePopup();
});

/* =========================
   مساعدة صغيرة للحماية ضد XSS عند إخراج النص
   (HTML injection protection for simple use)
   ========================= */
function escapeHtml(str) {
  if (!str && str !== 0) return "";
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
function escapeAttr(str) {
  if (!str && str !== 0) return "";
  return String(str)
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/* =========================
   أدوات مساعدة (واضح للمطور)
   ========================= */
window.signOut = async function () {
  await signOut(auth);
  window.location.href = "login.html";
};

/* =========================
   shortcuts: ربط أزرار سريعة
   (يمكن استدعاؤها من الـ HTML إذا أردت)
   ========================= */
window.openAddDoctorForm = function () {
  currentSection = "doctors";
  currentMode = "add";
  editingId = null;
  buildDoctorForm({});
  showPopup("إضافة طبيب جديد");
};

window.openAddHospitalForm = function () {
  currentSection = "hospitals";
  currentMode = "add";
  editingId = null;
  buildHospitalForm({});
  showPopup("إضافة مستشفى جديد");
};
