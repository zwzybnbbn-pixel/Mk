// admin-hospitals.js
import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import {
  collection, getDocs, addDoc, doc, updateDoc, deleteDoc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

import {
  getStorage, ref as sref, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";

const logoutBtn = document.getElementById("logout");
const openAdd = document.getElementById("openAdd");
const modal = document.getElementById("modal");
const modalForm = document.getElementById("modalForm");
const modalTitle = document.getElementById("modalTitle");
const modalCancel = document.getElementById("modalCancel");
const hospitalsTbody = document.getElementById("hospitalsTbody");
const totalHospitals = document.getElementById("totalHospitals");
const searchInput = document.getElementById("search");
const confirm = document.getElementById("confirm");
const confirmYes = document.getElementById("confirmYes");
const confirmNo = document.getElementById("confirmNo");
const uploadStatus = document.getElementById("uploadStatus");

const storage = getStorage();

let cache = [];
let editingId = null;
let deletingId = null;

// Auth guard
onAuthStateChanged(auth, user => {
  if (!user) {
    location.href = "login.html";
    return;
  }
  loadHospitals();
});

// logout
logoutBtn.onclick = () => signOut(auth).then(()=> location.href='login.html');

// open add
openAdd.onclick = () => {
  editingId = null;
  modalTitle.textContent = "إضافة مستشفى";
  modalForm.reset();
  uploadStatus.textContent = "";
  modal.classList.remove("hidden");
};

// cancel modal
modalCancel.onclick = () => modal.classList.add("hidden");

// confirm
confirmNo.onclick = () => { deletingId = null; confirm.classList.add("hidden"); };
confirmYes.onclick = async () => {
  if (!deletingId) return;
  await deleteDoc(doc(db, "hospitals", deletingId));
  confirm.classList.add("hidden");
  deletingId = null;
  await loadHospitals();
};

// handle form submit (add / edit)
modalForm.onsubmit = async (e) => {
  e.preventDefault();

  const name = document.getElementById("f_name").value.trim();
  const city = document.getElementById("f_city").value.trim();
  const departments = document.getElementById("f_departments").value.trim();
  const phone = document.getElementById("f_phone").value.trim();
  const locationLink = document.getElementById("f_locationLink").value.trim();
  const desc = document.getElementById("f_description").value.trim();
  const fileInput = document.getElementById("f_image");

  let imageUrl = "";

  try {
    uploadStatus.textContent = "";

    if (fileInput.files && fileInput.files[0]) {
      uploadStatus.textContent = "⏳ جاري رفع الصورة...";
      const file = fileInput.files[0];
      const storageRef = sref(storage, `hospitals/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      imageUrl = await getDownloadURL(storageRef);
      uploadStatus.textContent = "✔️ تم رفع الصورة";
    }

    const payload = {
      name, city, departments, phone,
      locationLink, description: desc
    };

    if (imageUrl) payload.image = imageUrl;

    if (editingId) {
      await updateDoc(doc(db, "hospitals", editingId), payload);
    } else {
      await addDoc(collection(db, "hospitals"), payload);
    }

    modal.classList.add("hidden");
    await loadHospitals();
  } catch (err) {
    console.error(err);
    alert("حصل خطأ أثناء الحفظ: " + err.message);
    uploadStatus.textContent = "";
  }
};

// load hospitals
async function loadHospitals() {
  const snap = await getDocs(collection(db, "hospitals"));
  cache = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  totalHospitals.textContent = cache.length;
  renderTable(cache);
}

// render table
function renderTable(rows) {
  hospitalsTbody.innerHTML = "";
  const q = searchInput.value.trim().toLowerCase();

  const filtered = rows.filter(r => {
    const t = ((r.name||"") + " " + (r.city||"") + " " + (r.departments||"")).toLowerCase();
    return !q || t.includes(q);
  });

  if (filtered.length === 0) {
    hospitalsTbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:16px">لا توجد نتائج</td></tr>`;
    return;
  }

  filtered.forEach(r => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(r.name||'')}</td>
      <td>${escapeHtml(r.city||'')}</td>
      <td>${escapeHtml(r.departments||'')}</td>
      <td>${escapeHtml(r.phone||'')}</td>
      <td>
        <button class="btn edit" data-edit="${r.id}">تعديل</button>
        <button class="btn delete" data-del="${r.id}">حذف</button>
        <a class="view" href="hospital.html?id=${r.id}">عرض</a>
      </td>
    `;
    hospitalsTbody.appendChild(tr);
  });

  // attach events
  hospitalsTbody.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', e => openEdit(e.currentTarget.dataset.edit)));
  hospitalsTbody.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', e => { deletingId = e.currentTarget.dataset.del; confirm.classList.remove('hidden'); }));
}

// open edit
function openEdit(id) {
  editingId = id;
  const h = cache.find(x => x.id === id);
  if (!h) return alert("المستشفى غير موجود");

  document.getElementById("f_name").value = h.name || "";
  document.getElementById("f_city").value = h.city || "";
  document.getElementById("f_departments").value = h.departments || "";
  document.getElementById("f_phone").value = h.phone || "";
  document.getElementById("f_locationLink").value = h.locationLink || "";
  document.getElementById("f_description").value = h.description || "";

  modalTitle.textContent = "تعديل المستشفى";
  uploadStatus.textContent = "";
  modal.classList.remove("hidden");
}

// search
searchInput.addEventListener('input', ()=> renderTable(cache));

// helper escape
function escapeHtml(s) {
  if (s === undefined || s === null) return "";
  return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c]);
}
