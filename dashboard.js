// ==============================
// Firebase imports
// ==============================
import { db, auth } from "./firebase-config.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// ==============================
// حماية الصفحة
// ==============================
onAuthStateChanged(auth, (user) => {
  if (!user) window.location.href = "login.html";
});

// ==============================
// عناصر التنقل
// ==============================
const navDashboard = document.getElementById("navDashboard");
const navDoctors = document.getElementById("navDoctors");
const navHospitals = document.getElementById("navHospitals");

const dashboardStats = document.getElementById("dashboardStats");
const doctorsSection = document.getElementById("doctorsSection");
const hospitalsSection = document.getElementById("hospitalsSection");

const pageTitle = document.getElementById("pageTitle");

// زر الإضافة أعلى الصفحة
const btnAddDoctor = document.getElementById("openAddDoctor");
const btnAddHospital = document.getElementById("openAddHospital");

function showPage(page) {
  dashboardStats.classList.add("hidden");
  doctorsSection.classList.add("hidden");
  hospitalsSection.classList.add("hidden");

  navDashboard.classList.remove("active");
  navDoctors.classList.remove("active");
  navHospitals.classList.remove("active");

  btnAddDoctor.classList.add("hidden");
  btnAddHospital.classList.add("hidden");

  if (page === "dashboard") {
    pageTitle.textContent = "لوحة التحكم";
    dashboardStats.classList.remove("hidden");
    navDashboard.classList.add("active");
    loadCounts();
  }

  if (page === "doctors") {
    pageTitle.textContent = "قائمة الأطباء";
    doctorsSection.classList.remove("hidden");
    navDoctors.classList.add("active");
    btnAddDoctor.classList.remove("hidden");
    loadDoctors();
  }

  if (page === "hospitals") {
    pageTitle.textContent = "المستشفيات";
    hospitalsSection.classList.remove("hidden");
    navHospitals.classList.add("active");
    btnAddHospital.classList.remove("hidden");
    loadHospitals();
  }
}

navDashboard.onclick = () => showPage("dashboard");
navDoctors.onclick = () => showPage("doctors");
navHospitals.onclick = () => showPage("hospitals");

// ==============================
// مودالات الإضافة
// ==============================
const doctorModal = document.getElementById("doctorModal");
const hospitalModal = document.getElementById("hospitalModal");

document.getElementById("closeDoctorModal").onclick = () =>
  doctorModal.classList.add("hidden");

document.getElementById("closeHospitalModal").onclick = () =>
  hospitalModal.classList.add("hidden");

btnAddDoctor.onclick = () => doctorModal.classList.remove("hidden");
btnAddHospital.onclick = () => hospitalModal.classList.remove("hidden");

// ==============================
// إضافة طبيب
// ==============================
document.getElementById("doctorForm").onsubmit = async (e) => {
  e.preventDefault();

  await addDoc(collection(db, "doctors"), {
    name: d_name.value,
    specialty: d_specialty.value,
    phone: d_phone.value,
    hospital: d_hospital.value,
    schedule: {
      sat: sat.value,
      sun: sun.value,
      mon: mon.value,
      tue: tue.value,
      wed: wed.value,
      thu: thu.value,
      fri: fri.value
    }
  });

  doctorModal.classList.add("hidden");
  e.target.reset();
  loadDoctors();
};

// ==============================
// إضافة مستشفى
// ==============================
document.getElementById("hospitalForm").onsubmit = async (e) => {
  e.preventDefault();

  await addDoc(collection(db, "hospitals"), {
    name: h_name.value,
    city: h_city.value,
    phone: h_phone.value,
    department: h_department.value,
    description: h_description.value
  });

  hospitalModal.classList.add("hidden");
  e.target.reset();
  loadHospitals();
};

// ==============================
// تحميل عدد الإحصائيات
// ==============================
async function loadCounts() {
  const doctors = await getDocs(collection(db, "doctors"));
  const hospitals = await getDocs(collection(db, "hospitals"));

  document.getElementById("totalDoctors").textContent = doctors.size;
  document.getElementById("totalHospitals").textContent = hospitals.size;
}

// ==============================
// تحميل الأطباء
// ==============================
async function loadDoctors() {
  const tbody = document.getElementById("doctorsTbody");
  tbody.innerHTML = "";

  const snap = await getDocs(collection(db, "doctors"));

  snap.forEach((docItem) => {
    const d = docItem.data();
    const id = docItem.id;

    tbody.innerHTML += `
      <tr>
        <td>${d.name}</td>
        <td>${d.specialty}</td>
        <td>${d.hospital}</td>
        <td>7</td>
        <td>
          السبت: ${d.schedule.sat || "-"}<br>
          الأحد: ${d.schedule.sun || "-"}<br>
          الاثنين: ${d.schedule.mon || "-"}<br>
          الثلاثاء: ${d.schedule.tue || "-"}<br>
          الأربعاء: ${d.schedule.wed || "-"}<br>
          الخميس: ${d.schedule.thu || "-"}<br>
          الجمعة: ${d.schedule.fri || "-"}
        </td>
        <td>
          <button class="btn" onclick="editDoctor('${id}')">تعديل</button>
          <button class="btn" onclick="confirmDelete('doctors','${id}')">حذف</button>
        </td>
      </tr>
    `;
  });
}

// ==============================
// تحميل المستشفيات
// ==============================
async function loadHospitals() {
  const tbody = document.getElementById("hospitalsTbody");
  tbody.innerHTML = "";

  const snap = await getDocs(collection(db, "hospitals"));

  snap.forEach((docItem) => {
    const h = docItem.data();
    const id = docItem.id;

    tbody.innerHTML += `
      <tr>
        <td>${h.name}</td>
        <td>${h.city}</td>
        <td>${h.phone}</td>
        <td>
          <button class="btn" onclick="editHospital('${id}')">تعديل</button>
          <button class="btn" onclick="confirmDelete('hospitals','${id}')">حذف</button>
        </td>
      </tr>
    `;
  });
}

// ==============================
// التعديل — طبيب
// ==============================
const editModal = document.getElementById("doctorModal");
const doctorModalTitle = document.getElementById("doctorModalTitle");

window.editDoctor = async (id) => {
  doctorModalTitle.textContent = "تعديل طبيب";
  doctorModal.classList.remove("hidden");

  const ref = doc(db, "doctors", id);
  const item = (await getDocs(collection(db, "doctors"))).docs
    .find((d) => d.id === id)
    .data();

  d_name.value = item.name;
  d_specialty.value = item.specialty;
  d_phone.value = item.phone;
  d_hospital.value = item.hospital;

  sat.value = item.schedule.sat || "";
  sun.value = item.schedule.sun || "";
  mon.value = item.schedule.mon || "";
  tue.value = item.schedule.tue || "";
  wed.value = item.schedule.wed || "";
  thu.value = item.schedule.thu || "";
  fri.value = item.schedule.fri || "";

  doctorForm.onsubmit = async (e) => {
    e.preventDefault();

    await updateDoc(ref, {
      name: d_name.value,
      specialty: d_specialty.value,
      phone: d_phone.value,
      hospital: d_hospital.value,
      schedule: {
        sat: sat.value,
        sun: sun.value,
        mon: mon.value,
        tue: tue.value,
        wed: wed.value,
        thu: thu.value,
        fri: fri.value
      }
    });

    doctorModal.classList.add("hidden");
    doctorModalTitle.textContent = "إضافة طبيب";
    doctorForm.reset();
    loadDoctors();
  };
};

// ==============================
// تعديل — مستشفى
// ==============================
window.editHospital = async (id) => {
  hospitalModalTitle.textContent = "تعديل مستشفى";
  hospitalModal.classList.remove("hidden");

  const ref = doc(db, "hospitals", id);
  const snap = (await getDocs(collection(db, "hospitals"))).docs
    .find((d) => d.id === id)
    .data();

  h_name.value = snap.name;
  h_city.value = snap.city;
  h_phone.value = snap.phone;
  h_department.value = snap.department || "";
  h_description.value = snap.description || "";

  hospitalForm.onsubmit = async (e) => {
    e.preventDefault();

    await updateDoc(ref, {
      name: h_name.value,
      city: h_city.value,
      phone: h_phone.value,
      department: h_department.value,
      description: h_description.value
    });

    hospitalModal.classList.add("hidden");
    hospitalForm.reset();
    loadHospitals();
  };
};

// ==============================
// الحذف — تأكيد
// ==============================
const confirmModal = document.getElementById("confirm");
const confirmYes = document.getElementById("confirmYes");
const confirmNo = document.getElementById("confirmNo");

let deleteType = "";
let deleteID = "";

window.confirmDelete = (type, id) => {
  deleteType = type;
  deleteID = id;
  confirmModal.classList.remove("hidden");
};

confirmNo.onclick = () => confirmModal.classList.add("hidden");

confirmYes.onclick = async () => {
  await deleteDoc(doc(db, deleteType, deleteID));
  confirmModal.classList.add("hidden");

  if (deleteType === "doctors") loadDoctors();
  if (deleteType === "hospitals") loadHospitals();
};

// ==============================
// Logout
// ==============================
document.getElementById("logout").onclick = async () => {
  await signOut(auth);
  window.location.href = "login.html";
};

// أول صفحة تعمل
showPage("dashboard");
