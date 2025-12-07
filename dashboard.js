import { auth, db } from "./firebase-config.js";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// ==============================
// فتح صفحة
// ==============================
function showPage(page) {
  document.getElementById("dashboardStats").classList.add("hidden");
  document.getElementById("doctorsSection").classList.add("hidden");
  document.getElementById("hospitalsSection").classList.add("hidden");

  if (page === "dashboard") {
    document.getElementById("dashboardStats").classList.remove("hidden");
  }
  if (page === "doctors") {
    document.getElementById("doctorsSection").classList.remove("hidden");
    loadDoctors();
  }
  if (page === "hospitals") {
    document.getElementById("hospitalsSection").classList.remove("hidden");
    loadHospitals();
  }
}

// ==============================
// عرض الأطباء
// ==============================
async function loadDoctors() {
  const tbody = document.getElementById("doctorsTbody");
  tbody.innerHTML = "<tr><td colspan='6'>جاري التحميل...</td></tr>";

  const snap = await getDocs(collection(db, "doctors"));

  if (snap.empty) {
    tbody.innerHTML = "<tr><td colspan='6'>لا يوجد أطباء</td></tr>";
    return;
  }

  let html = "";
  snap.forEach(docu => {
    const d = docu.data();
    html += `
      <tr>
        <td>${d.name}</td>
        <td>${d.specialty}</td>
        <td>${d.hospital}</td>
        <td>${d.days ?? "-"}</td>
        <td>${d.time ?? "-"}</td>
        <td>
          <button class="btn" onclick="deleteDoctor('${docu.id}')">حذف</button>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

// ==============================
// عرض المستشفيات
// ==============================
async function loadHospitals() {
  const tbody = document.getElementById("hospitalsTbody");
  tbody.innerHTML = "<tr><td colspan='4'>جاري التحميل...</td></tr>";

  const snap = await getDocs(collection(db, "hospitals"));

  if (snap.empty) {
    tbody.innerHTML = "<tr><td colspan='4'>لا يوجد مستشفيات</td></tr>";
    return;
  }

  let html = "";
  snap.forEach(docu => {
    const h = docu.data();
    html += `
      <tr>
        <td>${h.name}</td>
        <td>${h.city}</td>
        <td>${h.phone}</td>
        <td>
          <button class="btn" onclick="deleteHospital('${docu.id}')">حذف</button>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

// ==============================
// حذف طبيب
// ==============================
window.deleteDoctor = async function(id) {
  await deleteDoc(doc(db, "doctors", id));
  loadDoctors();
};

// ==============================
// حذف مستشفى
// ==============================
window.deleteHospital = async function(id) {
  await deleteDoc(doc(db, "hospitals", id));
  loadHospitals();
};

// ==============================
// تحديث عداد الإحصائيات
// ==============================
export async function updateDashboardStats() {
  const doctorsSnap = await getDocs(collection(db, "doctors"));
  document.getElementById("doctorsCount").textContent = doctorsSnap.size;

  const hospitalsSnap = await getDocs(collection(db, "hospitals"));
  document.getElementById("hospitalsCount").textContent = hospitalsSnap.size;
}

// ==============================
// ملء الداشبورد بعد تسجيل الدخول
// ==============================
updateDashboardStats();

// أزرار التنقل
document.getElementById("navDashboard").onclick = () => showPage("dashboard");
document.getElementById("navDoctors").onclick = () => showPage("doctors");
document.getElementById("navHospitals").onclick = () => showPage("hospitals");
