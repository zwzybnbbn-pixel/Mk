// dashboard.js (محدث — يدعم الأطباء + المستشفيات + زر العودة)
import { db, auth } from "./firebase-config.js";
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

/* ================== عناصر DOM ================== */
const navDashboard = document.getElementById("navDashboard");
const navDoctors = document.getElementById("navDoctors");
const navHospitals = document.getElementById("navHospitals");

const pageTitle = document.getElementById("pageTitle");
const openAddDoctor = document.getElementById("openAddDoctor");
const openAddHospital = document.getElementById("openAddHospital");
const logoutBtn = document.getElementById("logout");

const doctorsSection = document.getElementById("doctorsSection");
const hospitalsSection = document.getElementById("hospitalsSection");

const totalDoctorsEl = document.getElementById("totalDoctors");
const totalHospitalsEl = document.getElementById("totalHospitals");

const searchDoctors = document.getElementById("searchDoctors");
const searchHospitals = document.getElementById("searchHospitals");
const doctorsTbody = document.getElementById("doctorsTbody");
const hospitalsTbody = document.getElementById("hospitalsTbody");

/* === مودالات الأطباء === */
const doctorModal = document.getElementById("doctorModal");
const doctorModalTitle = document.getElementById("doctorModalTitle");
const doctorForm = document.getElementById("doctorForm");
const d_name = document.getElementById("d_name");
const d_specialty = document.getElementById("d_specialty");
const d_hospital = document.getElementById("d_hospital");
const d_days = document.getElementById("d_days");
const d_times = document.getElementById("d_times");
const closeDoctorModal = document.getElementById("closeDoctorModal");

/* ⭐ زر العودة للطبيب */
const backDoctorBtn = document.getElementById("backDoctorBtn");

/* === مودالات المستشفيات === */
const hospitalModal = document.getElementById("hospitalModal");
const hospitalModalTitle = document.getElementById("hospitalModalTitle");
const hospitalForm = document.getElementById("hospitalForm");
const h_name = document.getElementById("h_name");
const h_city = document.getElementById("h_city");
const h_phone = document.getElementById("h_phone");
const h_desc = document.getElementById("h_desc");
const h_departments = document.getElementById("h_departments");
const h_location = document.getElementById("h_location");
const h_image = document.getElementById("h_image");
const closeHospitalModal = document.getElementById("closeHospitalModal");

/* ⭐ زر العودة للمستشفى */
const backHospitalBtn = document.getElementById("backHospitalBtn");

/* === تأكيد حذف === */
const confirmBox = document.getElementById("confirm");
const confirmYes = document.getElementById("confirmYes");
const confirmNo = document.getElementById("confirmNo");

/* ================== متغيرات الحالة ================== */
let doctorsList = [];
let hospitalsList = [];

let doctorEditId = null;
let hospitalEditId = null;

let pendingDelete = { type: null, id: null };

/* ================== الحماية ================== */
onAuthStateChanged(auth, user => {
  if (!user) {
    location.href = "login.html";
    return;
  }
  showDoctorsSection();
  loadAll();
});

/* ================== الواجهة ================== */
if (navDoctors) navDoctors.addEventListener("click", showDoctorsSection);
if (navHospitals) navHospitals.addEventListener("click", showHospitalsSection);
if (navDashboard) navDashboard.addEventListener("click", () => {
  showDoctorsSection();
});

/* ================== عرض الأقسام ================== */
function showDoctorsSection() {
  doctorsSection.classList.remove("hidden");
  hospitalsSection.classList.add("hidden");
  pageTitle.textContent = "قائمة الأطباء";
  openAddDoctor.classList.remove("hidden");
  openAddHospital.classList.add("hidden");
  navDoctors.classList.add("active");
  navHospitals.classList.remove("active");
}
function showHospitalsSection() {
  hospitalsSection.classList.remove("hidden");
  doctorsSection.classList.add("hidden");
  pageTitle.textContent = "قائمة المستشفيات";
  openAddDoctor.classList.add("hidden");
  openAddHospital.classList.remove("hidden");
  navHospitals.classList.add("active");
  navDoctors.classList.remove("active");
}

/* ================== تحميل البيانات ================== */
async function loadAll() {
  await Promise.all([loadDoctors(), loadHospitals()]);
}

/* ================== DOCTORS CRUD ================== */
async function loadDoctors() {
  try {
    const snap = await getDocs(collection(db, "doctors"));
    doctorsList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderDoctors(doctorsList);
    totalDoctorsEl.textContent = doctorsList.length;
  } catch (err) {
    console.error("خطأ في تحميل الأطباء:", err);
  }
}

function renderDoctors(list) {
  doctorsTbody.innerHTML = "";
  if (!list.length) {
    doctorsTbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:16px">لا يوجد أطباء</td></tr>`;
    return;
  }

  list.forEach(d => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(d.name)}</td>
      <td>${escapeHtml(d.specialty)}</td>
      <td>${escapeHtml(d.hospital)}</td>
      <td>${escapeHtml(d.days)}</td>
      <td>${escapeHtml(d.times)}</td>
      <td>
        <button class="btn primary" data-edit-doctor="${d.id}">تعديل</button>
        <button class="btn" data-del-doctor="${d.id}" style="background:#c62828">حذف</button>
      </td>
    `;
    doctorsTbody.appendChild(tr);
  });

  doctorsTbody.querySelectorAll("[data-edit-doctor]").forEach(b =>
    b.addEventListener("click", e => openEditDoctor(e.target.dataset.editDoctor))
  );
  doctorsTbody.querySelectorAll("[data-del-doctor]").forEach(b =>
    b.addEventListener("click", e => {
      pendingDelete = { type: "doctor", id: e.target.dataset.delDoctor };
      confirmBox.classList.remove("hidden");
    })
  );
}

function openAddDoctorModal() {
  doctorEditId = null;
  doctorForm.reset();
  doctorModalTitle.textContent = "إضافة طبيب";
  doctorModal.classList.remove("hidden");
}

function openEditDoctor(id) {
  const d = doctorsList.find(x => x.id === id);
  doctorEditId = id;
  d_name.value = d.name;
  d_specialty.value = d.specialty;
  d_hospital.value = d.hospital;
  d_days.value = d.days;
  d_times.value = d.times;
  doctorModalTitle.textContent = "تعديل طبيب";
  doctorModal.classList.remove("hidden");
}

doctorForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    name: d_name.value.trim(),
    specialty: d_specialty.value.trim(),
    hospital: d_hospital.value.trim(),
    days: d_days.value.trim(),
    times: d_times.value.trim(),
    updatedAt: serverTimestamp()
  };

  try {
    if (!doctorEditId) {
      payload.createdAt = serverTimestamp();
      await addDoc(collection(db, "doctors"), payload);
    } else {
      await updateDoc(doc(db, "doctors", doctorEditId), payload);
    }
    doctorModal.classList.add("hidden");
    await loadDoctors();
  } catch (err) {
    console.error("خطأ حفظ الطبيب:", err);
  }
});

if (closeDoctorModal) closeDoctorModal.addEventListener("click", () =>
  doctorModal.classList.add("hidden")
);

/* ⭐ زر العودة للطبيب */
if (backDoctorBtn) {
  backDoctorBtn.addEventListener("click", () => {
    doctorModal.classList.add("hidden");
    showDoctorsSection();
  });
}

/* ================== HOSPITAL CRUD ================== */
async function loadHospitals() {
  try {
    const snap = await getDocs(collection(db, "hospitals"));
    hospitalsList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderHospitals(hospitalsList);
    totalHospitalsEl.textContent = hospitalsList.length;
  } catch (err) {
    console.error("خطأ في تحميل المستشفيات:", err);
  }
}

function renderHospitals(list) {
  hospitalsTbody.innerHTML = "";
  if (!list.length) {
    hospitalsTbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:16px">لا توجد مستشفيات</td></tr>`;
    return;
  }

  list.forEach(h => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(h.name)}</td>
      <td>${escapeHtml(h.city)}</td>
      <td>${escapeHtml(h.phone)}</td>
      <td>
        <button class="btn primary" data-edit-hospital="${h.id}">تعديل</button>
        <button class="btn" data-del-hospital="${h.id}" style="background:#c62828">حذف</button>
      </td>
    `;
    hospitalsTbody.appendChild(tr);
  });

  hospitalsTbody.querySelectorAll("[data-edit-hospital]").forEach(b =>
    b.addEventListener("click", e => openEditHospital(e.target.dataset.editHospital))
  );
  hospitalsTbody.querySelectorAll("[data-del-hospital]").forEach(b =>
    b.addEventListener("click", e => {
      pendingDelete = { type: "hospital", id: e.target.dataset.delHospital };
      confirmBox.classList.remove("hidden");
    })
  );
}

function openAddHospitalModal() {
  hospitalEditId = null;
  hospitalForm.reset();
  hospitalModalTitle.textContent = "إضافة مستشفى";
  hospitalModal.classList.remove("hidden");
}

function openEditHospital(id) {
  const h = hospitalsList.find(x => x.id === id);
  hospitalEditId = id;

  h_name.value = h.name;
  h_city.value = h.city;
  h_phone.value = h.phone;
  h_desc.value = h.description || "";
  h_departments.value = h.departments || "";
  h_location.value = h.locationLink || "";
  h_image.value = h.image || "";

  hospitalModalTitle.textContent = "تعديل مستشفى";
  hospitalModal.classList.remove("hidden");
}

hospitalForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    name: h_name.value.trim(),
    city: h_city.value.trim(),
    phone: h_phone.value.trim(),
    description: h_desc.value.trim(),
    departments: h_departments.value.trim(),
    locationLink: h_location.value.trim(),
    image: h_image.value.trim(),
    updatedAt: serverTimestamp()
  };

  try {
    if (!hospitalEditId) {
      payload.createdAt = serverTimestamp();
      await addDoc(collection(db, "hospitals"), payload);
    } else {
      await updateDoc(doc(db, "hospitals", hospitalEditId), payload);
    }
    hospitalModal.classList.add("hidden");
    await loadHospitals();
  } catch (err) {
    console.error("خطأ حفظ المستشفى:", err);
  }
});

if (closeHospitalModal)
  closeHospitalModal.addEventListener("click", () =>
    hospitalModal.classList.add("hidden")
  );

/* ⭐ زر العودة للمستشفى */
if (backHospitalBtn) {
  backHospitalBtn.addEventListener("click", () => {
    hospitalModal.classList.add("hidden");
    showHospitalsSection();
  });
}

/* ================== الحذف ================== */
confirmYes.addEventListener("click", async () => {
  if (!pendingDelete.id) return;

  try {
    if (pendingDelete.type === "doctor") {
      await deleteDoc(doc(db, "doctors", pendingDelete.id));
      await loadDoctors();
    } else {
      await deleteDoc(doc(db, "hospitals", pendingDelete.id));
      await loadHospitals();
    }
  } catch (err) {
    console.error("خطأ الحذف:", err);
  }

  confirmBox.classList.add("hidden");
  pendingDelete = { type: null, id: null };
});

confirmNo.addEventListener("click", () => {
  confirmBox.classList.add("hidden");
  pendingDelete = { type: null, id: null };
});

/* ================== البحث ================== */
if (searchDoctors) {
  searchDoctors.addEventListener("input", () => {
    const q = searchDoctors.value.toLowerCase();
    const filtered = doctorsList.filter(d =>
      d.name.toLowerCase().includes(q) ||
      d.specialty.toLowerCase().includes(q) ||
      d.hospital.toLowerCase().includes(q)
    );
    renderDoctors(filtered);
  });
}

if (searchHospitals) {
  searchHospitals.addEventListener("input", () => {
    const q = searchHospitals.value.toLowerCase();
    const filtered = hospitalsList.filter(h =>
      h.name.toLowerCase().includes(q) ||
      h.city.toLowerCase().includes(q) ||
      (h.departments || "").toLowerCase().includes(q)
    );
    renderHospitals(filtered);
  });
}

/* ================== تسجيل الخروج ================== */
if (logoutBtn)
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    location.href = "login.html";
  });

/* ================== HTML Escape ================== */
function escapeHtml(s) {
  if (!s) return "";
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/* ================== تحميل مبدئي ================== */
(async function init() {
  showDoctorsSection();
  await loadAll();
})();
