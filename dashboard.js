import { db } from "./firebase-config.js";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";


// =======================
//   إضافة طبيب
// =======================
window.addDoctor = async function() {
  const name = document.getElementById("docName").value;
  const specialty = document.getElementById("docSpecialty").value;
  const hospital = document.getElementById("docHospital").value;

  if (!name || !specialty || !hospital) {
    alert("املأ جميع البيانات");
    return;
  }

  await addDoc(collection(db, "doctors"), {
    name,
    specialty,
    hospital
  });

  loadDoctors();
};


// =======================
//   عرض الأطباء
// =======================
async function loadDoctors() {
  const list = document.getElementById("doctorsList");
  list.innerHTML = "جارِ التحميل...";

  const q = await getDocs(collection(db, "doctors"));
  list.innerHTML = "";

  q.forEach((d) => {
    const data = d.data();

    const item = document.createElement("div");
    item.className = "box";

    item.innerHTML = `
      <h3>${data.name}</h3>
      <p><strong>التخصص:</strong> ${data.specialty}</p>
      <p><strong>المستشفى:</strong> ${data.hospital}</p>

      <button class="edit-btn" onclick="editDoctorPrompt('${d.id}', '${data.name}', '${data.specialty}', '${data.hospital}')">تعديل</button>
      <button class="delete-btn" onclick="deleteDoctor('${d.id}')">حذف</button>
    `;

    list.appendChild(item);
  });
}

window.editDoctorPrompt = function(id, name, specialty, hospital) {
  const newName = prompt("اسم الطبيب:", name);
  const newSpecialty = prompt("التخصص:", specialty);
  const newHospital = prompt("المستشفى:", hospital);

  if (!newName || !newSpecialty || !newHospital) return;

  updateDoc(doc(db, "doctors", id), {
    name: newName,
    specialty: newSpecialty,
    hospital: newHospital
  });

  loadDoctors();
}

window.deleteDoctor = async function(id) {
  await deleteDoc(doc(db, "doctors", id));
  loadDoctors();
};


// =======================
//   إضافة مستشفى
// =======================
window.addHospital = async function() {
  const name = document.getElementById("hospName").value;
  const city = document.getElementById("hospCity").value;

  if (!name || !city) {
    alert("املأ البيانات");
    return;
  }

  await addDoc(collection(db, "hospitals"), {
    name,
    city
  });

  loadHospitals();
};


// =======================
//   عرض المستشفيات
// =======================
async function loadHospitals() {
  const list = document.getElementById("hospitalsList");
  list.innerHTML = "جارِ التحميل...";

  const q = await getDocs(collection(db, "hospitals"));
  list.innerHTML = "";

  q.forEach((d) => {
    const data = d.data();

    const item = document.createElement("div");
    item.className = "box";

    item.innerHTML = `
      <h3>${data.name}</h3>
      <p><strong>المدينة:</strong> ${data.city}</p>

      <button class="edit-btn" onclick="editHospitalPrompt('${d.id}', '${data.name}', '${data.city}')">تعديل</button>
      <button class="delete-btn" onclick="deleteHospital('${d.id}')">حذف</button>
    `;

    list.appendChild(item);
  });
}

window.editHospitalPrompt = function(id, name, city) {
  const newName = prompt("اسم المستشفى:", name);
  const newCity = prompt("المدينة:", city);

  if (!newName || !newCity) return;

  updateDoc(doc(db, "hospitals", id), {
    name: newName,
    city: newCity
  });

  loadHospitals();
}

window.deleteHospital = async function(id) {
  await deleteDoc(doc(db, "hospitals", id));
  loadHospitals();
};

// تحميل البيانات عند الدخول
loadDoctors();
loadHospitals();
