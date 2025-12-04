// ===============================
// استيراد Firebase
// ===============================
import { db } from "./firebase.js";
import { 
  collection, 
  getDocs, 
  getDoc, 
  doc 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ===============================
// فتح القائمة
// ===============================
function toggleMenu() {
  const m = document.getElementById("menu");
  if (!m) return;
  m.style.display = (m.style.display === "flex") ? "none" : "flex";
}
window.toggleMenu = toggleMenu; // حتى يعمل onclick



// ===============================
// تحميل الأطباء من Firestore
// ===============================
let doctors = [];

async function loadDoctorsFromFirestore() {
  try {
    const snap = await getDocs(collection(db, "Doctors"));
    doctors = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    console.log("Loaded doctors:", doctors);

    populateFilters();
    loadCardsFiltered();

  } catch (err) {
    console.error("Firestore Error:", err);
  }
}



// ===============================
// إنشاء الفلاتر
// ===============================
function populateFilters() {
  const sp = document.getElementById("filterSpecialty");
  const ho = document.getElementById("filterHospital");

  if (!sp || !ho) return;

  const spSet = new Set();
  const hoSet = new Set();

  doctors.forEach(d => {
    spSet.add(d.specialty);
    hoSet.add(d.hospital);
  });

  sp.innerHTML += [...spSet].map(s => `<option value="${s}">${s}</option>`).join("");
  ho.innerHTML += [...hoSet].map(h => `<option value="${h}">${h}</option>`).join("");
}



// ===============================
// بناء كرت الطبيب
// ===============================
function buildCard(d) {
  return `
    <div class="card">
      <h3>${d.name}</h3>
      <p><strong>التخصص:</strong> ${d.specialty}</p>
      <p><strong>المستشفى:</strong> ${d.hospital}</p>

      <div style="margin-top:10px">
        <a class="btn" href="doctor.html?id=${d.id}">عرض الملف</a>
      </div>
    </div>
  `;
}



// ===============================
// تصفية البطاقات
// ===============================
function loadCardsFiltered() {
  const searchValue = document.getElementById("searchInput")?.value.toLowerCase() || "";
  const spec = document.getElementById("filterSpecialty")?.value || "";
  const hosp = document.getElementById("filterHospital")?.value || "";
  const container = document.getElementById("cards");
  const nores = document.getElementById("noresult");

  if (!container) return;

  const result = doctors.filter(d => {
    const combined = (d.name + d.specialty + d.hospital).toLowerCase();
    return combined.includes(searchValue) &&
           (spec ? d.specialty === spec : true) &&
           (hosp ? d.hospital === hosp : true);
  });

  container.innerHTML = "";

  if (result.length === 0) {
    if (nores) nores.style.display = "block";
    return;
  }

  if (nores) nores.style.display = "none";
  result.forEach(d => (container.innerHTML += buildCard(d)));
}



// ===============================
// صفحة الملف — تحميل طبيب واحد
// ===============================
async function loadDoctorProfile() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) return;

  const snap = await getDoc(doc(db, "Doctors", id));
  if (!snap.exists()) {
    document.getElementById("profile").innerHTML = "<h3>لم يتم العثور على الطبيب</h3>";
    return;
  }

  const d = snap.data();

  document.getElementById("profile").innerHTML = `
    <div class="profile-card">
      <h2>${d.name}</h2>
      <p><strong>التخصص:</strong> ${d.specialty}</p>
      <p><strong>المستشفى:</strong> ${d.hospital}</p>
      <p><strong>الدوام:</strong> ${d.time || "لا يوجد"}</p>
      <p><strong>الهاتف:</strong> ${d.phone || "غير متوفر"}</p>

      <div style="margin-top:15px">
        <a class="btn" href="https://wa.me/967${d.phone}">اتصال عبر واتساب</a>
      </div>
    </div>
  `;
}



// ===============================
// تشغيل السكربت بعد تحميل الصفحة
// ===============================
window.addEventListener("DOMContentLoaded", () => {
  loadDoctorsFromFirestore();

  if (document.getElementById("searchInput"))
    document.getElementById("searchInput").addEventListener("input", loadCardsFiltered);

  if (document.getElementById("filterSpecialty"))
    document.getElementById("filterSpecialty").addEventListener("change", loadCardsFiltered);

  if (document.getElementById("filterHospital"))
    document.getElementById("filterHospital").addEventListener("change", loadCardsFiltered);

  if (document.getElementById("profile"))
    loadDoctorProfile();
});
