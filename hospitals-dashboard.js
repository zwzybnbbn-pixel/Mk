// hospitals-dashboard.js

import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } 
from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// عناصر
const logoutBtn = document.getElementById("logout");
const openAdd = document.getElementById("openAdd");
const modal = document.getElementById("modal");
const modalForm = document.getElementById("modalForm");
const modalCancel = document.getElementById("modalCancel");
const hospitalsTbody = document.getElementById("hospitalsTbody");
const searchInput = document.getElementById("search");
const totalHospitals = document.getElementById("totalHospitals");

const confirmBox = document.getElementById("confirm");
const confirmYes = document.getElementById("confirmYes");
const confirmNo = document.getElementById("confirmNo");

let cache = [];
let editingId = null;
let deletingId = null;

// حماية الأدمن
onAuthStateChanged(auth, user => {
  if (!user) location.href = "login.html";
  loadHospitals();
});

// تسجيل خروج
logoutBtn.onclick = () => signOut(auth);

// فتح إضافة
openAdd.onclick = () => {
  editingId = null;
  modalForm.reset();
  document.getElementById("modalTitle").textContent = "إضافة مستشفى";
  modal.classList.remove("hidden");
};

// إغلاق
modalCancel.onclick = () => modal.classList.add("hidden");

// تحميل
async function loadHospitals() {
  const snap = await getDocs(collection(db, "hospitals"));
  cache = snap.docs.map(x => ({ id: x.id, ...x.data() }));

  totalHospitals.textContent = cache.length;

  render(cache);
}

// حفظ
modalForm.onsubmit = async (e) => {
  e.preventDefault();

  const payload = {
    name: h_name.value.trim(),
    location: h_location.value.trim(),
    phone: h_phone.value.trim(),
    desc: h_desc.value.trim()
  };

  if (editingId)
    await updateDoc(doc(db, "hospitals", editingId), payload);
  else
    await addDoc(collection(db, "hospitals"), payload);

  modal.classList.add("hidden");
  loadHospitals();
};

// عرض الجدول
function render(rows) {
  hospitalsTbody.innerHTML = "";

  const q = searchInput.value.trim().toLowerCase();

  rows.filter(r =>
    (r.name + r.location).toLowerCase().includes(q)
  ).forEach(r => {
    hospitalsTbody.innerHTML += `
      <tr>
        <td>${r.name}</td>
        <td>${r.location}</td>
        <td>${r.phone}</td>

        <td>
          <button class="btn edit" data-edit="${r.id}">تعديل</button>
          <button class="btn delete" data-del="${r.id}">حذف</button>
          <a class="btn view" href="hospital.html?id=${r.id}">عرض</a>
        </td>
      </tr>
    `;
  });

  document.querySelectorAll("[data-edit]").forEach(btn =>
    btn.onclick = () => openEdit(btn.dataset.edit));

  document.querySelectorAll("[data-del]").forEach(btn =>
    btn.onclick = () => openDelete(btn.dataset.del));
}

// تعديل مستشفى
function openEdit(id) {
  editingId = id;
  const h = cache.find(x => x.id === id);

  modalTitle.textContent = "تعديل مستشفى";
  h_name.value = h.name;
  h_location.value = h.location;
  h_phone.value = h.phone;
  h_desc.value = h.desc;

  modal.classList.remove("hidden");
}

// حذف
function openDelete(id) {
  deletingId = id;
  confirmBox.classList.remove("hidden");
}

confirmNo.onclick = () => confirmBox.classList.add("hidden");

confirmYes.onclick = async () => {
  await deleteDoc(doc(db, "hospitals", deletingId));
  confirmBox.classList.add("hidden");
  loadHospitals();
};
