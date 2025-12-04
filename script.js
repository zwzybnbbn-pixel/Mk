// فتح القائمة
function toggleMenu() {
  const m = document.getElementById("menu");
  if (!m) return;
  m.style.display = (m.style.display === "flex") ? "none" : "flex";
}

// ========================
// تحميل الأطباء من Firestore
// ========================
let doctors = [];

async function loadDoctorsFromFirestore() {
  try {
    const snap = await db.collection("Doctors").get();
    doctors = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    console.log("Loaded doctors:", doctors);

    // إنشاء الفلاتر
    populateFilters();

    // تحميل البطاقات
    if (document.getElementById("cards")) {
      loadCardsFiltered();
    }

    // اذا كنا في صفحة الطبيب
    if (window.location.pathname.includes("doctor.html")) {
      loadDoctorProfile();
    }

  } catch (err) {
    console.error("Firestore Error:", err);
  }
}

// ========================
// إنشاء الفلاتر من البيانات
// ========================
function populateFilters() {
  const spSet = new Set();
  const hSet = new Set();

  doctors.forEach(d => {
    spSet.add(d.specialty);
    hSet.add(d.hospital);
  });

  const sSel = document.getElementById("filterSpecialty");
  const hSel = document.getElementById("filterHospital");

  if (sSel) {
    sSel.innerHTML += [...spSet].map(s => `<option value="${s}">${s}</option>`).join("");
  }
  if (hSel) {
    hSel.innerHTML += [...hSet].map(h => `<option value="${h}">${h}</option>`).join("");
  }
}

// ========================
// بناء بطاقة طبيب
// ========================
function buildCard(d) {
  return `
    <div class="card">
      <h3>${d.name}</h3>
      <p><strong>التخصص:</strong> ${d.specialty}</p>
      <p><strong>المستشفى:</strong> ${d.hospital}</p>
      <p><strong>الدوام:</strong> ${d.time}</p>

      <div style="margin-top:10px">
        <a class="btn" href="doctor.html?id=${d.id}">عرض الملف</a>
        <a class="btn" href="https://wa.me/967${d.phone}">واتساب</a>
      </div>
    </div>
  `;
}

// ========================
// تحميل البطاقات وفق البحث والفلاتر
// ========================
function loadCardsFiltered() {
  const q = document.getElementById("searchInput") ? document.getElementById("searchInput").value.trim().toLowerCase() : "";
  const spec = document.getElementById("filterSpecialty") ? document.getElementById("filterSpecialty").value : "";
  const hosp = document.getElementById("filterHospital") ? document.getElementById("filterHospital").value : "";

  const container = document.getElementById("cards");
  if (!container) return;

  container.innerHTML = "";

  const result = doctors.filter(d => {
    const matchQ = (d.name + d.specialty + d.hospital)
      .toLowerCase()
      .replace(/\s+/g, "")
      .includes(q.replace(/\s+/g, ""));

    const matchSpec = spec ? d.specialty === spec : true;
    const matchHosp = hosp ? d.hospital === hosp : true;

    return matchQ && matchSpec && matchHosp;
  });

  if (result.length === 0) {
    document.getElementById("noresult").style.display = "block";
    return;
  }

  document.getElementById("noresult").style.display = "none";

  result.forEach(d => {
    container.innerHTML += buildCard(d);
  });
}

// ========================
// صفحة الملف — تحميل طبيب واحد
// ========================
function loadDoctorProfile() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const d = doctors.find(x => x.id === id);
  if (!d) return;

  const el = document.getElementById("profile");
  el.innerHTML = `
    <div class="profile-card">
      <h2>${d.name}</h2>
      <p><strong>التخصص:</strong> ${d.specialty}</p>
      <p><strong>المستشفى:</strong> ${d.hospital}</p>
      <p><strong>الدوام:</strong> ${d.time}</p>
      <p><strong>الهاتف:</strong> ${d.phone}</p>
      <p>${d.bio || ""}</p>

      <div style="margin-top:15px">
        <a class="btn" href="https://wa.me/967${d.phone}">اتصل عبر واتساب</a>
      </div>
    </div>
  `;
}

// ========================
// تهيئة الصفحة
// ========================
window.addEventListener("DOMContentLoaded", () => {
  loadDoctorsFromFirestore();

  // ربط البحث والفلاتر
  ["searchInput", "filterSpecialty", "filterHospital"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", () => loadCardsFiltered());
  });
});nt.getElementById("cards")) {
    await loadDoctorsFromFirestore();
    populateFilters();
    loadCardsFiltered();

    ["searchInput", "filterSpecialty", "filterHospital"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("input", loadCardsFiltered);
    });
  }

  // صفحة الطبيب الواحد
  if (document.getElementById("profile")) {
    const params = new URLSearchParams(location.search);
    const id = params.get("id");

    const d = await loadDoctorByID(id);
    if (d) renderProfile(d);
    else document.getElementById('profile').innerHTML =
      `<div class='profile-card'><h3>لم يتم العثور على الطبيب</h3></div>`;
  }

});
