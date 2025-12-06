// ==============================
// حماية الداشبورد
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
deleteDoc,
doc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// منع الدخول لغير المسجلين
onAuthStateChanged(auth, (user) => {
if (!user) {
window.location.href = "login.html";
}
});

// ==============================
// Navigation
// ==============================
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
// Doctor Modal
// ==============================
const doctorModal = document.getElementById("doctorModal");
const closeDoctorModal = document.getElementById("closeDoctorModal");
const doctorForm = document.getElementById("doctorForm");

btnAddDoctor.onclick = () => doctorModal.classList.remove("hidden");
closeDoctorModal.onclick = () => doctorModal.classList.add("hidden");

doctorForm.onsubmit = async (e) => {
e.preventDefault();

const name = document.getElementById("d_name").value;
const specialty = document.getElementById("d_specialty").value;
const phone = document.getElementById("d_phone").value;
const hospital = document.getElementById("d_hospital").value;

const schedule = {
saturday: { time: document.getElementById("sat").value },
sunday: { time: document.getElementById("sun").value },
monday: { time: document.getElementById("mon").value },
tuesday: { time: document.getElementById("tue").value },
wednesday: { time: document.getElementById("wed").value },
thursday: { time: document.getElementById("thu").value },
friday: { time: document.getElementById("fri").value }
};

await addDoc(collection(db, "doctors"), {
name,
specialty,
phone,
hospital,
schedule
});

doctorModal.classList.add("hidden");
doctorForm.reset();
loadDoctors();
};

// ==============================
// Hospital Modal
// ==============================
const hospitalModal = document.getElementById("hospitalModal");
const closeHospitalModal = document.getElementById("closeHospitalModal");
const hospitalForm = document.getElementById("hospitalForm");

btnAddHospital.onclick = () => hospitalModal.classList.remove("hidden");
closeHospitalModal.onclick = () => hospitalModal.classList.add("hidden");

hospitalForm.onsubmit = async (e) => {
e.preventDefault();

await addDoc(collection(db, "hospitals"), {
name: document.getElementById("h_name").value,
city: document.getElementById("h_city").value,
phone: document.getElementById("h_phone").value,
department: document.getElementById("h_department").value,
description: document.getElementById("h_description").value
});

hospitalModal.classList.add("hidden");
hospitalForm.reset();
loadHospitals();
};

// ==============================
// LOAD DOCTORS
// ==============================
async function loadDoctors() {
const tbody = document.getElementById("doctorsTbody");
tbody.innerHTML = "";

const snap = await getDocs(collection(db, "doctors"));

snap.forEach((docItem) => {
const d = docItem.data();
const id = docItem.id;

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
      <button class="btn" onclick="deleteDoctor('${id}')">حذف</button>  
    </td>  
  </tr>  
`;

});
}

// ==============================
// LOAD HOSPITALS
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
    <td>${h.department || "—"}</td>  
    <td>${h.description || "—"}</td>  
    <td>  
      <button class="btn" onclick="deleteHospital('${id}')">حذف</button>  
    </td>  
  </tr>  
`;

});
}

// ==============================
// DELETE FUNCTIONS
// ==============================
window.deleteDoctor = async (id) => {
if (confirm("هل تريد حذف الطبيب؟")) {
await deleteDoc(doc(db, "doctors", id));
loadDoctors();
}
};

window.deleteHospital = async (id) => {
if (confirm("هل تريد حذف المستشفى؟")) {
await deleteDoc(doc(db, "hospitals", id));
loadHospitals();
}
};

// ==============================
// Logout
// ==============================
document.getElementById("logout").onclick = async () => {
await signOut(auth);
window.location.href = "login.html";
};

// ==============================
// Initial Page
// ==============================
showPage("dashboard");
