/* ـــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــ
   حماية الداشبورد
ــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــ */
import { db, auth } from "./firebase-config.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

onAuthStateChanged(auth, (user) => {
  if (!user) window.location.href = "login.html";
});

/* ـــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــ
   Navigation
ــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــ */
const navDashboard = document.getElementById("navDashboard");
const navDoctors = document.getElementById("navDoctors");
const navHospitals = document.getElementById("navHospitals");

const dashboardStats = document.getElementById("dashboardStats");
const doctorsSection = document.getElementById("doctorsSection");
const hospitalsSection = document.getElementById("hospitalsSection");

const pageTitle = document.getElementById("pageTitle");
const btnAddDoctor = document.getElementById("openAddDoctor");
const btnAddHospital = document.getElementById("openAddHospital");

function showPage(page) {
  dashboardStats.classList.add("hidden");
  doctorsSection.classList.add("hidden");
  hospitalsSection.classList.add("hidden");

  btnAddDoctor.classList.add("hidden");
  btnAddHospital.classList.add("hidden");

  navDashboard.classList.remove("active");
  navDoctors.classList.remove("active");
  navHospitals.classList.remove("active");

  if (page === "dashboard") {
    pageTitle.textContent = "لوحة التحكم";
    dashboardStats.classList.remove("hidden");
    navDashboard.classList.add("active");
    loadStats();
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

/* ـــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــ
   Doctor Modal + Edit Mode
ــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــ */

let editDoctorId = null;

const doctorModal = document.getElementById("doctorModal");
const closeDoctorModal = document.getElementById("closeDoctorModal");
const doctorForm = document.getElementById("doctorForm");

btnAddDoctor.onclick = () => {
  doctorModal.classList.remove("hidden");
  document.getElementById("doctorModalTitle").textContent = "إضافة طبيب";
  editDoctorId = null;
  doctorForm.reset();
};

closeDoctorModal.onclick = () => doctorModal.classList.add("hidden");

doctorForm.onsubmit = async (e) => {
  e.preventDefault();

  const data = {
    name: d_name.value,
    specialty: d_specialty.value,
    phone: d_phone.value,
    hospital: d_hospital.value,
    schedule: {
      saturday: { time: sat.value },
      sunday: { time: sun.value },
      monday: { time: mon.value },
      tuesday: { time: tue.value },
      wednesday: { time: wed.value },
      thursday: { time: thu.value },
      friday: { time: fri.value }
    }
  };

  if (editDoctorId) {
    // تعديل
    await updateDoc(doc(db, "doctors", editDoctorId), data);
  } else {
    // إضافة
    await addDoc(collection(db, "doctors"), data);
  }

  doctorModal.classList.add("hidden");
  doctorForm.reset();
  loadDoctors();
  loadStats();
};

window.editDoctor = async (id) => {
  editDoctorId = id;

  const snap = await getDocs(collection(db, "doctors"));
  snap.forEach((docItem) => {
    if (docItem.id === id) {
      const d = docItem.data();

      d_name.value = d.name;
      d_specialty.value = d.specialty;
      d_phone.value = d.phone;
      d_hospital.value = d.hospital;

      sat.value = d.schedule.saturday.time;
      sun.value = d.schedule.sunday.time;
      mon.value = d.schedule.monday.time;
      tue.value = d.schedule.tuesday.time;
      wed.value = d.schedule.wednesday.time;
      thu.value = d.schedule.thursday.time;
      fri.value = d.schedule.friday.time;

      doctorModal.classList.remove("hidden");
      document.getElementById("doctorModalTitle").textContent = "تعديل طبيب";
    }
  });
};

/* ـــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــ
   Hospital Modal + Edit Mode
ــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــ */

let editHospitalId = null;

const hospitalModal = document.getElementById("hospitalModal");
const closeHospitalModal = document.getElementById("closeHospitalModal");
const hospitalForm = document.getElementById("hospitalForm");

btnAddHospital.onclick = () => {
  hospitalModal.classList.remove("hidden");
  document.getElementById("hospitalModalTitle").textContent = "إضافة مستشفى";
  editHospitalId = null;
  hospitalForm.reset();
};

closeHospitalModal.onclick = () => hospitalModal.classList.add("hidden");

hospitalForm.onsubmit = async (e) => {
  e.preventDefault();

  const data = {
    name: h_name.value,
    city: h_city.value,
    phone: h_phone.value,
    department: h_department.value,
    description: h_description.value
  };

  if (editHospitalId) {
    await updateDoc(doc(db, "hospitals", editHospitalId), data);
  } else {
    await addDoc(collection(db, "hospitals"), data);
  }

  hospitalModal.classList.add("hidden");
  hospitalForm.reset();
  loadHospitals();
  loadStats();
};

window.editHospital = async (id) => {
  editHospitalId = id;

  const snap = await getDocs(collection(db, "hospitals"));
  snap.forEach((docItem) => {
    if (docItem.id === id) {
      const h = docItem.data();

      h_name.value = h.name;
      h_city.value = h.city;
      h_phone.value = h.phone;
      h_department.value = h.department || "";
      h_description.value = h.description || "";

      hospitalModal.classList.remove("hidden");
      document.getElementById("hospitalModalTitle").textContent = "تعديل مستشفى";
    }
  });
};

/* ـــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــ
   LOAD DOCTORS + SEARCH
ــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــ */

async function loadDoctors() {
  const tbody = document.getElementById("doctorsTbody");
  const search = document.getElementById("searchDoctors").value.toLowerCase();

  tbody.innerHTML = "";
  const snap = await getDocs(collection(db, "doctors"));

  snap.forEach((docItem) => {
    const d = docItem.data();
    const id = docItem.id;

    if (
      !d.name.toLowerCase().includes(search) &&
      !d.specialty.toLowerCase().includes(search)
    ) return;

    const allDays = `
      السبت: ${d.schedule.saturday.time}<br>
      الأحد: ${d.schedule.sunday.time}<br>
      الاثنين: ${d.schedule.monday.time}<br>
      الثلاثاء: ${d.schedule.tuesday.time}<br>
      الأربعاء: ${d.schedule.wednesday.time}<br>
      الخميس: ${d.schedule.thursday.time}<br>
      الجمعة: ${d.schedule.friday.time}
    `;

    tbody.innerHTML += `
      <tr>
        <td>${d.name}</td>
        <td>${d.specialty}</td>
        <td>${d.hospital}</td>
        <td>7 أيام</td>
        <td>${allDays}</td>
        <td>
          <button class="btn" onclick="editDoctor('${id}')">تعديل</button>
          <button class="btn" onclick="deleteDoctor('${id}')">حذف</button>
        </td>
      </tr>
    `;
  });
}

document.getElementById("searchDoctors").oninput = loadDoctors;

/* ـــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــ
   LOAD HOSPITALS + SEARCH
ــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــ */

async function loadHospitals() {
  const tbody = document.getElementById("hospitalsTbody");
  const search = document.getElementById("searchHospitals").value.toLowerCase();

  tbody.innerHTML = "";
  const snap = await getDocs(collection(db, "hospitals"));

  snap.forEach((docItem) => {
    const h = docItem.data();
    const id = docItem.id;

    if (!h.name.toLowerCase().includes(search)) return;

    tbody.innerHTML += `
      <tr>
        <td>${h.name}</td>
        <td>${h.city}</td>
        <td>${h.phone}</td>
        <td>
          <button class="btn" onclick="editHospital('${id}')">تعديل</button>
          <button class="btn" onclick="deleteHospital('${id}')">حذف</button>
        </td>
      </tr>
    `;
  });
}

document.getElementById("searchHospitals").oninput = loadHospitals;

/* ـــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــ
   DELETE
ــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــ */

window.deleteDoctor = async (id) => {
  if (confirm("هل تريد حذف الطبيب؟")) {
    await deleteDoc(doc(db, "doctors", id));
    loadDoctors();
    loadStats();
  }
};

window.deleteHospital = async (id) => {
  if (confirm("هل تريد حذف المستشفى؟")) {
    await deleteDoc(doc(db, "hospitals", id));
    loadHospitals();
    loadStats();
  }
};

/* ـــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــ
   STATS
ــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــ */
async function loadStats() {
  const doctorsSnap = await getDocs(collection(db, "doctors"));
  const hospitalsSnap = await getDocs(collection(db, "hospitals"));

  document.getElementById("totalDoctors").textContent = doctorsSnap.size;
  document.getElementById("totalHospitals").textContent = hospitalsSnap.size;
}

/* ـــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــ
   Logout
ــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــ */
document.getElementById("logout").onclick = async () => {
  await signOut(auth);
  window.location.href = "login.html";
};

/* ـــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــ
   Initial Page
ــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــ */
showPage("dashboard");
