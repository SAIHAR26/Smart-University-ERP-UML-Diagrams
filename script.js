// Smart University ERP admin interactions. All records are local browser demo data.
document.addEventListener("DOMContentLoaded", () => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const storeKey = "smartuni-admin-demo-v1";
  const sidebar = $("#sidebar");
  const dashboard = $("#dashboardContent");
  const studentsPage = $("#studentsContent");
  const studentProfile = $("#studentProfileContent");
  const modulePage = $("#modulePage");
  const pageTitle = $("#pageTitle");
  const dialog = $("#actionDialog");
  const dialogFields = $("#dialogFields");
  const store = loadStore();
  let currentProfileId = "";
  let currentProfileWasSaved = false;
  let editMode = false;
  let formContext = { module: "Students", action: "Add Student" };
  let activeModule = "Dashboard";

  function loadStore() {
    try {
      const saved = JSON.parse(localStorage.getItem(storeKey) || "{}");
      return {
        students: saved.students || [],
        faculty: saved.faculty || [],
        courses: saved.courses || [],
        attendance: saved.attendance || [],
        examinations: saved.examinations || [],
        fees: saved.fees || [],
        placements: saved.placements || [],
        notices: saved.notices || [],
        complaints: saved.complaints || [],
        leave: saved.leave || [],
        departments: saved.departments || ["Information Technology", "Computer Science", "Electronics", "Business Administration", "Mechanical Engineering"]
      };
    } catch { return { students: [], faculty: [], courses: [], attendance: [], examinations: [], fees: [], placements: [], notices: [], complaints: [], leave: [], departments: ["Information Technology", "Computer Science", "Electronics", "Business Administration"] }; }
  }
  function persist() { localStorage.setItem(storeKey, JSON.stringify(store)); }
  function escapeHtml(value) { return String(value ?? "").replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch])); }
  function rowData(row) {
    const cells = row.querySelectorAll("td");
    return { id: cells[1].textContent.trim(), name: cells[0].querySelector("strong").textContent.trim(), email: cells[0].querySelector(".student-email")?.textContent.trim() || "", department: cells[2].textContent.trim(), year: cells[3].textContent.trim(), attendance: cells[4].textContent.trim(), cgpa: cells[5].textContent.trim(), status: cells[6].textContent.trim(), phone: "", program: `B.Tech · ${cells[2].textContent.trim()}` };
  }
  function allStudents() { return [...$$("#studentRows tr").map(rowData), ...store.students]; }
  function studentRow(student) {
    const initials = student.name.split(/\s+/).map(part => part[0]).join("").slice(0, 2).toUpperCase();
    const avatarClass = ["student-a", "student-b", "student-c", "student-d"][Math.abs([...student.id].reduce((sum, char) => sum + char.charCodeAt(0), 0)) % 4];
    const statusClass = student.status === "At Risk" ? "status-risk" : student.status === "On Leave" ? "status-leave" : "status-active";
    const attendanceClass = parseInt(student.attendance, 10) < 75 ? "attendance-low" : "";
    return `<tr tabindex="0" role="button" aria-label="Open ${escapeHtml(student.name)} profile" data-department="${escapeHtml(student.department)}" data-status="${escapeHtml(student.status)}"><td><span class="student-cell"><span class="avatar student-avatar ${avatarClass}">${initials}</span><span><strong>${escapeHtml(student.name)}</strong><small class="student-email">${escapeHtml(student.email)}</small></span></span></td><td>${escapeHtml(student.id)}</td><td>${escapeHtml(student.department)}</td><td>${escapeHtml(student.year)}</td><td><span class="attendance-value ${attendanceClass}">${escapeHtml(student.attendance)}</span></td><td><span class="cgpa"><i class="fa-solid fa-star"></i> ${escapeHtml(student.cgpa)}</span></td><td><span class="student-status ${statusClass}">${escapeHtml(student.status)}</span></td><td><button class="more-button student-more" aria-label="Edit ${escapeHtml(student.name)}"><i class="fa-solid fa-ellipsis"></i></button></td></tr>`;
  }
  function renderStudents() {
    const tbody = $("#studentRows");
    for (const student of store.students) if (!$$("#studentRows tr").some(row => row.querySelectorAll("td")[1]?.textContent.trim() === student.id)) tbody.insertAdjacentHTML("beforeend", studentRow(student));
    $$("#studentRows tr").forEach(row => {
      if (row.dataset.bound) return;
      row.dataset.bound = "true";
      row.addEventListener("click", event => { const s = rowData(row); if (event.target.closest("button")) { openRecordForm("Students", "Edit Student", s); return; } openStudentProfile(row); });
      row.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openStudentProfile(row); } });
    });
    const depts = $("#departmentFilter");
    for (const dept of store.departments) if (![...depts.options].some(option => option.value === dept || option.textContent === dept)) depts.add(new Option(dept, dept));
    filterStudents();
  }
  function filterStudents() {
    const query = $("#studentSearch").value.trim().toLowerCase();
    const department = $("#departmentFilter").value;
    const status = $("#statusFilter").value;
    let visible = 0;
    $$("#studentRows tr").forEach(row => { const match = (!query || row.textContent.toLowerCase().includes(query)) && (!department || row.dataset.department === department) && (!status || row.dataset.status === status); row.hidden = !match; if (match) visible++; });
    $("#emptyStudents").hidden = visible > 0;
    $("#studentCount").textContent = query || department || status ? `Showing ${visible} matching student${visible === 1 ? "" : "s"}` : `Showing ${visible} student records`;
  }
  function showModule(name) {
    activeModule = name;
    pageTitle.textContent = name;
    dashboard.hidden = name !== "Dashboard";
    studentsPage.hidden = name !== "Students";
    studentProfile.hidden = name !== "Student Profile";
    modulePage.hidden = name === "Dashboard" || name === "Students" || name === "Student Profile";
    $("#globalSearch").value = "";
    $$(".activity-item, .notice-item, .performers-table tbody tr").forEach(item => item.hidden = false);
    filterStudents();
    $$(".nav-link").forEach(link => link.classList.toggle("active", link.dataset.module === name));
    if (modulePage.hidden === false) renderModule(name);
    sidebar.classList.remove("open");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  $$("[data-module]").forEach(link => link.addEventListener("click", event => { event.preventDefault(); showModule(link.dataset.module); }));
  $(".brand").addEventListener("click", event => { event.preventDefault(); showModule("Dashboard"); });
  $("#backToStudents").addEventListener("click", () => showModule("Students"));
  $("#menuToggle").addEventListener("click", () => sidebar.classList.toggle("open"));
  $("#studentSearch").addEventListener("input", filterStudents);
  $("#departmentFilter").addEventListener("change", filterStudents);
  $("#statusFilter").addEventListener("change", filterStudents);
  $("#globalSearch").addEventListener("input", event => {
    const query = event.target.value.trim().toLowerCase();
    $("#studentSearch").value = event.target.value;
    filterStudents();
    $$(".activity-item, .notice-item, .performers-table tbody tr").forEach(item => item.hidden = query.length > 0 && !item.textContent.toLowerCase().includes(query));
    if (!studentsPage.hidden && query) showModule("Students");
  });
  document.addEventListener("keydown", event => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); $("#globalSearch").focus(); } });

  function openStudentProfile(row) {
    const s = rowData(row); currentProfileId = s.id; currentProfileWasSaved = Boolean(store.students.find(student => student.id === s.id));
    $("#profileName").textContent = s.name; $("#profileAvatar").textContent = s.name.split(/\s+/).map(p => p[0]).join("").slice(0, 2).toUpperCase();
    $("#profileId").textContent = s.id; $("#profileDepartment").textContent = s.department; $("#profileDepartmentDetail").textContent = s.department;
    $("#profileEmail").textContent = s.email; $("#profilePhone").textContent = s.phone || "Contact information not provided"; $("#profileProgram").textContent = s.program || `Program · ${s.department}`;
    $("#profileYear").textContent = s.year; $("#profileAttendance").textContent = s.attendance; $("#profileCgpa").textContent = s.cgpa; $("#profileStatus").textContent = `${s.status} Student`;
    $(".profile-back-row .eyebrow").innerHTML = `STUDENT PROFILE <span class="eyebrow-divider">/</span> ${escapeHtml(s.id)}`;
    showModule("Student Profile");
  }

  const moduleConfig = {
    Faculty: { key: "faculty", singular: "Faculty Member", fields: [["name", "Full name", "text"], ["email", "Email address", "email"], ["department", "Department", "select", "departments"], ["designation", "Designation", "text"]], desc: "Manage faculty members and their department assignments." },
    Departments: { key: "departments", singular: "Department", fields: [["name", "Department name", "text"], ["head", "Department head", "text"], ["programs", "Programs", "text"]], desc: "Manage academic departments and their leadership." },
    Courses: { key: "courses", singular: "Course", fields: [["name", "Course name", "text"], ["code", "Course code", "text"], ["department", "Department", "select", "departments"], ["faculty", "Assigned faculty", "text"]], desc: "Create and maintain course catalog entries." },
    Attendance: { key: "attendance", singular: "Attendance Record", fields: [["studentId", "Student ID", "text"], ["course", "Course", "text"], ["date", "Date", "date"], ["status", "Attendance status", "select", ["Present", "Absent", "Late"]]], desc: "Record and review student attendance." },
    Assignments: { key: "assignments", singular: "Assignment", fields: [["title", "Assignment title", "text"], ["course", "Course", "text"], ["dueDate", "Due date", "date"], ["status", "Status", "select", ["Open", "Closed"]]], desc: "Track coursework and assignment deadlines." },
    Examinations: { key: "examinations", singular: "Examination", fields: [["name", "Exam name", "text"], ["course", "Course", "text"], ["date", "Exam date", "date"], ["location", "Room / location", "text"]], desc: "Manage examination schedules and locations." },
    Results: { key: "results", singular: "Result", fields: [["studentId", "Student ID", "text"], ["course", "Course", "text"], ["grade", "Grade", "text"], ["score", "Score (%)", "number"]], desc: "Record grades and review academic outcomes." },
    "Fees & Payments": { key: "fees", singular: "Fee Record", fields: [["studentId", "Student ID", "text"], ["amount", "Amount (₹)", "number"], ["dueDate", "Due date", "date"], ["status", "Payment status", "select", ["Pending", "Paid", "Overdue"]]], desc: "Track student fee balances and payment status." },
    "Leave Requests": { key: "leave", singular: "Leave Request", fields: [["studentId", "Student ID", "text"], ["from", "From", "date"], ["to", "To", "date"], ["reason", "Reason", "text"], ["status", "Status", "select", ["Pending", "Approved", "Declined"]]], desc: "Review student leave requests." },
    Placements: { key: "placements", singular: "Placement", fields: [["company", "Company", "text"], ["role", "Role", "text"], ["department", "Department", "select", "departments"], ["deadline", "Application deadline", "date"]], desc: "Manage opportunities and placement activity." },
    Notices: { key: "notices", singular: "Notice", fields: [["title", "Notice title", "text"], ["audience", "Audience", "select", ["All students", "Faculty", "Students", "Staff"]], ["date", "Publish date", "date"], ["details", "Details", "text"]], desc: "Publish and maintain campus announcements." },
    Complaints: { key: "complaints", singular: "Complaint", fields: [["subject", "Subject", "text"], ["studentId", "Student ID", "text"], ["category", "Category", "text"], ["status", "Status", "select", ["Open", "In review", "Resolved"]]], desc: "Track and update student complaints." },
    "Emergency / SOS": { key: "complaints", singular: "Incident", fields: [["subject", "Incident", "text"], ["studentId", "Student ID", "text"], ["location", "Location", "text"], ["status", "Status", "select", ["Open", "In progress", "Resolved"]]], desc: "Review and track campus safety incidents." },
    "Academic Risk": { key: "students", singular: "Student", fields: [], desc: "Identify students who may need academic support." },
    Reports: { key: "reports", singular: "Report", fields: [], desc: "Export summaries of student, attendance, and course records." },
    Settings: { key: "settings", singular: "Setting", fields: [["name", "Setting name", "text"], ["value", "Value", "text"], ["description", "Description", "text"]], desc: "Manage preferences for this local admin demo." }
  };
  function moduleItems(name) {
    const cfg = moduleConfig[name];
    if (name === "Students") return allStudents();
    if (name === "Academic Risk") return allStudents().filter(s => s.status === "At Risk" || parseInt(s.attendance, 10) < 75);
    if (name === "Reports") return [{ name: "Student directory", detail: `${allStudents().length} student records`, action: "Export CSV" }, { name: "Attendance records", detail: `${store.attendance.length} attendance entries`, action: "Export CSV" }, { name: "Course catalog", detail: `${store.courses.length} courses`, action: "Export CSV" }];
    return (store[cfg.key] || []).filter(item => !item.system);
  }
  function renderModule(name) {
    const cfg = moduleConfig[name] || moduleConfig.Reports;
    $("#moduleTitle").textContent = name; $("#moduleDescription").textContent = cfg.desc;
    $("#moduleKicker").textContent = name.toUpperCase(); $("#moduleListTitle").textContent = `${name} records`;
    $("#moduleAction").hidden = ["Reports", "Academic Risk"].includes(name);
    $("#moduleAction").innerHTML = name === "Attendance" ? '<i class="fa-solid fa-calendar-check"></i> Mark attendance' : `<i class="fa-solid fa-plus"></i> Add ${cfg.singular.toLowerCase()}`;
    $("#moduleAction").onclick = () => name === "Attendance" ? openRecordForm(name, "Mark Attendance") : openRecordForm(name, `Add ${cfg.singular}`);
    const query = $("#moduleSearch").value.trim().toLowerCase();
    const items = moduleItems(name).filter(item => JSON.stringify(item).toLowerCase().includes(query));
    const container = $("#moduleRecords");
    if (!items.length) { container.innerHTML = '<div class="module-empty"><i class="fa-regular fa-folder-open"></i><strong>No records yet</strong><span>Add a record to get started.</span></div>'; return; }
    container.innerHTML = items.map(item => {
      const primary = item.name || item.title || item.company || item.subject || item.studentId || item.code || "Record";
      const detail = item.action ? item.detail : Object.entries(item).filter(([key]) => key !== "id" && key !== "system" && key !== "name" && key !== "title" && key !== "company" && key !== "subject").map(([k,v]) => `${k}: ${v}`).join(" · ");
      if (name === "Reports") return `<article class="module-record"><div><strong>${escapeHtml(primary)}</strong><small>${escapeHtml(detail)}</small></div><button class="select-button export-report" data-report="${escapeHtml(primary)}" type="button"><i class="fa-solid fa-download"></i> Export CSV</button></article>`;
      const dataStudent = name === "Students" || name === "Academic Risk";
      return `<article class="module-record"><div><strong>${escapeHtml(primary)}</strong><small>${escapeHtml(detail || cfg.singular)}</small></div>${dataStudent ? `<button class="select-button open-record" data-id="${escapeHtml(item.id)}" type="button">View profile</button>` : `<span class="module-record-actions"><button class="select-button edit-record" data-id="${escapeHtml(item.id)}" type="button">Edit</button><button class="select-button delete-record" data-id="${escapeHtml(item.id)}" type="button">Delete</button></span>`}</article>`;
    }).join("");
    $$(".open-record", container).forEach(btn => btn.onclick = () => { const row = [...$$("#studentRows tr")].find(r => rowData(r).id === btn.dataset.id); if (row) openStudentProfile(row); else { const s = store.students.find(x => x.id === btn.dataset.id); if (s) { $("#studentRows").insertAdjacentHTML("beforeend", studentRow(s)); renderStudents(); const r = [...$$("#studentRows tr")].find(x => rowData(x).id === s.id); if (r) openStudentProfile(r); } } });
    $$(".edit-record", container).forEach(btn => btn.onclick = () => openRecordForm(name, `Edit ${cfg.singular}`, (store[cfg.key] || []).find(x => x.id === btn.dataset.id)));
    $$(".delete-record", container).forEach(btn => btn.onclick = () => { const at = store[cfg.key].findIndex(x => x.id === btn.dataset.id); if (at >= 0 && confirm("Delete this local demo record?")) { store[cfg.key].splice(at, 1); persist(); renderModule(name); } });
    $$(".export-report", container).forEach(btn => btn.onclick = () => exportCsv(btn.dataset.report, reportRows(btn.dataset.report)));
  }
  function reportRows(report) {
    if (report === "Student directory") return allStudents().map(({ name, id, email, department, year, attendance, cgpa, status }) => ({ name, id, email, department, year, attendance, cgpa, status }));
    if (report === "Attendance records") return store.attendance;
    return store.courses;
  }
  $("#moduleSearch").addEventListener("input", () => renderModule(activeModule));

  function fieldHtml(field, value = "") {
    const [key, label, type, choices] = field;
    if (type === "select") { const list = choices === "departments" ? store.departments : choices; return `<label>${label}<select name="${key}" required>${list.map(option => `<option ${value === option ? "selected" : ""}>${escapeHtml(option)}</option>`).join("")}</select></label>`; }
    return `<label>${label}<input name="${key}" type="${type}" value="${escapeHtml(value)}" ${type === "number" ? 'min="0" step="any"' : ""} required></label>`;
  }
  function openRecordForm(module, action, existing = null) {
    formContext = { module, action }; editMode = Boolean(existing);
    const studentFields = [["name", "Full name", "text"], ["id", "Student ID", "text"], ["email", "Email address", "email"], ["department", "Department", "select", "departments"], ["year", "Year", "select", ["Year 1", "Year 2", "Year 3", "Year 4"]], ["attendance", "Attendance (%)", "number"], ["cgpa", "CGPA", "number"], ["status", "Status", "select", ["Active", "At Risk", "On Leave"]], ["phone", "Phone number", "tel"]];
    const cfg = moduleConfig[module];
    let fields = module === "Students" ? studentFields : cfg?.fields || [];
    if (action === "Edit Student" && existing) fields = studentFields.filter(f => f[0] !== "id");
    $("#dialogTitle").textContent = action;
    $("#dialogDescription").textContent = editMode ? "Update this record. Changes save in this browser." : "Enter the details. Changes save in this browser.";
    $("#saveRecord").textContent = editMode ? "Save changes" : "Save record";
    dialogFields.innerHTML = fields.map(field => fieldHtml(field, existing?.[field[0]] || "")).join("");
    dialogFields.dataset.mode = module === "Attendance" && action === "Mark Attendance" ? "attendance" : "";
    dialog.showModal();
    const first = $("input, select", dialogFields); if (first) first.focus();
  }
  function closeDialog() { dialog.close(); }
  $("#closeDialog").onclick = closeDialog; $("#cancelDialog").onclick = closeDialog;
  $("#recordForm").addEventListener("submit", event => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    if (formContext.module === "Students") {
      const email = values.email.trim().toLowerCase();
      if (values.id && allStudents().some(s => s.id.toLowerCase() === values.id.toLowerCase() && (!editMode || s.id !== currentProfileId))) { alert("That student ID already exists."); return; }
      if (editMode) {
        const row = [...$$("#studentRows tr")].find(r => rowData(r).id === currentProfileId);
        let saved = store.students.find(s => s.id === currentProfileId);
        const target = row ? rowData(row) : saved;
        if (!target) return;
        Object.assign(target, values, { email, attendance: `${values.attendance}%`, cgpa: Number(values.cgpa).toFixed(1), program: `B.Tech · ${values.department}` });
        if (row) { const tr = document.createElement("tbody"); tr.innerHTML = studentRow(target); row.replaceWith(tr.firstElementChild); }
        if (saved) Object.assign(saved, target);
        else { saved = { ...target, system: true }; store.students.push(saved); }
        currentProfileId = target.id;
      } else store.students.push({ ...values, id: values.id.trim(), email, attendance: `${values.attendance}%`, cgpa: Number(values.cgpa).toFixed(1), program: `B.Tech · ${values.department}`, system: false });
      persist(); renderStudents();
    } else {
      const cfg = moduleConfig[formContext.module];
      if (cfg) {
        store[cfg.key] ||= [];
        if (editMode) Object.assign(store[cfg.key].find(x => x.id === currentProfileId) || {}, values);
        else store[cfg.key].push({ ...values, id: crypto.randomUUID() });
        persist();
      }
    }
    closeDialog();
    if (formContext.module === "Students" && editMode) { const row = [...$$("#studentRows tr")].find(r => rowData(r).id === currentProfileId); if (row) openStudentProfile(row); }
    if (modulePage.hidden === false) renderModule(activeModule);
  });

  function exportCsv(filename, rows) {
    if (!rows.length) { alert("There are no records to export yet."); return; }
    const headers = [...new Set(rows.flatMap(row => Object.keys(row)))];
    const content = [headers, ...rows.map(row => headers.map(key => row[key] ?? ""))].map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\r\n");
    const link = document.createElement("a"); const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }));
    link.href = url; link.download = `${filename.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.csv`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  $("#exportStudents").onclick = () => exportCsv("student-directory", allStudents());

  // Functional dashboard shortcuts route into the matching module or record form.
  $$(".quick-action").forEach(button => button.addEventListener("click", () => {
    const action = button.dataset.action;
    if (action === "Add Student") openRecordForm("Students", action);
    else if (action === "Add Faculty") openRecordForm("Faculty", action);
    else if (action === "Create Course") openRecordForm("Courses", action);
    else if (action === "Mark Attendance") { showModule("Attendance"); openRecordForm("Attendance", action); }
    else if (action === "Generate Report") showModule("Reports");
  }));
  $("#addStudentButton").onclick = () => openRecordForm("Students", "Add Student");
  $("#editStudentProfile").onclick = () => {
    const row = [...$$("#studentRows tr")].find(r => rowData(r).id === currentProfileId);
    const saved = store.students.find(s => s.id === currentProfileId);
    if (row) openRecordForm("Students", "Edit Student", rowData(row)); else if (saved) openRecordForm("Students", "Edit Student", saved);
  };
  $$(".performers-table tbody tr").filter(row => !row.closest("#studentRows")).forEach(row => row.addEventListener("click", () => { const id = row.querySelector("strong")?.textContent.trim(); const match = [...$$("#studentRows tr")].find(r => rowData(r).id === id); if (match) openStudentProfile(match); }));

  // Header popovers.
  const notificationButton = $("#notificationButton"), notificationPopover = $("#notificationPopover"), profileButton = $("#profileButton"), profilePopover = $("#profilePopover");
  function closePopovers() { notificationPopover.hidden = true; profilePopover.hidden = true; notificationButton.setAttribute("aria-expanded", "false"); profileButton.setAttribute("aria-expanded", "false"); }
  [[notificationButton, notificationPopover], [profileButton, profilePopover]].forEach(([button, popover]) => button.addEventListener("click", event => { event.stopPropagation(); const open = popover.hidden; closePopovers(); popover.hidden = !open; button.setAttribute("aria-expanded", String(open)); }));
  document.addEventListener("click", event => { if (!event.target.closest(".popover-wrap, .profile-wrap")) closePopovers(); if (window.innerWidth <= 850 && !event.target.closest(".sidebar, .menu-toggle")) sidebar.classList.remove("open"); });
  renderStudents();
  $$(".nav-link").forEach(link => link.classList.remove("active"));
});
