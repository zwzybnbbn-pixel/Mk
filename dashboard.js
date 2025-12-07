import { db } from "./firebase-config.js";
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
/* ===== tabs system ===== */
const tabButtons = document.querySelectorAll(".tabBtn");
const tabContents = document.querySelectorAll(".tabContent");

tabButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    // ازالة active من الجميع
    tabButtons.forEach(b => b.classList.remove("active"));
    tabContents.forEach(c => c.classList.remove("active"));

    // تفعيل المختار
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});
const popup = document.getElementById("popup");
const popupForm = document.getElementById("popupForm");
const popupTitle = document.getElementById("popupTitle");
const saveBtn = document.getElementById("saveBtn");

let currentCollection = "";
let editingId = null;

/* ========== عرض نافذة التعديل ========== */
function openPopup(title, collectionName, data = null, id = null) {
  popupTitle.innerText = title;
  popup.classList.remove("hidden");
  popupForm.innerHTML = "";
  currentCollection = collectionName;
  editingId = id;

  if (collectionName === "doctors") {
    popupForm.innerHTML = `
      <input id="name" placeholder="اسم الدكتور" value="${data?.name || ""}">
      <input id="specialty" placeholder="التخصص" value="${data?.specialty || ""}">
      <input id="hospital" placeholder="المستشفى" value="${data?.hospital || ""}">
      <input id="phone" placeholder="الهاتف" value="${data?.phone || ""}">
      <input id="img" placeholder="رابط الصورة" value="${data?.img || ""}">
      <textarea id="schedule" placeholder="الجدول (نص)">${data?.scheduleText || ""}</textarea>
    `;
  }

  if (collectionName === "hospitals") {
    popupForm.innerHTML = `
      <input id="name" placeholder="اسم المستشفى" value="${data?.name || ""}">
      <input id="city" placeholder="المدينة" value="${data?.city || ""}">
      <textarea id="description" placeholder="الوصف">${data?.description || ""}</textarea>
      <input id="phone" placeholder="الهاتف" value="${data?.phone || ""}">
      <input id="map" placeholder="رابط الموقع" value="${data?.map || ""}">
      <input id="img" placeholder="رابط الصورة" value="${data?.img || ""}">
      <textarea id="department" placeholder="الأقسام">${data?.department || ""}</textarea>
    `;
  }
}

/* ========== إغلاق النافذة ========== */
document.getElementById("closePopup").onclick = () => popup.classList.add("hidden");

/* ========== حفظ البيانات (إضافة/تعديل) ========== */
saveBtn.onclick = async () => {
  const fields = {};
  [...popupForm.querySelectorAll("input, textarea")].forEach(el => {
    fields[el.id] = el.value;
  });

  if (editingId) {
    await updateDoc(doc(db, currentCollection, editingId), fields);
  } else {
    await addDoc(collection(db, currentCollection), fields);
  }

  popup.classList.add("hidden");
  loadData();
};

/* ========== حذف عنصر ========== */
async function deleteItem(collectionName, id) {
  await deleteDoc(doc(db, collectionName, id));
  loadData();
}

/* ========== جلب البيانات ========== */
async function loadData() {
  /* الأطباء */
  const doctorsList = document.getElementById("doctorsList");
  doctorsList.innerHTML = "";

  const doctorsSnapshot = await getDocs(collection(db, "doctors"));
  doctorsSnapshot.forEach(docu => {
    const d = docu.data();

    doctorsList.innerHTML += `
      <div class="item">
        <div>${d.name} — ${d.specialty}</div>
        <div>
          <button onclick='(${openPopup})("تعديل دكتور","doctors",${JSON.stringify(
            d)}, "${docu.id}")'>✏ تعديل</button>
          <button class="red" onclick='(${deleteItem})("doctors","${docu.id}")'>🗑 حذف</button>
        </div>
      </div>
    `;
  });

  /* المستشفيات */
  const hospitalsList = document.getElementById("hospitalsList");
  hospitalsList.innerHTML = "";

  const hospitalSnapshot = await getDocs(collection(db, "hospitals"));
  hospitalSnapshot.forEach(docu => {
    const h = docu.data();

    hospitalsList.innerHTML += `
      <div class="item">
        <div>${h.name} — ${h.city}</div>
        <div>
          <button onclick='(${openPopup})("تعديل مستشفى","hospitals",${JSON.stringify(
            h)}, "${docu.id}")'>✏ تعديل</button>
          <button class="red" onclick='(${deleteItem})("hospitals","${docu.id}")'>🗑 حذف</button>
        </div>
      </div>
    `;
  });
}

/* ========== أزرار الإضافة ========== */
document.getElementById("addDoctorBtn").onclick = () => openPopup("إضافة دكتور", "doctors");
document.getElementById("addHospitalBtn").onclick = () => openPopup("إضافة مستشفى", "hospitals");

loadData();
