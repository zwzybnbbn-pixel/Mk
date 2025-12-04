// ==============================
//   وظائف موقع دليل الأطباء
//   نسخة محدثة بالكامل
// ==============================

// قائمة التنقل
function toggleMenu() {
  const m = document.getElementById("menu");
  if (!m) return;
  m.style.display = m.style.display === "flex" ? "none" : "flex";
}

// ==============================
//  توليد الفلاتر من بيانات الدكاترة
// ==============================
function populateFilters() {
  const spSet = new Set();
  const hSet = new Set();

  doctors.forEach((d) => {
    if (d.specialty) spSet.add(d.specialty);
    if (d.hospital) hSet.add(d.hospital);
  });

  const sSel = document.getElementById("filterSpecialty");
  const hSel = document.getElementById("filterHospital");

  if (sSel) {
    spSet.forEach((s) => {
      const o = document.createElement("option");
      o.value = s;
      o.textContent = s;
      sSel.appendChild(o);
    });
  }

  if (hSel) {
    hSet.forEach((h) => {
      const o = document.createElement("option");
      o.value = h;
      o.textContent = h;
      hSel.appendChild(o);
    });
  }
}

// ==============================
//   بناء بطاقة دكتور واحدة
// ==============================
function buildCard(d) {
  return `
    <div class="card">
      <h3>${d.name}</h3>
      <p><strong>التخصص:</strong> ${d.specialty}</p>

      ${d.hospital ? `<p><strong>المستشفى:</strong> ${d.hospital}</p>` : ""}

      <div style="margin-top:10px">
        <a class="btn" href="doctor.html?id=${d.id}">عرض الملف</a>
      </div>
    </div>`;
}

// ==============================
//   إنشاء جدول الدوام الأسبوعي
// ==============================
function createScheduleTable(schedule) {
  if (!schedule || schedule.length === 0) return "<p>لا يوجد دوام</p>";

  let rows = "";
  schedule.forEach((s) => {
    rows += `
      <tr>
        <td>${s.day}</td>
        <td>${s.time}</td>
        <td>${s.place}</td>
      </tr>`;
  });

  return `
    <table class="schedule-table">
      <tr>
        <th>اليوم</th>
        <th>الوقت</th>
        <th>المكان</th>
      </tr>
      ${rows}
    </table>`;
}

// ==============================
//  تحميل البطاقات حسب البحث
// ==============================
function loadCardsFiltered() {
  const qEl = document.getElementById("searchInput");
  if (!qEl) return;

  const q = qEl.value.trim().toLowerCase().replace(/\s+/g, "");
  const spec = document.getElementById("filterSpecialty")
    ? document.getElementById("filterSpecialty").value
    : "";
  const hosp = document.getElementById("filterHospital")
    ? document.getElementById("filterHospital").value
    : "";
  const container = document.getElementById("cards");
  const noresult = document.getElementById("noresult");

  if (!container) return;
  container.innerHTML = "";

  const result = doctors.filter((d) => {
    const matchQ = (
      (d.name || "") +
      (d.specialty || "") +
      (d.hospital || "")
    )
      .toLowerCase()
      .replace(/\s+/g, "")
      .includes(q);

    const matchSpec = spec ? d.specialty === spec : true;
    const matchHosp = hosp ? d.hospital === hosp : true;

    return matchQ && matchSpec && matchHosp;
  });

  if (result.length === 0) {
    noresult.style.display = "block";
    return;
  }

  noresult.style.display = "none";
  result.forEach((d) => (container.innerHTML += buildCard(d)));
}

// ==============================
//   عرض صفحة الملف الشخصي للطبيب
// ==============================
function renderProfile(d) {
  const el = document.getElementById("profile");
  if (!el) return;

  el.innerHTML = `
    <div class="profile-card">
      <h2>${d.name}</h2>

      <p><strong>التخصص:</strong> ${d.specialty}</p>
      ${d.hospital ? `<p><strong>المستشفى:</strong> ${d.hospital}</p>` : ""}

      <h3>الدوام الأسبوعي</h3>
      ${createScheduleTable(d.schedule)}

      <p><strong>الهاتف:</strong> ${d.phone || "غير متوفر"}</p>
      <p>${d.bio || ""}</p>
    </div>`;
}

// ==============================
//   تشغيل الموقع عند التحميل
// ==============================
window.addEventListener("DOMContentLoaded", () => {
  populateFilters();

  const isHome =
    window.location.pathname.includes("index.html") ||
    window.location.pathname.endsWith("/");

  // الصفحة الرئيسية → لا نعرض أي بطاقات
  if (isHome) {
    const cards = document.getElementById("cards");
    const noresult = document.getElementById("noresult");
    if (cards) cards.innerHTML = "";
    if (noresult) noresult.style.display = "none";
    return;
  }

  // صفحة الأطباء
  if (document.getElementById("cards")) {
    loadCardsFiltered();

    ["searchInput", "filterSpecialty", "filterHospital"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("input", () => loadCardsFiltered());
    });
  }
});
