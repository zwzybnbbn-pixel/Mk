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
  getDoc,
  updateDoc,
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

let editingDoctorId = null;

btnAddDoctor.onclick = () => {
  editingDoctorId = null;
  doctorModal.classList.remove("hidden");
};

closeDoctorModal.onclick = () => doctorModal.classList.add("hidden");


doctorForm.onsubmit = async (e) => {
  e.preventDefault();

  const data = {
    name: document.getElementById("d_name").value,
    specialty: document.getElementById("d_specialty").value,
    phone: document.getElementById("d_phone").value,
    hospital: document.getElementById("d_hospital").value,
    img: document.getElementById("d_img").value,
    schedule: {
      saturday: { time: document.getElementById("sat").value },
      sunday: { time: document.getElementById("sun").value },
      monday: { time: document.getElementById("mon").value },
      tuesday: { time: document.getElementById("tue").value },
      wednesday: { time: document.getElementById("wed").value },
      thursday: { time: document.getElementById("thu").value },
      friday: { time: document.getElementById("fri").value }
    }
  };

  if (editingDoctorId) {
    await updateDoc(doc(db, "doctors", editingDoctorId), data);
  } else {
    await addDoc(collection(db, "doctors"), data);
  }

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

let editingHospitalId = null;

btnAddHospital.onclick = () => {
  editingHospitalId = null;
  hospitalModal.classList.remove("hidden");
};

closeHospitalModal.onclick = () => hospitalModal.classList.add("hidden");


hospitalForm.onsubmit = async (e) => {
  e.preventDefault();

  const data = {
    name: document.getElementById("h_name").value,
    city: document.getElementById("h_city").value,
    phone: document.getElementById("h_phone").value,
    department: document.getElementById("h_department").value,
    description: document.getElementById("h_description").value,
    img: document.getElementById("h_img").value,
    map: document.getElementById("h_map").value
  };

  if (editingHospitalId) {
    await updateDoc(doc(db, "hospitals", editingHospitalId), data);
  } else {
    await addDoc(collection(db, "hospitals"), data);
  }

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

    tbody.innerHTML += `
      <tr>
        <td><img src="${d.img}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;margin-left:8px;"> ${d.name}</td>
        <td>${d.specialty}</td>
        <td>${d.hospital}</td>
        <td>7 أيام</td>
        <td><button onclick="editDoctor('${id}')">تعديل</button>
            <button onclick="deleteDoctor('${id}')">حذف</button>
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
        <td><img src="${h.img}" style="width:50px;height:50px;border-radius:8px;margin-left:8px;"> ${h.name}</td>
        <td>${h.city}</td>
        <td>${h.phone}</td>
        <td>
          <button onclick="editHospital('${id}')">تعديل</button>
          <button onclick="deleteHospital('${id}')">حذف</button>
        </td>
      </tr>
    `;
  });
}


// ==============================
// EDIT DOCTOR — (تم إصلاحها ✔)
// ==============================
window.editDoctor = async (id) => {
  const ref = doc(db, "doctors", id);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    const d = snap.data();
    editingDoctorId = id;

    document.getElementById("d_name").value = d.name;
    document.getElementById("d_specialty").value = d.specialty;
    document.getElementById("d_phone").value = d.phone;
    document.getElementById("d_hospital").value = d.hospital;
    document.getElementById("d_img").value = d.img;

    document.getElementById("d_preview").src = d.img;
    document.getElementById("d_preview").style.display = "block";

    doctorModal.classList.remove("hidden");
  }
};


// ==============================
// EDIT HOSPITAL
// ==============================
window.editHospital = async (id) => {
  const ref = doc(db, "hospitals", id);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    const h = snap.data();
    editingHospitalId = id;

    document.getElementById("h_name").value = h.name;
    document.getElementById("h_city").value = h.city;
    document.getElementById("h_phone").value = h.phone;
    document.getElementById("h_department").value = h.department;
    document.getElementById("h_description").value = h.description;
    document.getElementById("h_img").value = h.img;
    document.getElementById("h_map").value = h.map || "";

    document.getElementById("h_preview").src = h.img;
    document.getElementById("h_preview").style.display = "block";

    hospitalModal.classList.remove("hidden");
  }
};


// ==============================
// DELETE
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
// Search Doctors
// ==============================
const doctorSearch = document.getElementById("searchDoctors");

doctorSearch.addEventListener("input", () => {
  const value = doctorSearch.value.toLowerCase();
  const rows = document.querySelectorAll("#doctorsTbody tr");

  rows.forEach((row) => {
    const text = row.innerText.toLowerCase();
    row.style.display = text.includes(value) ? "" : "none";
  });
});
// ==============================
// Search Hospitals
// ==============================
const hospitalSearch = document.getElementById("searchHospitals");

hospitalSearch.addEventListener("input", () => {
  const value = hospitalSearch.value.toLowerCase();
  const rows = document.querySelectorAll("#hospitalsTbody tr");

  rows.forEach((row) => {
    const text = row.innerText.toLowerCase();
    row.style.display = text.includes(value) ? "" : "none";
  });
});
// ==============================
// Initial Page
// ==============================
showPage("dashboard");


