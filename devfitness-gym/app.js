const STORAGE_KEY = "devfitness-gym-v1";
const SESSION_KEY = "devfitness-session";

const plans = {
  strength: {
    label: "Strength",
    prices: { "1": 1100, "3": 2500, "6": 4800, "12": 9000 },
  },
  cardio: {
    label: "Strength + Cardio",
    prices: { "1": 1400, "3": 3200, "6": 5700, "12": 11000 },
  },
};

const icons = {
  dashboard: "▦",
  members: "◎",
  payments: "₹",
  reports: "▤",
  reminders: "✆",
  plans: "◆",
  settings: "⚙",
};

const navItems = [
  ["dashboard", "Dashboard"],
  ["members", "Members"],
  ["payments", "Payments"],
  ["reports", "Reports"],
  ["reminders", "Reminders"],
  ["plans", "Plans"],
  ["settings", "Settings"],
];

const app = document.querySelector("#app");
let state = loadState();
let view = location.hash.replace("#", "") || "dashboard";
let selectedMemberId = null;
let memberFilter = "all";
let registrationStep = 0;
let draftMember = defaultMemberDraft();
let activeModal = null;

window.addEventListener("hashchange", () => {
  view = location.hash.replace("#", "") || "dashboard";
  render();
});

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(date, days) {
  const next = new Date(`${date}T00:00:00`);
  next.setDate(next.getDate() + Number(days));
  return next.toISOString().slice(0, 10);
}

function monthsToDays(months) {
  return Number(months) * 30;
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function money(value) {
  return `Rs. ${Number(value || 0).toLocaleString("en-IN")}`;
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return normalizeState(JSON.parse(saved));
  const seeded = seedState();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
  return seeded;
}

function normalizeState(saved) {
  const hasOldDemoPrices = saved.plans?.strength?.prices?.["1"] === 1000 || saved.plans?.cardio?.prices?.["12"] === 14000;
  saved.plans = saved.plans && !hasOldDemoPrices ? saved.plans : plans;
  saved.gym = {
    ...(saved.gym || {}),
    name: "DEV FITNESS GYM",
    phone: "9572762242",
    address: "1st Floor of Co-Operative Maintenance Office, Near SBI & BOI ATM, Bokaro Steel City, Jharkhand - 827013",
    services: ["Personal Training", "Bodybuilding", "Cardio", "Powerlifting", "Yoga", "Zumba", "Aerobics", "Weight Loss", "Weight Gain", "Supplements"],
  };
  saved.members = (saved.members || []).map((member) => {
    const next = {
      paymentStatus: member.dueOverride ? "Due" : "Paid",
      photo: "",
      signature: "",
      memberships: [],
      ...member,
    };
    if (!next.memberships.length) {
      const membershipAmount = next.planKey === "custom" ? Number(next.customAmount || 0) : Number(plans[next.planKey]?.prices[next.durationMonths] || 0);
      next.memberships = [
        {
          id: `ms-${next.id}-1`,
          planKey: next.planKey,
          planName: plans[next.planKey]?.label || "Custom Plan",
          duration: next.durationMonths === "custom" ? `${next.customDays || 0} days` : `${next.durationMonths} month`,
          startDate: next.startDate,
          expiryDate: next.expiryDate,
          membershipAmount,
          registrationFee: 0,
          totalAmount: membershipAmount,
          status: statusFromDates(next.expiryDate, next.dueOverride, next.paymentStatus),
        },
      ];
    }
    return next;
  });
  saved.payments = saved.payments || [];
  saved.reminders = saved.reminders || [];
  saved.nextMemberNumber = saved.nextMemberNumber || saved.members.length + 1;
  saveNormalizedLater(saved);
  return saved;
}

function saveNormalizedLater(nextState) {
  setTimeout(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState)), 0);
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function seedState() {
  const today = todayISO();
  const members = [
    {
      id: "m1",
      memberNo: "DEV-0001",
      name: "Rahul Sharma",
      age: 28,
      gender: "Male",
      phoneDay: "9876543210",
      phoneEvening: "",
      emergency: "9123456780",
      address: "Sector 4, Bokaro Steel City",
      city: "Bokaro Steel City",
      stateName: "Jharkhand",
      pin: "827004",
      trainer: "No",
      healthFlags: ["Joint/Muscle Pain"],
      healthNotes: "Prefers evening workouts.",
      registeredAt: addDays(today, -75),
      planKey: "cardio",
      durationMonths: "3",
      startDate: addDays(today, -75),
      expiryDate: addDays(today, 15),
      dueOverride: false,
      paymentStatus: "Paid",
      photo: "",
      signature: "",
      memberships: [],
    },
    {
      id: "m2",
      memberNo: "DEV-0002",
      name: "Amit Kumar",
      age: 34,
      gender: "Male",
      phoneDay: "9000011111",
      phoneEvening: "",
      emergency: "",
      address: "Chas Main Road",
      city: "Bokaro Steel City",
      stateName: "Jharkhand",
      pin: "827013",
      trainer: "Yes",
      healthFlags: [],
      healthNotes: "",
      registeredAt: addDays(today, -28),
      planKey: "strength",
      durationMonths: "1",
      startDate: addDays(today, -28),
      expiryDate: addDays(today, 2),
      dueOverride: false,
      paymentStatus: "Paid",
      photo: "",
      signature: "",
      memberships: [],
    },
    {
      id: "m3",
      memberNo: "DEV-0003",
      name: "Priya Singh",
      age: 25,
      gender: "Female",
      phoneDay: "9888877777",
      phoneEvening: "",
      emergency: "9777766666",
      address: "Co-op Colony",
      city: "Bokaro Steel City",
      stateName: "Jharkhand",
      pin: "827001",
      trainer: "No",
      healthFlags: ["Asthma"],
      healthNotes: "Avoid high dust areas.",
      registeredAt: addDays(today, -45),
      planKey: "cardio",
      durationMonths: "1",
      startDate: addDays(today, -45),
      expiryDate: addDays(today, -15),
      dueOverride: true,
      paymentStatus: "Due",
      photo: "",
      signature: "",
      memberships: [],
    },
  ];
  members.forEach((member) => {
    member.memberships = [
      {
        id: `ms-${member.id}-1`,
        planKey: member.planKey,
        planName: plans[member.planKey]?.label || "Custom Plan",
        duration: member.durationMonths === "custom" ? `${member.customDays} days` : `${member.durationMonths} month`,
        startDate: member.startDate,
        expiryDate: member.expiryDate,
        membershipAmount: plans[member.planKey]?.prices[member.durationMonths] || Number(member.customAmount || 0),
        registrationFee: 500,
        totalAmount: plans[member.planKey]?.prices[member.durationMonths] ? plans[member.planKey].prices[member.durationMonths] + 500 : Number(member.customAmount || 0) + 500,
        status: statusFromDates(member.expiryDate, member.dueOverride),
      },
    ];
  });

  return {
    nextMemberNumber: 4,
    admin: { username: "admin", password: "devfitness" },
    plans,
    reminderEnabled: true,
    gym: {
      name: "DEV FITNESS GYM",
      phone: "9572762242",
      address: "1st Floor of Co-Operative Maintenance Office, Near SBI & BOI ATM, Bokaro Steel City, Jharkhand - 827013",
      services: ["Personal Training", "Bodybuilding", "Cardio", "Powerlifting", "Yoga", "Zumba", "Aerobics", "Weight Loss", "Weight Gain", "Supplements"],
    },
    members,
    payments: [
      payment("p1", "m1", 4500, "UPI", addDays(today, -75), "3M package with registration"),
      payment("p2", "m2", 1500, "Cash", addDays(today, -28), "1M with registration waived"),
      payment("p3", "m3", 2000, "Bank Transfer", addDays(today, -45), "Registration plus monthly plan"),
      payment("p4", "m1", 300, "Cash", today, "Gloves and locker adjustment"),
    ],
    reminders: [
      reminder("r1", "m2", "3-day", addDays(today, -1), "Sent"),
      reminder("r2", "m3", "expired", addDays(today, -3), "Sent"),
    ],
  };
}

function payment(id, memberId, amount, mode, date, remarks) {
  return { id, memberId, amount, mode, date, remarks, createdAt: new Date().toISOString() };
}

function reminder(id, memberId, type, sentAt, status) {
  return { id, memberId, type, sentAt, status };
}

function defaultMemberDraft() {
  return {
    name: "",
    age: "",
    gender: "Male",
    phoneDay: "",
    phoneEvening: "",
    emergency: "",
    registeredAt: todayISO(),
    address: "",
    city: "Bokaro Steel City",
    stateName: "Jharkhand",
    pin: "",
    trainer: "No",
    healthFlags: [],
    healthNotes: "",
    planKey: "strength",
    durationMonths: "1",
    customDays: "",
    customAmount: "",
    waiveRegistration: false,
    amountPaid: 1600,
    paymentMode: "Cash",
    paymentDate: todayISO(),
    remarks: "",
    terms: false,
    photo: "",
    signature: "",
  };
}

function isLoggedIn() {
  return sessionStorage.getItem(SESSION_KEY) === "true";
}

function render() {
  if (!isLoggedIn()) {
    renderLogin();
    return;
  }

  const page = views[view] ? view : "dashboard";
  app.innerHTML = `
    <div class="app-shell">
      <aside class="sidebar">
        ${brand()}
        <nav class="nav">
          ${navItems.map(([id, label]) => navButton(id, label)).join("")}
        </nav>
        <button class="btn danger" data-action="logout">↗ Logout</button>
      </aside>
      <main class="main">
        ${views[page]()}
      </main>
      <nav class="mobile-nav">
        ${["dashboard", "members", "payments", "reports"].map((id) => mobileNavButton(id)).join("")}
      </nav>
      ${modalMarkup()}
    </div>
  `;
  attachCommonEvents();
  if (pageEvents[page]) pageEvents[page]();
  bindModalEvents();
}

function brand() {
  return `
    <div class="brand-lockup">
      <div class="brand-mark">DF</div>
      <div>
        <h1 class="brand-title">DEV FITNESS GYM</h1>
        <p class="brand-subtitle">Bokaro Steel City</p>
      </div>
    </div>
  `;
}

function navButton(id, label) {
  return `<button class="${view === id ? "active" : ""}" data-go="${id}"><span class="icon">${icons[id]}</span>${label}</button>`;
}

function mobileNavButton(id) {
  const item = navItems.find(([key]) => key === id);
  return `<button class="${view === id ? "active" : ""}" data-go="${id}"><span>${icons[id]}</span><span>${item[1]}</span></button>`;
}

function renderLogin() {
  app.innerHTML = `
    <div class="login-screen">
      <section class="login-panel">
        ${brand()}
        <h2>Front desk control.</h2>
        <form class="login-form" id="loginForm">
          <label class="field">
            <span>Username</span>
            <input name="username" autocomplete="username" value="admin" required />
          </label>
          <label class="field">
            <span>Password</span>
            <input name="password" type="password" autocomplete="current-password" value="devfitness" required />
          </label>
          <div class="error" id="loginError"></div>
          <button class="btn primary" type="submit">→ Login</button>
        </form>
        <p class="brand-subtitle">Demo credentials: admin / devfitness</p>
      </section>
      <section class="login-art" aria-label="Gym interior"></section>
    </div>
  `;

  document.querySelector("#loginForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const lockUntil = Number(localStorage.getItem("devfitness-lock") || 0);
    if (Date.now() < lockUntil) {
      document.querySelector("#loginError").textContent = "Locked after 5 failed attempts. Try again in 15 minutes.";
      return;
    }

    const form = new FormData(event.currentTarget);
    const ok = form.get("username") === state.admin.username && form.get("password") === state.admin.password;
    if (!ok) {
      const attempts = Number(localStorage.getItem("devfitness-attempts") || 0) + 1;
      localStorage.setItem("devfitness-attempts", String(attempts));
      if (attempts >= 5) {
        localStorage.setItem("devfitness-lock", String(Date.now() + 15 * 60 * 1000));
      }
      document.querySelector("#loginError").textContent = "Invalid username or password";
      return;
    }

    localStorage.removeItem("devfitness-attempts");
    localStorage.removeItem("devfitness-lock");
    sessionStorage.setItem(SESSION_KEY, "true");
    render();
  });
}

function attachCommonEvents() {
  document.querySelectorAll("[data-go]").forEach((button) => {
    button.addEventListener("click", () => {
      location.hash = button.dataset.go;
    });
  });
  document.querySelector('[data-action="logout"]')?.addEventListener("click", () => {
    sessionStorage.removeItem(SESSION_KEY);
    render();
  });
  document.querySelectorAll("[data-close-modal]").forEach((button) => {
    button.addEventListener("click", closeModal);
  });
}

function pageHeader(title, subtitle, actions = "") {
  return `
    <div class="topbar">
      <div class="page-title">
        <h1>${title}</h1>
        <p>${subtitle}</p>
      </div>
      <div class="actions">${actions}</div>
    </div>
  `;
}

function getMember(id) {
  return state.members.find((member) => member.id === id);
}

function statusOf(member) {
  if (member.paymentStatus === "Due" || member.dueOverride) return "Due";
  if (member.paymentStatus === "Pending") return "Due";
  const days = daysToExpiry(member.expiryDate);
  if (days < 0) return "Expired";
  if (days <= 7) return "Expiring Soon";
  return "Active";
}

function statusFromDates(expiryDate, dueOverride = false, paymentStatus = "Paid") {
  if (paymentStatus === "Due" || paymentStatus === "Pending" || dueOverride) return "Due";
  const days = daysToExpiry(expiryDate);
  if (days < 0) return "Expired";
  if (days <= 7) return "Expiring Soon";
  return "Active";
}

function daysToExpiry(expiryDate) {
  const today = new Date(`${todayISO()}T00:00:00`);
  const expiry = new Date(`${expiryDate}T00:00:00`);
  return Math.ceil((expiry - today) / 86400000);
}

function statusBadge(status) {
  const key = status.toLowerCase();
  return `<span class="badge ${key}">${status}</span>`;
}

function statCards() {
  const stats = computeStats();
  return `
    <div class="grid stats-grid">
      ${stat("Total Members", stats.total)}
      ${stat("Active", stats.active)}
      ${stat("Due", stats.due)}
      ${stat("Expiring Soon", stats.expiring)}
      ${stat("Expired", stats.expired)}
    </div>
  `;
}

function stat(label, value) {
  return `<section class="card stat"><span class="kicker">${label}</span><span class="value">${value}</span></section>`;
}

function computeStats() {
  const counts = { total: state.members.length, active: 0, due: 0, expiring: 0, expired: 0 };
  state.members.forEach((member) => {
    const status = statusOf(member).toLowerCase();
    if (status === "active") counts.active += 1;
    if (status === "due") counts.due += 1;
    if (status === "expiring soon") counts.expiring += 1;
    if (status === "expired") counts.expired += 1;
  });
  return counts;
}

const views = {
  dashboard() {
    const today = todayISO();
    const recentPayments = [...state.payments].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);
    const recentRegistrations = [...state.members].sort((a, b) => b.registeredAt.localeCompare(a.registeredAt)).slice(0, 5);
    const upcoming = state.members
      .filter((member) => daysToExpiry(member.expiryDate) >= 0 && daysToExpiry(member.expiryDate) <= 7)
      .sort((a, b) => a.expiryDate.localeCompare(b.expiryDate));
    const todayCollection = state.payments.filter((p) => p.date === today).reduce((sum, p) => sum + Number(p.amount), 0);
    const month = today.slice(0, 7);
    const monthlyCollection = state.payments.filter((p) => p.date.startsWith(month)).reduce((sum, p) => sum + Number(p.amount), 0);

    return `
      ${pageHeader("Dashboard", "Daily collections, renewals, and member risk in one place.", `<button class="btn primary" data-go="new-member">+ Add Member</button>`)}
      ${statCards()}
      <div class="grid two-col" style="margin-top:16px">
        <section class="card pad">
          <div class="section-head"><h2>Collections</h2><span class="money">${money(monthlyCollection)} this month</span></div>
          <div class="grid three-col">
            ${stat("Today", money(todayCollection))}
            ${stat("Monthly", money(monthlyCollection))}
            ${stat("Payments", state.payments.length)}
          </div>
          <div class="mini-chart">${monthlyBars()}</div>
        </section>
        <section class="card pad">
          <div class="section-head"><h2>Upcoming Expiries</h2><button class="btn" data-go="members">View Members</button></div>
          ${memberMiniTable(upcoming, "No memberships expiring in the next 7 days.")}
        </section>
      </div>
      <section class="card pad" style="margin-top:16px">
        <div class="section-head"><h2>Recent Payments</h2><button class="btn" data-go="payments">Ledger</button></div>
        ${paymentTable(recentPayments)}
      </section>
      <section class="card pad" style="margin-top:16px">
        <div class="section-head"><h2>Recent Registrations</h2><button class="btn" data-go="members">Members</button></div>
        ${memberMiniTable(recentRegistrations, "No registrations yet.")}
      </section>
    `;
  },

  members() {
    const filtered = getFilteredMembers();
    return `
      ${pageHeader("Members", "Search, filter, renew, and open the digital register page.", `<button class="btn primary" data-go="new-member">+ Add Member</button>`)}
      <section class="card pad">
        <div class="filters">
          <input id="memberSearch" placeholder="Search name or phone" value="${escapeHtml(document.querySelector("#memberSearch")?.value || "")}" />
          <select id="statusFilter">
            ${["all", "Active", "Due", "Expiring Soon", "Expired"].map((s) => `<option ${memberFilter === s ? "selected" : ""} value="${s}">${s === "all" ? "All Statuses" : s}</option>`).join("")}
          </select>
          <button class="btn" data-action="run-reminders">✆ Run Reminders</button>
          <button class="btn" data-action="reset-demo">↺ Reset Demo</button>
        </div>
        ${memberTable(filtered)}
      </section>
    `;
  },

  "new-member"() {
    return `
      ${pageHeader("Register Member", "Seven-step register replacement with plan and payment capture.")}
      <div class="wizard">
        <aside class="card steps">
          ${["Basic Info", "Address", "Trainer", "Health", "Membership", "Payment", "Terms"].map((label, index) => `
            <button class="step-pill ${registrationStep === index ? "active" : ""}" data-step="${index}">
              <span class="step-index">${index + 1}</span>${label}
            </button>
          `).join("")}
        </aside>
        <section class="card pad">
          <form id="memberForm">
            ${registrationStepMarkup()}
            <div class="actions" style="justify-content:space-between;margin-top:18px">
              <button class="btn" type="button" data-action="prev-step" ${registrationStep === 0 ? "disabled" : ""}>← Back</button>
              <div class="actions">
                <button class="btn" type="button" data-go="members">Cancel</button>
                <button class="btn primary" type="submit">${registrationStep === 6 ? "✓ Save Member" : "Next →"}</button>
              </div>
            </div>
          </form>
        </section>
      </div>
    `;
  },

  profile() {
    const member = getMember(selectedMemberId) || state.members[0];
    if (!member) return pageHeader("Member Profile", "No member selected.");
    selectedMemberId = member.id;
    const payments = state.payments.filter((payment) => payment.memberId === member.id).sort((a, b) => b.date.localeCompare(a.date));
    const reminders = state.reminders.filter((reminder) => reminder.memberId === member.id).sort((a, b) => b.sentAt.localeCompare(a.sentAt));
    const totalPaid = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
    const remaining = daysToExpiry(member.expiryDate);

    return `
      ${pageHeader(member.name, `${member.memberNo} · ${member.phoneDay}`, `
        <button class="btn primary" data-action="add-payment" data-id="${member.id}">+ Payment</button>
        <button class="btn" data-action="renew" data-id="${member.id}">↻ Renew</button>
        <button class="btn" data-action="edit-member" data-id="${member.id}">✎ Edit</button>
        <button class="btn" data-action="manual-reminder" data-id="${member.id}">✆ Reminder</button>
      `)}
      <div class="profile-grid">
        <section class="card pad">
          <div class="member-photo">${member.photo ? `<img src="${member.photo}" alt="${member.name}" />` : initials(member.name)}</div>
          <div class="detail-list" style="margin-top:14px">
            ${detail("Status", statusBadge(statusOf(member)))}
            ${detail("Payment Status", member.paymentStatus || "Paid")}
            ${detail("Age / Gender", `${member.age} / ${member.gender}`)}
            ${detail("Phone", member.phoneDay)}
            ${detail("Emergency", member.emergency || "-")}
            ${detail("Trainer", member.trainer)}
            ${detail("Registered", formatDate(member.registeredAt))}
            ${detail("Address", `${member.address}, ${member.city}`)}
          </div>
          ${member.signature ? `<div class="signature-box"><span class="label">Signature</span><img src="${member.signature}" alt="${member.name} signature" /></div>` : ""}
        </section>
        <div class="grid">
          <section class="card pad">
            <div class="section-head"><h2>Membership</h2>${statusBadge(statusOf(member))}</div>
            <div class="grid three-col">
              ${stat("Plan", planName(member))}
              ${stat("Expiry", formatDate(member.expiryDate))}
              ${stat("Remaining", remaining < 0 ? `${Math.abs(remaining)} days overdue` : `${remaining} days`)}
            </div>
          </section>
          <section class="card pad">
            <div class="section-head"><h2>Payment Summary</h2><span class="money">${money(totalPaid)}</span></div>
            ${paymentTable(payments)}
          </section>
          <section class="card pad">
            <div class="section-head"><h2>Membership History</h2></div>
            ${membershipTable(member.memberships || [])}
          </section>
          <section class="card pad">
            <div class="section-head"><h2>Health & Reminders</h2></div>
            <p><strong>Health flags:</strong> ${member.healthFlags.length ? member.healthFlags.join(", ") : "None recorded"}</p>
            <p class="muted">${member.healthNotes || "No extra health notes."}</p>
            ${reminderTable(reminders)}
          </section>
        </div>
      </div>
    `;
  },

  payments() {
    return `
      ${pageHeader("Payment Ledger", "Append-only financial record with filters and CSV export.", `<button class="btn primary" data-action="open-payment-global">+ Add Payment</button><button class="btn" data-action="export-payments">CSV</button><button class="btn" data-action="export-payments-xls">Excel</button><button class="btn" data-action="export-payments-pdf">PDF</button>`)}
      <section class="card pad">
        <div class="filters">
          <input id="paymentSearch" placeholder="Search member or remarks" />
          <input id="fromDate" type="date" />
          <input id="toDate" type="date" />
          <select id="paymentMode"><option value="">All Modes</option><option>Cash</option><option>UPI</option><option>Bank Transfer</option></select>
        </div>
        <div id="paymentLedger">${paymentTable(state.payments)}</div>
      </section>
    `;
  },

  reports() {
    return `
      ${pageHeader("Reports", "Preview member and collection reports before export.", `<button class="btn" data-action="export-report">CSV</button><button class="btn" data-action="export-report-xls">Excel</button><button class="btn" data-action="export-report-pdf">PDF</button>`)}
      <section class="card pad">
        <div class="filters">
          <select id="reportType">
            <option value="active">Active Members</option>
            <option value="due">Due Members</option>
            <option value="expiring">Expiring Members</option>
            <option value="expired">Expired Members</option>
            <option value="monthly">Monthly Collection</option>
            <option value="ledger">Payment Ledger</option>
          </select>
          <input id="reportMonth" type="month" value="${todayISO().slice(0, 7)}" />
          <span></span><span></span>
        </div>
        <div id="reportPreview">${reportPreview("active")}</div>
      </section>
    `;
  },

  reminders() {
    return `
      ${pageHeader("Reminder Logs", "Audit WhatsApp reminder attempts and duplicate prevention.", `<button class="btn primary" data-action="run-reminders">✆ Run Daily Job</button>`)}
      <section class="card pad">
        ${reminderTable(state.reminders)}
      </section>
    `;
  },

  plans() {
    return `
      ${pageHeader("Plans", "Manage Strength and Strength + Cardio pricing used during renewal.", `<button class="btn primary" data-action="save-plans">✓ Save Prices</button>`)}
      <form id="plansForm" class="grid two-col">
        ${Object.entries(state.plans).map(([key, plan]) => `
          <section class="card pad">
            <div class="section-head"><h2>${plan.label}</h2></div>
            <div class="form-grid">
              ${["1", "3", "6", "12"].map((duration) => `
                <label class="field">
                  <span>${duration} Month</span>
                  <input name="${key}-${duration}" type="number" min="1" value="${plan.prices[duration]}" />
                </label>
              `).join("")}
            </div>
          </section>
        `).join("")}
      </form>
    `;
  },

  settings() {
    return `
      ${pageHeader("Settings", "Single-admin credentials, WhatsApp configuration, and gym identity.")}
      <div class="grid two-col">
        <section class="card pad">
          <div class="section-head"><h2>Admin Password</h2></div>
          <form id="passwordForm" class="stack">
            <label class="field"><span>Current Password</span><input name="current" type="password" required /></label>
            <label class="field"><span>New Password</span><input name="next" type="password" minlength="6" required /></label>
            <button class="btn primary" type="submit">✓ Change Password</button>
          </form>
        </section>
        <section class="card pad">
          <div class="section-head"><h2>Gym Info</h2></div>
          <div class="detail-list">
            ${detail("Name", state.gym.name)}
            ${detail("Phone", state.gym.phone)}
            ${detail("Address", state.gym.address)}
            ${detail("Reminder Cron", state.reminderEnabled ? "Enabled at 9:00 AM" : "Disabled")}
          </div>
          <div class="service-list">${state.gym.services.map((service) => `<span>${service}</span>`).join("")}</div>
          <button class="btn" style="margin-top:14px" data-action="toggle-reminders">${state.reminderEnabled ? "Disable" : "Enable"} Reminders</button>
        </section>
        <section class="card pad">
          <div class="section-head"><h2>Data Backup</h2></div>
          <p class="muted">Export the full local database as JSON, or restore a previous DEV FITNESS backup file.</p>
          <div class="actions">
            <button class="btn primary" data-action="export-backup">↓ Backup JSON</button>
            <label class="btn">
              ↑ Restore
              <input id="restoreBackup" type="file" accept="application/json" hidden />
            </label>
          </div>
        </section>
      </div>
    `;
  },
};

const pageEvents = {
  dashboard() {},
  members() {
    document.querySelector("#memberSearch").addEventListener("input", render);
    document.querySelector("#statusFilter").addEventListener("change", (event) => {
      memberFilter = event.target.value;
      render();
    });
    bindMemberActions();
    document.querySelector('[data-action="run-reminders"]').addEventListener("click", runReminderJob);
    document.querySelector('[data-action="reset-demo"]').addEventListener("click", resetDemo);
  },
  "new-member"() {
    document.querySelectorAll("[data-step]").forEach((button) => {
      button.addEventListener("click", () => {
        syncDraft();
        registrationStep = Number(button.dataset.step);
        render();
      });
    });
    document.querySelector('[data-action="prev-step"]').addEventListener("click", () => {
      syncDraft();
      registrationStep = Math.max(0, registrationStep - 1);
      render();
    });
    document.querySelector("#memberForm").addEventListener("submit", (event) => {
      event.preventDefault();
      syncDraft();
      if (registrationStep < 6) {
        registrationStep += 1;
        render();
        return;
      }
      saveMemberFromDraft(event.currentTarget);
    });
    document.querySelectorAll("[data-price-affects]").forEach((field) => field.addEventListener("input", updateDraftAmount));
  },
  profile() {
    bindMemberActions();
  },
  payments() {
    ["paymentSearch", "fromDate", "toDate", "paymentMode"].forEach((id) => {
      document.querySelector(`#${id}`).addEventListener("input", updatePaymentLedger);
    });
    document.querySelector('[data-action="open-payment-global"]').addEventListener("click", () => openPaymentPrompt());
    document.querySelector('[data-action="export-payments"]').addEventListener("click", () => exportCSV("payments-ledger.csv", paymentRows(state.payments)));
    document.querySelector('[data-action="export-payments-xls"]').addEventListener("click", () => exportXLS("payments-ledger.xls", paymentRows(state.payments)));
    document.querySelector('[data-action="export-payments-pdf"]').addEventListener("click", () => printRows("Payment Ledger", paymentRows(state.payments)));
  },
  reports() {
    document.querySelector("#reportType").addEventListener("change", (event) => {
      document.querySelector("#reportPreview").innerHTML = reportPreview(event.target.value);
    });
    document.querySelector('[data-action="export-report"]').addEventListener("click", exportCurrentReport);
    document.querySelector('[data-action="export-report-xls"]').addEventListener("click", exportCurrentReportXLS);
    document.querySelector('[data-action="export-report-pdf"]').addEventListener("click", exportCurrentReportPDF);
  },
  reminders() {
    document.querySelector('[data-action="run-reminders"]').addEventListener("click", runReminderJob);
  },
  plans() {
    document.querySelector('[data-action="save-plans"]').addEventListener("click", () => {
      const form = new FormData(document.querySelector("#plansForm"));
      Object.keys(state.plans).forEach((key) => {
        ["1", "3", "6", "12"].forEach((duration) => {
          state.plans[key].prices[duration] = Number(form.get(`${key}-${duration}`));
        });
      });
      saveState();
      toast("Plans saved");
    });
  },
  settings() {
    document.querySelector("#passwordForm").addEventListener("submit", (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      if (form.get("current") !== state.admin.password) {
        toast("Current password is incorrect");
        return;
      }
      state.admin.password = form.get("next");
      saveState();
      event.currentTarget.reset();
      toast("Password changed");
    });
    document.querySelector('[data-action="toggle-reminders"]').addEventListener("click", () => {
      state.reminderEnabled = !state.reminderEnabled;
      saveState();
      render();
      toast(`Reminders ${state.reminderEnabled ? "enabled" : "disabled"}`);
    });
    document.querySelector('[data-action="export-backup"]').addEventListener("click", exportBackup);
    document.querySelector("#restoreBackup").addEventListener("change", restoreBackup);
  },
};

function modalMarkup() {
  if (!activeModal) return "";
  const member = getMember(activeModal.memberId) || state.members[0];
  if (!member && activeModal.type !== "payment") return "";
  const title = {
    payment: "Record Payment",
    renew: "Renew Membership",
    "edit-member": "Edit Member",
  }[activeModal.type];

  return `
    <div class="modal-backdrop" role="dialog" aria-modal="true">
      <section class="modal card">
        <div class="modal-head">
          <h2>${title}</h2>
          <button class="btn icon-only" data-close-modal title="Close">×</button>
        </div>
        ${modalBody(activeModal.type, member)}
      </section>
    </div>
  `;
}

function modalBody(type, member) {
  if (type === "payment") return paymentModal(member);
  if (type === "renew") return renewModal(member);
  if (type === "edit-member") return editMemberModal(member);
  return "";
}

function paymentModal(member) {
  return `
    <form id="paymentForm" class="stack">
      <div class="form-grid">
        <label class="field">
          <span>Member</span>
          <select name="memberId" required>
            ${state.members.map((item) => `<option value="${item.id}" ${member?.id === item.id ? "selected" : ""}>${item.memberNo} · ${item.name}</option>`).join("")}
          </select>
        </label>
        <label class="field"><span>Amount</span><input name="amount" type="number" min="1" value="1000" required /></label>
        <label class="field"><span>Date</span><input name="date" type="date" value="${todayISO()}" required /></label>
        ${selectPlain("Mode", "mode", ["Cash", "UPI", "Bank Transfer"], "Cash")}
        <label class="field full"><span>Remarks</span><input name="remarks" value="Membership payment" /></label>
      </div>
      <div class="actions modal-actions">
        <button class="btn" type="button" data-close-modal>Cancel</button>
        <button class="btn primary" type="submit">✓ Save Payment</button>
      </div>
    </form>
  `;
}

function renewModal(member) {
  const duration = member.durationMonths === "custom" ? "1" : member.durationMonths;
  const amount = state.plans[member.planKey]?.prices[duration] || 1000;
  const startBase = daysToExpiry(member.expiryDate) > 0 ? member.expiryDate : todayISO();
  return `
    <form id="renewForm" class="stack">
      <div class="member-summary">
        <strong>${member.memberNo} · ${member.name}</strong>
        <span>${planName(member)} expires ${formatDate(member.expiryDate)}</span>
      </div>
      <div class="form-grid">
        ${selectPlain("Plan", "planKey", [["strength", "Strength"], ["cardio", "Strength + Cardio"]], member.planKey === "custom" ? "strength" : member.planKey)}
        ${selectPlain("Duration", "duration", [["1", "1 Month"], ["3", "3 Months"], ["6", "6 Months"], ["12", "12 Months"]], duration)}
        <label class="field"><span>Start Date</span><input name="startDate" type="date" value="${startBase}" required /></label>
        <label class="field"><span>Payment Amount</span><input name="amount" type="number" min="1" value="${amount}" required /></label>
        ${selectPlain("Payment Mode", "mode", ["Cash", "UPI", "Bank Transfer"], "UPI")}
      </div>
      <div class="actions modal-actions">
        <button class="btn" type="button" data-close-modal>Cancel</button>
        <button class="btn primary" type="submit">↻ Renew</button>
      </div>
    </form>
  `;
}

function editMemberModal(member) {
  return `
    <form id="editMemberForm" class="stack">
      <div class="form-grid">
        <label class="field"><span>Full Name</span><input name="name" value="${escapeHtml(member.name)}" required /></label>
        <label class="field"><span>Age</span><input name="age" type="number" min="5" max="100" value="${member.age}" required /></label>
        ${selectPlain("Gender", "gender", ["Male", "Female"], member.gender)}
        <label class="field"><span>Phone Day</span><input name="phoneDay" pattern="[0-9]{10}" value="${member.phoneDay}" required /></label>
        <label class="field"><span>Phone Evening</span><input name="phoneEvening" pattern="[0-9]{10}" value="${member.phoneEvening || ""}" /></label>
        <label class="field"><span>Emergency</span><input name="emergency" pattern="[0-9]{10}" value="${member.emergency || ""}" /></label>
        <label class="field full"><span>Address</span><input name="address" value="${escapeHtml(member.address)}" required /></label>
        <label class="field"><span>City</span><input name="city" value="${escapeHtml(member.city)}" required /></label>
        <label class="field"><span>PIN</span><input name="pin" pattern="[0-9]{6}" value="${member.pin}" required /></label>
        ${selectPlain("Trainer", "trainer", ["Yes", "No"], member.trainer)}
        ${selectPlain("Payment Status", "paymentStatus", ["Paid", "Due", "Pending"], member.paymentStatus || (member.dueOverride ? "Due" : "Paid"))}
        <label class="field"><span>Photo</span><input name="photo" type="file" accept="image/*" /></label>
        <label class="field"><span>Signature</span><input name="signature" type="file" accept="image/*" /></label>
        <label class="field full"><span>Health Notes</span><textarea name="healthNotes">${escapeHtml(member.healthNotes || "")}</textarea></label>
        <label class="choice full"><input name="dueOverride" type="checkbox" ${member.dueOverride ? "checked" : ""} /> Mark as Due manually</label>
      </div>
      <div class="actions modal-actions">
        <button class="btn" type="button" data-close-modal>Cancel</button>
        <button class="btn primary" type="submit">✓ Save Changes</button>
      </div>
    </form>
  `;
}

function selectPlain(label, name, options, selected) {
  const items = options.map((option) => Array.isArray(option) ? option : [option, option]);
  return `<label class="field"><span>${label}</span><select name="${name}">${items.map(([value, text]) => `<option value="${value}" ${selected === value ? "selected" : ""}>${text}</option>`).join("")}</select></label>`;
}

function bindModalEvents() {
  document.querySelector("#paymentForm")?.addEventListener("submit", submitPaymentForm);
  document.querySelector("#renewForm")?.addEventListener("submit", submitRenewForm);
  document.querySelector("#editMemberForm")?.addEventListener("submit", submitEditMemberForm);
  document.querySelector("#renewForm select[name='planKey']")?.addEventListener("change", updateRenewAmount);
  document.querySelector("#renewForm select[name='duration']")?.addEventListener("change", updateRenewAmount);
}

function submitPaymentForm(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const member = getMember(form.get("memberId"));
  state.payments.push(payment(uid(), member.id, Number(form.get("amount")), form.get("mode"), form.get("date"), form.get("remarks") || "Membership payment"));
  member.dueOverride = false;
  member.paymentStatus = "Paid";
  saveState();
  activeModal = null;
  render();
  toast("Payment recorded");
}

function submitRenewForm(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const member = getMember(activeModal.memberId);
  const duration = form.get("duration");
  const startDate = form.get("startDate");
  const membershipAmount = Number(state.plans[form.get("planKey")]?.prices[duration] || form.get("amount"));
  member.planKey = form.get("planKey");
  member.durationMonths = duration;
  member.startDate = startDate;
  member.expiryDate = addDays(startDate, monthsToDays(duration));
  member.paymentStatus = "Paid";
  member.dueOverride = false;
  member.memberships = member.memberships || [];
  member.memberships.push({
    id: uid(),
    planKey: member.planKey,
    planName: planName(member),
    duration: `${duration} month`,
    startDate: member.startDate,
    expiryDate: member.expiryDate,
    membershipAmount,
    registrationFee: 0,
    totalAmount: Number(form.get("amount")),
    status: statusOf(member),
  });
  state.payments.push(payment(uid(), member.id, Number(form.get("amount")), form.get("mode"), todayISO(), `Renewal for ${duration}M`));
  saveState();
  activeModal = null;
  render();
  toast("Membership renewed");
}

function submitEditMemberForm(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const member = getMember(activeModal.memberId);
  const photoFile = form.get("photo");
  const signatureFile = form.get("signature");
  const save = async () => {
    const photoData = await fileToDataUrl(photoFile);
    const signatureData = await fileToDataUrl(signatureFile);
    ["name", "gender", "phoneDay", "phoneEvening", "emergency", "address", "city", "pin", "trainer", "healthNotes", "paymentStatus"].forEach((fieldName) => {
      member[fieldName] = form.get(fieldName);
    });
    member.age = Number(form.get("age"));
    member.dueOverride = form.has("dueOverride") || member.paymentStatus === "Due";
    if (photoData) member.photo = photoData;
    if (signatureData) member.signature = signatureData;
    saveState();
    activeModal = null;
    render();
    toast("Member updated");
  };
  save();
}

function updateRenewAmount() {
  const form = document.querySelector("#renewForm");
  const planKey = form.querySelector("select[name='planKey']").value;
  const duration = form.querySelector("select[name='duration']").value;
  form.querySelector("input[name='amount']").value = state.plans[planKey].prices[duration];
}

function registrationStepMarkup() {
  const healthOptions = ["Hypertension", "Diabetes", "Asthma", "Heart Disease", "Joint/Muscle Pain", "Pregnancy", "Spinal Disease", "Recent Injury", "Surgery in Past Year"];
  const steps = [
    `<div class="form-grid">
      ${field("Full Name", "name", "text", "required")}
      ${field("Age", "age", "number", "required min='5' max='100'")}
      ${selectField("Gender", "gender", ["Male", "Female"])}
      ${field("Phone Day", "phoneDay", "tel", "required pattern='[0-9]{10}'")}
      ${field("Phone Evening", "phoneEvening", "tel", "pattern='[0-9]{10}'")}
      ${field("Emergency Contact", "emergency", "tel", "pattern='[0-9]{10}'")}
      ${field("Registration Date", "registeredAt", "date", "required")}
    </div>`,
    `<div class="form-grid">
      ${field("Address", "address", "text", "required class='full'")}
      ${field("City", "city", "text", "required")}
      ${field("State", "stateName", "text", "required")}
      ${field("PIN Code", "pin", "text", "required pattern='[0-9]{6}'")}
    </div>`,
    `<div class="stack">
      <span class="label">Personal Trainer Required</span>
      <div class="option-row">${radio("trainer", "Yes")}${radio("trainer", "No")}</div>
    </div>`,
    `<div class="stack">
      <span class="label">Health History</span>
      <div class="option-row">${healthOptions.map((option) => checkbox("healthFlags", option)).join("")}</div>
      ${textareaField("Other Notes", "healthNotes")}
    </div>`,
    `<div class="form-grid">
      ${selectField("Plan", "planKey", [["strength", "Strength"], ["cardio", "Strength + Cardio"], ["custom", "Custom Plan"]], "data-price-affects")}
      ${selectField("Duration", "durationMonths", [["1", "1 Month"], ["3", "3 Months"], ["6", "6 Months"], ["12", "12 Months"], ["custom", "Custom Days"]], "data-price-affects")}
      ${field("Custom Days", "customDays", "number", "min='1' data-price-affects")}
      ${field("Custom Amount", "customAmount", "number", "min='1' data-price-affects")}
      <label class="choice full"><input name="waiveRegistration" type="checkbox" ${draftMember.waiveRegistration ? "checked" : ""} data-price-affects /> Waive Rs. 500 registration fee</label>
      <div class="card pad full"><strong>Calculated Amount:</strong> <span class="money" id="amountPreview">${money(calculatedAmount())}</span></div>
    </div>`,
    `<div class="form-grid">
      ${field("Amount Paid", "amountPaid", "number", "required min='1'")}
      ${selectField("Payment Mode", "paymentMode", ["Cash", "UPI", "Bank Transfer"])}
      ${field("Payment Date", "paymentDate", "date", "required")}
      ${field("Remarks", "remarks", "text")}
    </div>`,
    `<div class="stack">
      <label class="choice"><input name="terms" type="checkbox" ${draftMember.terms ? "checked" : ""} required /> Member accepted registration terms and health declaration</label>
      <div class="form-grid">
        <label class="field"><span>Member Photo</span><input name="photo" type="file" accept="image/*" /></label>
        <label class="field"><span>Signature Upload</span><input name="signature" type="file" accept="image/*" /></label>
      </div>
      <div class="card pad">
        <strong>Review</strong>
        <p>${draftMember.name || "New member"} · ${draftMember.phoneDay || "Phone pending"} · ${planName(draftMember)} · ${money(draftMember.amountPaid || calculatedAmount())}</p>
      </div>
    </div>`,
  ];
  return steps[registrationStep];
}

function field(label, name, type, extra = "") {
  const className = extra.includes("class='full'") ? " full" : "";
  const cleaned = extra.replace("class='full'", "");
  return `<label class="field${className}"><span>${label}</span><input name="${name}" type="${type}" value="${escapeHtml(draftMember[name] || "")}" ${cleaned} /></label>`;
}

function textareaField(label, name) {
  return `<label class="field"><span>${label}</span><textarea name="${name}">${escapeHtml(draftMember[name] || "")}</textarea></label>`;
}

function selectField(label, name, options, extra = "") {
  const items = options.map((option) => Array.isArray(option) ? option : [option, option]);
  return `<label class="field"><span>${label}</span><select name="${name}" ${extra}>${items.map(([value, text]) => `<option value="${value}" ${draftMember[name] === value ? "selected" : ""}>${text}</option>`).join("")}</select></label>`;
}

function radio(name, value) {
  return `<label class="choice"><input name="${name}" value="${value}" type="radio" ${draftMember[name] === value ? "checked" : ""} /> ${value}</label>`;
}

function checkbox(name, value) {
  return `<label class="choice"><input name="${name}" value="${value}" type="checkbox" ${draftMember[name].includes(value) ? "checked" : ""} /> ${value}</label>`;
}

function syncDraft() {
  const form = document.querySelector("#memberForm");
  if (!form) return;
  const data = new FormData(form);
  Object.keys(draftMember).forEach((key) => {
    if (key === "healthFlags") draftMember[key] = data.getAll("healthFlags");
    else if (key === "waiveRegistration" || key === "terms") draftMember[key] = data.has(key);
    else if (data.has(key)) draftMember[key] = data.get(key);
  });
  if (registrationStep === 4) draftMember.amountPaid = calculatedAmount();
}

function updateDraftAmount() {
  syncDraft();
  const preview = document.querySelector("#amountPreview");
  if (preview) preview.textContent = money(calculatedAmount());
}

function fileToDataUrl(file) {
  return new Promise((resolve) => {
    if (!file || !file.size) {
      resolve("");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}

function calculatedAmount() {
  let base = 0;
  if (draftMember.planKey === "custom" || draftMember.durationMonths === "custom") base = Number(draftMember.customAmount || 0);
  else base = Number(state.plans[draftMember.planKey]?.prices[draftMember.durationMonths] || 0);
  return base + (draftMember.waiveRegistration ? 0 : 500);
}

async function saveMemberFromDraft(formElement) {
  const form = new FormData(formElement);
  const photo = await fileToDataUrl(form.get("photo"));
  const signature = await fileToDataUrl(form.get("signature"));
  const days = draftMember.durationMonths === "custom" ? Number(draftMember.customDays) : monthsToDays(draftMember.durationMonths);
  const membershipAmount = draftMember.planKey === "custom" || draftMember.durationMonths === "custom"
    ? Number(draftMember.customAmount || 0)
    : Number(state.plans[draftMember.planKey]?.prices[draftMember.durationMonths] || 0);
  const registrationFee = draftMember.waiveRegistration ? 0 : 500;
  const member = {
    id: uid(),
    memberNo: `DEV-${String(state.nextMemberNumber).padStart(4, "0")}`,
    name: draftMember.name.trim(),
    age: Number(draftMember.age),
    gender: draftMember.gender,
    phoneDay: draftMember.phoneDay,
    phoneEvening: draftMember.phoneEvening,
    emergency: draftMember.emergency,
    registeredAt: draftMember.registeredAt,
    address: draftMember.address,
    city: draftMember.city,
    stateName: draftMember.stateName,
    pin: draftMember.pin,
    trainer: draftMember.trainer,
    healthFlags: draftMember.healthFlags,
    healthNotes: draftMember.healthNotes,
    planKey: draftMember.planKey,
    durationMonths: draftMember.durationMonths,
    customDays: draftMember.customDays,
    customAmount: draftMember.customAmount,
    startDate: draftMember.paymentDate,
    expiryDate: addDays(draftMember.paymentDate, days),
    dueOverride: false,
    paymentStatus: "Paid",
    photo,
    signature,
    memberships: [],
  };
  member.memberships.push({
    id: uid(),
    planKey: member.planKey,
    planName: planName(member),
    duration: member.durationMonths === "custom" ? `${member.customDays} days` : `${member.durationMonths} month`,
    startDate: member.startDate,
    expiryDate: member.expiryDate,
    membershipAmount,
    registrationFee,
    totalAmount: membershipAmount + registrationFee,
    status: statusOf(member),
  });
  state.nextMemberNumber += 1;
  state.members.push(member);
  state.payments.push(payment(uid(), member.id, Number(draftMember.amountPaid || calculatedAmount()), draftMember.paymentMode, draftMember.paymentDate, draftMember.remarks || "Registration payment"));
  saveState();
  selectedMemberId = member.id;
  draftMember = defaultMemberDraft();
  registrationStep = 0;
  location.hash = "profile";
  render();
  toast("Member registered");
}

function getFilteredMembers() {
  const search = (document.querySelector("#memberSearch")?.value || "").toLowerCase();
  return state.members.filter((member) => {
    const matchesSearch = [member.name, member.phoneDay, member.memberNo].join(" ").toLowerCase().includes(search);
    const status = statusOf(member);
    const matchesStatus = memberFilter === "all" || memberFilter === status;
    return matchesSearch && matchesStatus;
  });
}

function memberTable(members) {
  if (!members.length) return `<div class="empty">No members match this view.</div>`;
  return `
    <div class="table-wrap">
      <table>
        <thead><tr><th>No.</th><th>Name</th><th>Phone</th><th>Plan</th><th>Start</th><th>Expiry</th><th>Last Payment</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          ${members.map((member) => `
            <tr>
              <td><strong>${member.memberNo}</strong></td>
              <td>${member.name}</td>
              <td>${member.phoneDay}</td>
              <td>${planName(member)}</td>
              <td>${formatDate(member.startDate)}</td>
              <td>${formatDate(member.expiryDate)}</td>
              <td>${formatDate(lastPaymentDate(member.id))}</td>
              <td>${statusBadge(statusOf(member))}</td>
              <td class="actions">
                <button class="btn icon-only" title="View profile" data-action="view-profile" data-id="${member.id}">◎</button>
                <button class="btn icon-only" title="Add payment" data-action="add-payment" data-id="${member.id}">+</button>
                <button class="btn icon-only" title="Quick renew" data-action="renew" data-id="${member.id}">↻</button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function memberMiniTable(members, empty) {
  if (!members.length) return `<div class="empty">${empty}</div>`;
  return `
    <div class="table-wrap">
      <table>
        <thead><tr><th>Member</th><th>Expiry</th><th>Status</th></tr></thead>
        <tbody>${members.map((member) => `<tr><td>${member.name}</td><td>${formatDate(member.expiryDate)}</td><td>${statusBadge(statusOf(member))}</td></tr>`).join("")}</tbody>
      </table>
    </div>
  `;
}

function bindMemberActions() {
  document.querySelectorAll('[data-action="view-profile"]').forEach((button) => {
    button.addEventListener("click", () => {
      selectedMemberId = button.dataset.id;
      location.hash = "profile";
    });
  });
  document.querySelectorAll('[data-action="add-payment"]').forEach((button) => {
    button.addEventListener("click", () => openPaymentPrompt(button.dataset.id));
  });
  document.querySelectorAll('[data-action="renew"]').forEach((button) => {
    button.addEventListener("click", () => openRenewModal(button.dataset.id));
  });
  document.querySelectorAll('[data-action="edit-member"]').forEach((button) => {
    button.addEventListener("click", () => openEditMemberModal(button.dataset.id));
  });
  document.querySelectorAll('[data-action="manual-reminder"]').forEach((button) => {
    button.addEventListener("click", () => manualReminder(button.dataset.id));
  });
}

function openPaymentPrompt(memberId = null) {
  activeModal = { type: "payment", memberId: memberId || state.members[0]?.id };
  render();
}

function openRenewModal(memberId) {
  activeModal = { type: "renew", memberId };
  render();
}

function openEditMemberModal(memberId) {
  activeModal = { type: "edit-member", memberId };
  render();
}

function closeModal() {
  activeModal = null;
  render();
}

function updatePaymentLedger() {
  const search = document.querySelector("#paymentSearch").value.toLowerCase();
  const from = document.querySelector("#fromDate").value;
  const to = document.querySelector("#toDate").value;
  const mode = document.querySelector("#paymentMode").value;
  const rows = state.payments.filter((payment) => {
    const member = getMember(payment.memberId);
    const text = `${member?.name || ""} ${payment.remarks || ""}`.toLowerCase();
    return (!search || text.includes(search)) && (!from || payment.date >= from) && (!to || payment.date <= to) && (!mode || payment.mode === mode);
  });
  document.querySelector("#paymentLedger").innerHTML = paymentTable(rows);
}

function paymentTable(payments) {
  if (!payments.length) return `<div class="empty">No payments recorded yet.</div>`;
  const total = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
  return `
    <div class="table-wrap">
      <table>
        <thead><tr><th>Payment ID</th><th>Date</th><th>Member</th><th>Amount</th><th>Mode</th><th>Remarks</th></tr></thead>
        <tbody>
          ${payments.map((payment) => {
            const member = getMember(payment.memberId);
            return `<tr><td><strong>${shortId(payment.id)}</strong></td><td>${formatDate(payment.date)}</td><td>${member?.name || "Unknown"}</td><td class="money">${money(payment.amount)}</td><td>${payment.mode}</td><td>${payment.remarks || "-"}</td></tr>`;
          }).join("")}
          <tr><td colspan="3"><strong>Total</strong></td><td class="money">${money(total)}</td><td colspan="2"></td></tr>
        </tbody>
      </table>
    </div>
  `;
}

function membershipTable(memberships) {
  if (!memberships.length) return `<div class="empty">No membership history recorded.</div>`;
  return `
    <div class="table-wrap">
      <table>
        <thead><tr><th>ID</th><th>Plan</th><th>Duration</th><th>Start</th><th>Expiry</th><th>Membership</th><th>Reg. Fee</th><th>Total</th><th>Status</th></tr></thead>
        <tbody>
          ${memberships.map((membership) => `
            <tr>
              <td><strong>${shortId(membership.id)}</strong></td>
              <td>${membership.planName}</td>
              <td>${membership.duration}</td>
              <td>${formatDate(membership.startDate)}</td>
              <td>${formatDate(membership.expiryDate)}</td>
              <td class="money">${money(membership.membershipAmount)}</td>
              <td class="money">${money(membership.registrationFee)}</td>
              <td class="money">${money(membership.totalAmount)}</td>
              <td>${statusBadge(statusFromDates(membership.expiryDate, false, membership.status === "Due" ? "Due" : "Paid"))}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function reminderTable(reminders) {
  if (!reminders.length) return `<div class="empty">No reminders sent yet.</div>`;
  return `
    <div class="table-wrap">
      <table>
        <thead><tr><th>Member</th><th>Phone</th><th>Type</th><th>Sent At</th><th>Status</th></tr></thead>
        <tbody>
          ${reminders.map((reminder) => {
            const member = getMember(reminder.memberId);
            return `<tr><td>${member?.name || "Unknown"}</td><td>${member?.phoneDay || "-"}</td><td>${reminder.type}</td><td>${formatDate(reminder.sentAt)}</td><td>${statusBadge(reminder.status === "Sent" ? "Active" : "Due").replace(reminder.status === "Sent" ? "Active" : "Due", reminder.status)}</td></tr>`;
          }).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function runReminderJob() {
  if (!state.reminderEnabled) {
    toast("Reminder schedule is disabled");
    return;
  }
  let sent = 0;
  state.members.forEach((member) => {
    const days = daysToExpiry(member.expiryDate);
    let type = null;
    if (days === 7) type = "7-day";
    if (days === 3) type = "3-day";
    if (days === 0) type = "expiry-day";
    if (days < 0) type = "expired";
    if (!type) return;
    const duplicate = state.reminders.some((reminder) => reminder.memberId === member.id && reminder.type === type && reminder.sentAt === todayISO());
    if (!duplicate) {
      state.reminders.push(reminder(uid(), member.id, type, todayISO(), "Sent"));
      sent += 1;
    }
  });
  saveState();
  render();
  toast(sent ? `${sent} reminders logged` : "No reminders due today");
}

function manualReminder(memberId) {
  const member = getMember(memberId);
  state.reminders.push(reminder(uid(), member.id, "manual", todayISO(), "Sent"));
  saveState();
  render();
  toast("Manual reminder logged");
}

function reportPreview(type) {
  if (type === "monthly" || type === "ledger") return paymentTable(state.payments);
  const statusMap = { active: "Active", due: "Due", expiring: "Expiring Soon", expired: "Expired" };
  return memberTable(state.members.filter((member) => statusOf(member) === statusMap[type]));
}

function exportCurrentReport() {
  const type = document.querySelector("#reportType").value;
  if (type === "monthly" || type === "ledger") exportCSV(`${type}-report.csv`, paymentRows(state.payments));
  else exportCSV(`${type}-members.csv`, memberRows(reportMembers(type)));
}

function exportCurrentReportXLS() {
  const type = document.querySelector("#reportType").value;
  if (type === "monthly" || type === "ledger") exportXLS(`${type}-report.xls`, paymentRows(state.payments));
  else exportXLS(`${type}-members.xls`, memberRows(reportMembers(type)));
}

function exportCurrentReportPDF() {
  const type = document.querySelector("#reportType").value;
  if (type === "monthly" || type === "ledger") printRows(`${type} report`, paymentRows(state.payments));
  else printRows(`${type} members`, memberRows(reportMembers(type)));
}

function reportMembers(type) {
  const statusMap = { active: "Active", due: "Due", expiring: "Expiring Soon", expired: "Expired" };
  return state.members.filter((member) => statusOf(member) === statusMap[type]);
}

function paymentRows(payments) {
  return [
    ["payment_id", "date", "member_no", "member", "amount", "mode", "remarks"],
    ...payments.map((payment) => {
      const member = getMember(payment.memberId);
      return [payment.id, payment.date, member?.memberNo || "", member?.name || "", payment.amount, payment.mode, payment.remarks || ""];
    }),
  ];
}

function memberRows(members) {
  return [
    ["member_no", "name", "phone", "plan", "start_date", "expiry_date", "status"],
    ...members.map((member) => [member.memberNo, member.name, member.phoneDay, planName(member), member.startDate, member.expiryDate, statusOf(member)]),
  ];
}

function exportCSV(filename, rows) {
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function exportXLS(filename, rows) {
  const table = rowsToHtmlTable(rows);
  const blob = new Blob([`<html><body>${table}</body></html>`], { type: "application/vnd.ms-excel;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function printRows(title, rows) {
  const win = window.open("", "_blank");
  if (!win) {
    toast("Allow popups to print PDF");
    return;
  }
  win.document.write(`
    <html>
      <head>
        <title>${escapeHtml(title)}</title>
        <style>
          body{font-family:Arial,sans-serif;padding:24px;color:#151515}
          h1{font-size:22px}
          table{width:100%;border-collapse:collapse}
          th,td{border:1px solid #ccc;padding:8px;text-align:left;font-size:12px}
          th{background:#f3f3f3}
        </style>
      </head>
      <body>
        <h1>${escapeHtml(title)}</h1>
        ${rowsToHtmlTable(rows)}
      </body>
    </html>
  `);
  win.document.close();
  win.focus();
  win.print();
}

function rowsToHtmlTable(rows) {
  return `<table>${rows.map((row, index) => `<tr>${row.map((cell) => index === 0 ? `<th>${escapeHtml(cell)}</th>` : `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}</table>`;
}

function exportBackup() {
  const payload = {
    product: "DEV FITNESS GYM",
    version: 1,
    exportedAt: new Date().toISOString(),
    data: state,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `devfitness-backup-${todayISO()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function restoreBackup(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      const restored = parsed.data || parsed;
      if (!Array.isArray(restored.members) || !Array.isArray(restored.payments)) {
        throw new Error("Invalid backup");
      }
      if (!confirm("Restore this backup and replace the current local data?")) return;
      state = restored;
      saveState();
      render();
      toast("Backup restored");
    } catch (error) {
      toast("Could not restore backup file");
    }
  };
  reader.readAsText(file);
}

function monthlyBars() {
  const month = todayISO().slice(0, 7);
  const days = Array.from({ length: 10 }, (_, index) => String(index + 1).padStart(2, "0"));
  const totals = days.map((day) => state.payments.filter((payment) => payment.date === `${month}-${day}`).reduce((sum, payment) => sum + Number(payment.amount), 0));
  const max = Math.max(...totals, 1);
  return totals.map((total) => `<div class="bar" title="${money(total)}" style="height:${Math.max(7, (total / max) * 100)}%"></div>`).join("");
}

function planName(member) {
  if (member.planKey === "custom") return "Custom Plan";
  return state.plans[member.planKey]?.label || "Strength";
}

function lastPaymentDate(memberId) {
  const payment = state.payments
    .filter((item) => item.memberId === memberId)
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  return payment?.date || "";
}

function initials(name) {
  return name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();
}

function shortId(id) {
  return String(id || "").slice(0, 8).toUpperCase();
}

function detail(label, value) {
  return `<div class="detail"><span class="muted">${label}</span><strong>${value}</strong></div>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
}

function uid() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function toast(message) {
  document.querySelector(".toast")?.remove();
  const node = document.createElement("div");
  node.className = "toast";
  node.textContent = message;
  document.body.append(node);
  setTimeout(() => node.remove(), 2600);
}

function resetDemo() {
  if (!confirm("Reset demo data?")) return;
  state = seedState();
  saveState();
  render();
  toast("Demo data reset");
}

render();
