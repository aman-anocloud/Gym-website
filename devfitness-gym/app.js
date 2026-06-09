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
  dashboard: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`,
  members: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
  renewals: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-9.21l5.64-5.64"/></svg>`,
  payments: "₹",
  reports: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>`,
  reminders: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>`,
  plans: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>`,
  settings: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
};

const navItems = [
  ["dashboard", "Dashboard"],
  ["members", "Members"],
  ["renewals", "Renewal Center"],
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
let showNotifications = false;
let mobileMenuOpen = false;

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
    name: "DEV FITNESS GYM",
    phone: "9572762242",
    address: "1st Floor of Co-Operative Maintenance Office, Near SBI & BOI ATM, Bokaro Steel City, Jharkhand - 827013",
    services: ["Personal Training", "Bodybuilding", "Cardio", "Powerlifting", "Yoga", "Zumba", "Aerobics", "Weight Loss", "Weight Gain", "Supplements"],
    ...(saved.gym || {}),
  };
  if (saved.gym.registrationFee === undefined) saved.gym.registrationFee = 500;
  if (!saved.gym.reminderSettings) saved.gym.reminderSettings = { daysBefore: [7, 3, 1] };
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
      registrationFee: 500,
      reminderSettings: { daysBefore: [7, 3, 1] }
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
      reminder("r3", "m1", "7-day", addDays(today, -2), "Failed"),
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
  const notifs = computeNotifications();
  
  app.innerHTML = `
    <div class="app-shell">
      <div class="sidebar-backdrop ${mobileMenuOpen ? "show" : ""}" data-action="close-menu"></div>
      <aside class="sidebar ${mobileMenuOpen ? "open" : ""}">
        <div class="sidebar-header">
          ${brand()}
          <button class="btn icon-only close-menu-btn" data-action="close-menu" title="Close Menu">×</button>
        </div>
        <nav class="nav">
          ${navItems.map(([id, label]) => navButton(id, label)).join("")}
        </nav>
        <button class="btn danger" data-action="logout">↗ Logout</button>
      </aside>
      
      <div class="main-container">
        <header class="app-header">
          <button class="hamburger-btn" data-action="toggle-menu" title="Open Menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
          <div class="header-title">${navItems.find(([key]) => key === page)?.[1] || "Dashboard"}</div>
          <div class="header-right">
            <div class="notification-container">
              <button class="notification-bell" data-action="toggle-notifications" title="Notifications">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2zm6-6V11a6 6 0 0 0-5-5.91V4a1 1 0 0 0-2 0v1.09A6 6 0 0 0 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>
                ${notifs.total > 0 ? `<span class="bell-badge">${notifs.total}</span>` : ""}
              </button>
              <div class="notification-dropdown ${showNotifications ? "show" : ""}">
                <div class="dropdown-header">Notifications</div>
                <div class="dropdown-body">
                  <div class="notification-item ${notifs.due > 0 ? "due" : ""}" data-go="renewals" data-tab="due">
                    <span class="icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff4444" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></span>
                    <div>
                      <strong>${notifs.due} Pending Dues</strong>
                      <p>Members awaiting payment</p>
                    </div>
                  </div>
                  <div class="notification-item ${notifs.expiring > 0 ? "expiring" : ""}" data-go="renewals" data-tab="this-week">
                    <span class="icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></span>
                    <div>
                      <strong>${notifs.expiring} Expiring Soon</strong>
                      <p>Renewals due in next 7 days</p>
                    </div>
                  </div>
                  <div class="notification-item ${notifs.failed > 0 ? "failed" : ""}" data-go="reminders">
                    <span class="icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff4444" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg></span>
                    <div>
                      <strong>${notifs.failed} Failed Reminders</strong>
                      <p>WhatsApp reminders failed</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <button class="btn primary add-member-quick-btn" data-go="new-member">+ Add Member</button>
          </div>
        </header>
        
        <main class="main">
          ${views[page]()}
        </main>
      </div>
      
      ${modalMarkup()}
    </div>
  `;
  attachCommonEvents();
  if (pageEvents[page]) pageEvents[page]();
  bindModalEvents();
}

function brand() {
  const gymName = state?.gym?.name || "DEV FITNESS GYM";
  const address = state?.gym?.address || "Bokaro Steel City";
  const parts = address.split(",");
  const cityPart = parts.length > 1 ? parts[parts.length - 2].trim() : "Bokaro Steel City";

  const svgMark = `
    <svg width="40" height="20" viewBox="0 0 80 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M 4 5 L 18 5 L 26 13 L 26 27 L 18 35 L 4 35 Z M 10 11 L 10 29 L 16 29 L 20 25 L 20 15 L 16 11 Z" fill="currentColor"/>
      <rect x="29" y="5" width="5" height="30" rx="1" fill="currentColor"/>
      <rect x="33" y="5" width="14" height="5" fill="currentColor"/>
      <rect x="45" y="2" width="4" height="11" rx="1" fill="currentColor"/>
      <rect x="33" y="17.5" width="11" height="5" fill="currentColor"/>
      <rect x="42" y="15" width="4" height="10" rx="1" fill="currentColor"/>
      <rect x="37.5" y="17.5" width="3" height="5" fill="#e60000"/>
      <rect x="33" y="30" width="14" height="5" fill="currentColor"/>
      <rect x="45" y="27" width="4" height="11" rx="1" fill="currentColor"/>
      <path d="M 52 5 L 60 5 L 65 24 L 70 5 L 78 5 L 68 35 L 62 35 Z" fill="currentColor"/>
    </svg>`;

  return `
    <div class="brand-lockup">
      <div class="brand-mark" style="background:transparent; padding:0; border:none; display:flex; align-items:center; color: var(--brand);">$_{svgMark}</div>
      <div>
        <h1 class="brand-title">${escapeHtml(gymName)}</h1>
        <p class="brand-subtitle">${escapeHtml(cityPart)}</p>
      </div>
    </div>
  `.replace('$_{svgMark}', svgMark);
}

function navButton(id, label) {
  return `<button class="${view === id ? "active" : ""}" data-go="${id}"><span class="icon">${icons[id] || "◆"}</span>${label}</button>`;
}

function renderLogin() {
  const gymName  = state?.gym?.name    || "DEV FITNESS GYM";
  const gymPhone = state?.gym?.phone   || "9572762242";
  const gymAddr  = state?.gym?.address || "Bokaro Steel City";
  const cityPart = gymAddr.split(",").find(p => p.toLowerCase().includes("bokaro"))?.trim() || "Bokaro Steel City";

  app.innerHTML = `
    <div class="login-screen-v2">

      <!-- Full-screen background -->
      <div class="login-bg"></div>
      <div class="login-overlay"></div>

      <!-- LEFT: Brand & Info Panel -->
      <div class="login-left">
        <div class="login-left-inner">

          <!-- Creative Logo Block -->
          <div class="login-brand-block">
            <!-- Custom DEV Dumbbell Lettermark Logo -->
            <div class="login-brand-mark">
              <svg width="80" height="40" viewBox="0 0 80 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- D: Complete Sharp -->
                <path d="M 4 5 L 18 5 L 26 13 L 26 27 L 18 35 L 4 35 Z M 10 11 L 10 29 L 16 29 L 20 25 L 20 15 L 16 11 Z" fill="white"/>

                <!-- E (Barbell) -->
                <!-- Left vertical stem -->
                <rect x="29" y="5" width="5" height="30" rx="1" fill="white"/>
                
                <!-- Top horizontal rod + plate -->
                <rect x="33" y="5" width="14" height="5" fill="white"/>
                <rect x="45" y="2" width="4" height="11" rx="1" fill="white"/>
                
                <!-- Middle horizontal rod + plate -->
                <rect x="33" y="17.5" width="11" height="5" fill="white"/>
                <rect x="42" y="15" width="4" height="10" rx="1" fill="white"/>
                <rect x="37.5" y="17.5" width="3" height="5" fill="#e60000"/>

                <!-- Bottom horizontal rod + plate -->
                <rect x="33" y="30" width="14" height="5" fill="white"/>
                <rect x="45" y="27" width="4" height="11" rx="1" fill="white"/>
                
                <!-- V: Clean aggressive -->
                <path d="M 52 5 L 60 5 L 65 24 L 70 5 L 78 5 L 68 35 L 62 35 Z" fill="white"/>
              </svg>
            </div>
            <div>
              <div class="login-gym-city">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                ${cityPart} &nbsp;&middot;&nbsp; Est. 2020
              </div>
            </div>
          </div>

          <!-- HERO: Unique Split-Word Gym Branding (tasteful sizing) -->
          <div class="login-hero-brand">
            <!-- FITNESS — fire gradient (the hero word) -->
            <div class="hero-word hero-fitness">
              <span class="hw-inner">FITNESS</span>
              <div class="fitness-reflection">FITNESS</div>
            </div>

            <!-- Laser divider + dumbbell icon -->
            <div class="hero-laser">
              <div class="laser-line"></div>
              <svg class="laser-dumbbell" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/></svg>
              <div class="laser-line"></div>
            </div>

            <!-- GYM — neon outline -->
            <div class="hero-word hero-gym">
              <span class="hw-inner">GYM</span>
            </div>
          </div>

          <!-- Gym details -->
          <div class="login-gym-details">
            <div class="gym-detail-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/></svg>
              ${gymPhone}
            </div>
            <div class="gym-detail-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>
              ${cityPart}, Jharkhand
            </div>
          </div>

          <!-- Feature stats -->
          <div class="login-stats-row">
            <div class="login-stat-badge">
              <div class="login-stat-val">500+</div>
              <div class="login-stat-lbl">Members Managed</div>
            </div>
            <div class="login-stat-badge">
              <div class="login-stat-val">₹10L+</div>
              <div class="login-stat-lbl">Payments Tracked</div>
            </div>
            <div class="login-stat-badge">
              <div class="login-stat-val">1000+</div>
              <div class="login-stat-lbl">Renewals Done</div>
            </div>
          </div>

        </div>

        <!-- Footer -->
        <div class="login-footer">
          <span>DEV FITNESS GYM Management System · v1.0</span>
          <span>Powered by AnoCloud</span>
        </div>
      </div>

      <!-- RIGHT: Login Card -->
      <div class="login-right">
        <div class="login-card">
          <div class="login-card-header">
            <div class="login-card-title">Welcome Back</div>
            <div class="login-card-sub">Sign in to access your gym dashboard</div>
          </div>

          <form class="login-form" id="loginForm">
            <label class="field">
              <span>Username</span>
              <input name="username" autocomplete="username" value="admin" required placeholder="Enter username" />
            </label>
            <label class="field">
              <span>Password</span>
              <input name="password" type="password" autocomplete="current-password" value="devfitness" required placeholder="Enter password" />
            </label>
            <div class="error" id="loginError"></div>
            <button class="btn primary login-submit-btn" type="submit">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
              Login to Dashboard
            </button>
          </form>

          <div class="login-demo-creds">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
            Demo: admin / devfitness
          </div>
        </div>
      </div>

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
      mobileMenuOpen = false;
      showNotifications = false;
      if (button.dataset.tab) {
        sessionStorage.setItem("renewals-active-tab", button.dataset.tab);
      }
    });
  });
  document.querySelector('[data-action="logout"]')?.addEventListener("click", () => {
    sessionStorage.removeItem(SESSION_KEY);
    render();
  });
  document.querySelectorAll("[data-close-modal]").forEach((button) => {
    button.addEventListener("click", closeModal);
  });
  
  document.querySelector('[data-action="toggle-menu"]')?.addEventListener("click", () => {
    mobileMenuOpen = !mobileMenuOpen;
    showNotifications = false;
    render();
  });
  document.querySelectorAll('[data-action="close-menu"]').forEach((el) => {
    el.addEventListener("click", () => {
      mobileMenuOpen = false;
      render();
    });
  });
  
  document.querySelector('[data-action="toggle-notifications"]')?.addEventListener("click", (e) => {
    e.stopPropagation();
    showNotifications = !showNotifications;
    render();
  });
  
  document.addEventListener("click", (e) => {
    if (showNotifications && !e.target.closest(".notification-container")) {
      showNotifications = false;
      const dropdown = document.querySelector(".notification-dropdown");
      if (dropdown) dropdown.classList.remove("show");
    }
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

function getDuesAmount(member) {
  if (member.paymentStatus !== "Due" && !member.dueOverride) return 0;
  const lastMs = member.memberships?.[member.memberships.length - 1];
  if (!lastMs) return 500;
  
  const periodPayments = state.payments
    .filter(p => p.memberId === member.id && p.date >= lastMs.startDate)
    .reduce((sum, p) => sum + Number(p.amount), 0);
  
  const due = lastMs.totalAmount - periodPayments;
  return due > 0 ? due : lastMs.totalAmount;
}

function computeNotifications() {
  const activeDuesCount = state.members.filter(m => statusOf(m) === "Due").length;
  const expiringSoonCount = state.members.filter(m => statusOf(m) === "Expiring Soon").length;
  const failedRemindersCount = state.reminders.filter(r => r.status === "Failed").length;
  
  return {
    due: activeDuesCount,
    expiring: expiringSoonCount,
    failed: failedRemindersCount,
    total: activeDuesCount + expiringSoonCount + failedRemindersCount
  };
}

function statusBadge(status) {
  const key = status.toLowerCase().replace(/\s+/g, "-");
  return `<span class="badge ${key}">${status}</span>`;
}

function statCards() {
  const stats = computeStats();
  const today = todayISO();

  const urgentItems = [
    stats.due > 0     ? { label: "Due Payments",    val: stats.due,      cls: "stat-danger",  icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>` } : null,
    stats.expiring > 0 ? { label: "Expiring Soon",  val: stats.expiring, cls: "stat-warning", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>` } : null,
    stats.pendingReminders > 0 ? { label: "Pending Reminders", val: stats.pendingReminders, cls: "stat-warning", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2zm6-6V11a6 6 0 0 0-5-5.91V4a1 1 0 0 0-2 0v1.09A6 6 0 0 0 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>` } : null,
  ].filter(Boolean);

  const urgentHtml = urgentItems.length > 0 ? `
    <div class="attention-section">
      <div class="attention-header">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
        Attention Required
      </div>
      <div class="attention-grid">
        ${urgentItems.map(it => `
          <div class="attention-item ${it.cls}">
            <span class="attention-icon">${it.icon}</span>
            <div>
              <div class="attention-val">${it.val}</div>
              <div class="attention-label">${it.label}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  ` : `
    <div class="attention-section all-clear">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
      All Clear — No urgent items today!
    </div>
  `;

  return `
    ${urgentHtml}
    <div class="grid stats-grid">
      ${stat("Total Members",    stats.total,               "stat-neutral", `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`)}
      ${stat("Active Members",   stats.active,             "stat-success", `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`)}
      ${stat("Due Payments",     stats.due,                "stat-danger",  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`)}
      ${stat("Expiring Soon",    stats.expiring > 0 ? stats.expiring : "✓ None", stats.expiring > 0 ? "stat-warning" : "stat-success", `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`)}
      ${stat("Expired Members",  stats.expired,             "stat-muted",   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`)}
      ${stat("This Month",       money(stats.monthlyCollection), "stat-success", `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`)}
      ${stat("Renewals / Month", stats.renewalsThisMonth,   "stat-neutral", `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>`)}
      ${stat("Pending Reminders",stats.pendingReminders > 0 ? stats.pendingReminders : "✓ All sent", stats.pendingReminders > 0 ? "stat-warning" : "stat-success", `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2zm6-6V11a6 6 0 0 0-5-5.91V4a1 1 0 0 0-2 0v1.09A6 6 0 0 0 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>`)}
    </div>
  `;
}

function stat(label, value, colorClass = "stat-neutral", iconSvg = "") {
  return `<section class="card stat ${colorClass}">
    <div class="stat-top">${iconSvg}<span class="kicker">${label}</span></div>
    <span class="value">${value}</span>
  </section>`;
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
  
  const today = todayISO();
  const currentYear = today.slice(0, 4);
  const currentMonth = today.slice(0, 7);

  const revenueThisYear = state.payments
    .filter(p => p.date.startsWith(currentYear))
    .reduce((sum, p) => sum + Number(p.amount), 0);
    
  const monthlyCollection = state.payments
    .filter(p => p.date.startsWith(currentMonth))
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const todayCollection = state.payments
    .filter(p => p.date === today)
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const renewalsThisMonth = state.members
    .filter(m => m.expiryDate.slice(0, 7) === currentMonth).length;
    
  const pendingReminders = state.members.filter(member => {
    const status = statusOf(member);
    if (status === "Due" || status === "Expired" || status === "Expiring Soon") {
      const sentToday = state.reminders.some(r => r.memberId === member.id && r.sentAt === today);
      return !sentToday;
    }
    return false;
  }).length;
  
  return { ...counts, revenueThisYear, monthlyCollection, todayCollection, renewalsThisMonth, pendingReminders };
}

const views = {
  dashboard() {
    const today = todayISO();
    const stats = computeStats();
    const recentPayments = [...state.payments].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
    const recentRegistrations = [...state.members].sort((a, b) => b.registeredAt.localeCompare(a.registeredAt)).slice(0, 4);
    
    const upcoming = state.members
      .filter((member) => daysToExpiry(member.expiryDate) >= 0 && daysToExpiry(member.expiryDate) <= 7)
      .sort((a, b) => a.expiryDate.localeCompare(b.expiryDate));

    const expiringToday = state.members.filter(m => daysToExpiry(m.expiryDate) === 0).length;
    const duePay = state.members.filter(m => statusOf(m) === "Due").length;
    const failedRem = state.reminders.filter(r => r.status === "Failed").length;
    
    // Greeting
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

    // Recent Activity feed from payments + reminders
    const activityItems = [
      ...state.payments.map(p => { const m = state.members.find(x => x.id === p.memberId); return { date: p.date, text: `Payment of ${money(p.amount)} received from ${m?.name || 'Unknown'}`, icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>', type: 'payment' }; }),
      ...state.reminders.filter(r => r.status === "Sent").map(r => { const m = state.members.find(x => x.id === r.memberId); return { date: r.sentAt, text: `Reminder sent to ${m?.name || 'Unknown'}`, icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>', type: 'reminder' }; }),
      ...state.members.map(m => ({ date: m.registeredAt, text: `${m.name} joined as a new member`, icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00b0ff" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>', type: 'register' })),
    ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);

    // Payment health
    const paidCount = state.members.filter(m => statusOf(m) === "Active").length;
    const dueCount = state.members.filter(m => statusOf(m) === "Due").length;
    const expiredCount = state.members.filter(m => statusOf(m) === "Expired").length;
    const totalForHealth = paidCount + dueCount + expiredCount || 1;

    return `
      <!-- Greeting Banner -->
      <div class="dash-greeting">
        <div>
          <div class="dash-greeting-title">${greeting}, Admin</div>
          <div class="dash-greeting-sub">Welcome back to DEV FITNESS GYM · ${new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long' })}</div>
        </div>
        <div class="dash-summary-pills">
          <span class="pill pill-green">${stats.active} Active</span>
          <span class="pill pill-red">${stats.due} Due</span>
          <span class="pill pill-yellow">${stats.expiring} Expiring</span>
          <span class="pill pill-white">${money(stats.monthlyCollection)} This Month</span>
        </div>
      </div>

      ${statCards()}
      ${quickActionsSection()}

      <!-- Row: Today's Action Center + Renewal Center Widget -->
      <div class="grid two-col" style="margin-top:20px">
        <!-- TODAY'S ACTION CENTER -->
        <section class="card pad">
          <div class="section-head">
            <h2>Today's Tasks</h2>
            <span class="badge ${ (expiringToday + duePay + failedRem) > 0 ? 'due' : 'active'}">${expiringToday + duePay + failedRem > 0 ? (expiringToday + duePay + failedRem) + ' items' : 'All clear'}</span>
          </div>
          <ul class="task-list">
            <li class="task-item ${expiringToday > 0 ? 'task-urgent' : 'task-ok'}">
              <span class="task-dot"></span>
              <span>${expiringToday > 0 ? `⚠ ${expiringToday} member(s) expire today` : '✓ No expiries today'}</span>
              ${expiringToday > 0 ? `<button class="btn" style="margin-left:auto;padding:6px 12px;font-size:0.75rem" data-go="renewals">View</button>` : ''}
            </li>
            <li class="task-item ${duePay > 0 ? 'task-urgent' : 'task-ok'}">
              <span class="task-dot"></span>
              <span>${duePay > 0 ? `⚠ ${duePay} payment(s) due` : '✓ No pending payments'}</span>
              ${duePay > 0 ? `<button class="btn" style="margin-left:auto;padding:6px 12px;font-size:0.75rem" data-go="payments">Collect</button>` : ''}
            </li>
            <li class="task-item ${failedRem > 0 ? 'task-urgent' : 'task-ok'}">
              <span class="task-dot"></span>
              <span>${failedRem > 0 ? `⚠ ${failedRem} reminder(s) failed` : '✓ All reminders sent'}</span>
              ${failedRem > 0 ? `<button class="btn" style="margin-left:auto;padding:6px 12px;font-size:0.75rem" data-go="reminders">Fix</button>` : ''}
            </li>
            <li class="task-item task-info">
              <span class="task-dot"></span>
              <span>Today's collection: <strong>${money(stats.todayCollection)}</strong></span>
            </li>
          </ul>
        </section>

        <!-- RENEWAL CENTER WIDGET -->
        <section class="card pad">
          <div class="section-head"><h2>Renewal Center</h2><button class="btn" data-go="renewals">View All</button></div>
          <div class="renewal-widget-grid">
            <div class="renewal-stat renewal-today">
              <div class="renewal-num">${expiringToday}</div>
              <div class="renewal-label">Expiring Today</div>
            </div>
            <div class="renewal-stat renewal-week">
              <div class="renewal-num">${upcoming.filter(m => daysToExpiry(m.expiryDate) > 0).length}</div>
              <div class="renewal-label">In 7 Days</div>
            </div>
            <div class="renewal-stat renewal-expired">
              <div class="renewal-num">${stats.expired}</div>
              <div class="renewal-label">Expired</div>
            </div>
            <div class="renewal-stat renewal-revenue">
              <div class="renewal-num" style="font-size:1.3rem">${money(stats.revenueThisYear)}</div>
              <div class="renewal-label">Year Revenue</div>
            </div>
          </div>
        </section>
      </div>

      <!-- Row: Revenue Chart + Payment Health -->
      <div class="grid two-col" style="margin-top:20px">
        <section class="card pad">
          <div class="section-head">
            <h2>Monthly Revenue Trend</h2>
            <div style="text-align:right">
              <div style="font-size:0.75rem;color:var(--text-muted)">This Month</div>
              <div class="money">${money(stats.monthlyCollection)}</div>
            </div>
          </div>
          ${monthlyRevenueTrendChart()}
        </section>

        <!-- PAYMENT HEALTH -->
        <section class="card pad">
          <div class="section-head"><h2>Payment Health</h2></div>
          <div class="payment-health">
            <div class="health-row">
              <span class="health-label">Paid / Active</span>
              <div class="health-bar-wrap"><div class="health-bar health-paid" style="width:${(paidCount/totalForHealth*100).toFixed(0)}%"></div></div>
              <span class="health-count success-text">${paidCount}</span>
            </div>
            <div class="health-row">
              <span class="health-label">Due</span>
              <div class="health-bar-wrap"><div class="health-bar health-due" style="width:${(dueCount/totalForHealth*100).toFixed(0)}%"></div></div>
              <span class="health-count danger-text">${dueCount}</span>
            </div>
            <div class="health-row">
              <span class="health-label">Expired</span>
              <div class="health-bar-wrap"><div class="health-bar health-expired" style="width:${(expiredCount/totalForHealth*100).toFixed(0)}%"></div></div>
              <span class="health-count muted">${expiredCount}</span>
            </div>
          </div>
          <div style="margin-top:24px">
            <div class="section-head" style="margin-bottom:12px"><h2>Revenue Breakdown</h2></div>
            <div class="rev-breakdown">
              <div class="rev-item"><div class="rev-label">Today</div><div class="rev-val">${money(stats.todayCollection)}</div></div>
              <div class="rev-item"><div class="rev-label">This Month</div><div class="rev-val success-text">${money(stats.monthlyCollection)}</div></div>
              <div class="rev-item"><div class="rev-label">This Year</div><div class="rev-val">${money(stats.revenueThisYear)}</div></div>
            </div>
          </div>
        </section>
      </div>

      <!-- Row: Upcoming Expiries + Members With Dues -->
      <div class="grid two-col" style="margin-top:20px">
        <section class="card pad">
          <div class="section-head"><h2>Upcoming Expiries</h2><button class="btn" data-go="renewals">Renewal Center</button></div>
          ${upcoming.length === 0 
            ? `<div class="empty-state"><div class="empty-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg></div><div>No expiries in the next 7 days</div></div>`
            : `<div class="expiry-list">${upcoming.map(m => {
                const days = daysToExpiry(m.expiryDate);
                const cls = days === 0 ? 'expiry-today' : days <= 3 ? 'expiry-urgent' : 'expiry-soon';
                return `<div class="expiry-row ${cls}">
                  <div class="user-cell">
                    <div class="avatar-tiny">${m.photo ? `<img src="${m.photo}"/>` : initials(m.name)}</div>
                    <div><strong>${m.name}</strong><span class="muted block" style="font-size:0.8rem">${m.memberNo}</span></div>
                  </div>
                  <div class="expiry-days">${days === 0 ? '<span class="badge due">Today</span>' : `<span class="badge expiring-soon">${days}d left</span>`}</div>
                  <button class="btn primary" style="padding:6px 12px;font-size:0.75rem" data-action="renew" data-id="${m.id}">Renew</button>
                </div>`;
              }).join('')}</div>`
          }
        </section>
        ${memberRiskWidget()}
      </div>

      <!-- Row: Recent Activity + Recent Registrations -->
      <div class="grid two-col" style="margin-top:20px">
        <section class="card pad">
          <div class="section-head"><h2>Recent Activity</h2></div>
          <div class="activity-feed">
            ${activityItems.length === 0 
              ? `<div class="empty-state"><div class="empty-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg></div><div>No activity yet</div></div>`
              : activityItems.map(a => `
                <div class="activity-item">
                  <span class="activity-icon">${a.icon}</span>
                  <div class="activity-text">${a.text}</div>
                  <div class="activity-date">${formatDate(a.date)}</div>
                </div>
              `).join('')
            }
          </div>
        </section>
        <section class="card pad">
          <div class="section-head"><h2>Recent Registrations</h2><button class="btn" data-go="members">View All</button></div>
          ${memberMiniTable(recentRegistrations, "No registrations yet.")}
        </section>
      </div>
      
      <section class="card pad" style="margin-top:20px">
        <div class="section-head"><h2>Recent Payments</h2><button class="btn" data-go="payments">Full Ledger</button></div>
        ${paymentTable(recentPayments)}
      </section>
    `;
  },
  
  renewals() {
    const activeTab = sessionStorage.getItem("renewals-active-tab") || "today";
    
    const expiredMembers = state.members
      .filter((member) => daysToExpiry(member.expiryDate) < 0)
      .sort((a, b) => b.expiryDate.localeCompare(a.expiryDate));
      
    const dueTodayMembers = state.members
      .filter((member) => daysToExpiry(member.expiryDate) === 0)
      .sort((a, b) => a.name.localeCompare(b.name));
      
    const dueThisWeekMembers = state.members
      .filter((member) => {
        const days = daysToExpiry(member.expiryDate);
        return days > 0 && days <= 7;
      })
      .sort((a, b) => a.expiryDate.localeCompare(b.expiryDate));
      
    const counts = {
      today: dueTodayMembers.length,
      week: dueThisWeekMembers.length,
      expired: expiredMembers.length
    };
    
    let activeMembers = [];
    if (activeTab === "today") activeMembers = dueTodayMembers;
    else if (activeTab === "this-week") activeMembers = dueThisWeekMembers;
    else if (activeTab === "expired") activeMembers = expiredMembers;
    
    return `
      ${pageHeader("Renewal Center", "Track memberships expiring today, this week, and already expired.")}
      <div class="tabs renewal-tabs">
        <button class="tab ${activeTab === "today" ? "active" : ""}" data-action="renewals-tab" data-tab="today">
          <span style="color:#e60000; font-size:1.2rem; line-height:0">●</span> Today (${counts.today})
        </button>
        <button class="tab ${activeTab === "this-week" ? "active" : ""}" data-action="renewals-tab" data-tab="this-week">
          <span style="color:#fbbf24; font-size:1.2rem; line-height:0">●</span> This Week (${counts.week})
        </button>
        <button class="tab ${activeTab === "expired" ? "active" : ""}" data-action="renewals-tab" data-tab="expired">
          <span style="color:#e60000; font-size:1.2rem; line-height:0">●</span> Expired (${counts.expired})
        </button>
      </div>
      
      <section class="card pad">
        ${renderRenewalList(activeMembers, activeTab)}
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
    const regFee = state.gym.registrationFee !== undefined ? state.gym.registrationFee : 500;
    const reminderSettings = state.gym.reminderSettings || { daysBefore: [7, 3, 1] };
    const has7 = reminderSettings.daysBefore.includes(7);
    const has3 = reminderSettings.daysBefore.includes(3);
    const has1 = reminderSettings.daysBefore.includes(1);
    
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
          <div class="section-head"><h2>Gym Info & Dues</h2></div>
          <form id="gymInfoForm" class="stack">
            <label class="field"><span>Gym Name</span><input name="name" value="${escapeHtml(state.gym.name)}" required /></label>
            <label class="field"><span>Phone</span><input name="phone" pattern="[0-9]{10}" value="${escapeHtml(state.gym.phone)}" required /></label>
            <label class="field"><span>Address</span><input name="address" value="${escapeHtml(state.gym.address)}" required /></label>
            <label class="field"><span>Registration Fee (Rs.)</span><input name="registrationFee" type="number" min="0" value="${regFee}" required /></label>
            
            <div class="stack-tight">
              <span class="label">Auto Reminder Settings</span>
              <div class="option-row">
                <label class="choice"><input type="checkbox" name="remind7" ${has7 ? "checked" : ""} /> 7 Days</label>
                <label class="choice"><input type="checkbox" name="remind3" ${has3 ? "checked" : ""} /> 3 Days</label>
                <label class="choice"><input type="checkbox" name="remind1" ${has1 ? "checked" : ""} /> 1 Day</label>
              </div>
            </div>
            
            <button class="btn primary" type="submit">✓ Save Settings</button>
          </form>
        </section>
        
        <section class="card pad">
          <div class="section-head"><h2>Cron & Services</h2></div>
          <p><strong>Reminder Cron Status:</strong> ${state.reminderEnabled ? "Enabled (Runs daily at 9:00 AM)" : "Disabled"}</p>
          <div class="service-list">${state.gym.services.map((service) => `<span>${service}</span>`).join("")}</div>
          <button class="btn" style="margin-top:14px" data-action="toggle-reminders">${state.reminderEnabled ? "Disable Auto" : "Enable Auto"} Reminders</button>
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
  dashboard() {
    bindMemberActions();
    document.querySelector('[data-action="quick-payment"]')?.addEventListener("click", () => {
      openPaymentPrompt();
    });
    document.querySelector('[data-action="quick-renew"]')?.addEventListener("click", () => {
      openRenewModal();
    });
    document.querySelector('[data-action="quick-reminder"]')?.addEventListener("click", () => {
      runReminderJob();
    });
  },
  renewals() {
    document.querySelectorAll('[data-action="renewals-tab"]').forEach((btn) => {
      btn.addEventListener("click", () => {
        sessionStorage.setItem("renewals-active-tab", btn.dataset.tab);
        render();
      });
    });
    bindMemberActions();
  },
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
    document.querySelector("#gymInfoForm").addEventListener("submit", (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      
      state.gym.name = form.get("name").trim();
      state.gym.phone = form.get("phone").trim();
      state.gym.address = form.get("address").trim();
      state.gym.registrationFee = Number(form.get("registrationFee"));
      
      const daysBefore = [];
      if (form.has("remind7")) daysBefore.push(7);
      if (form.has("remind3")) daysBefore.push(3);
      if (form.has("remind1")) daysBefore.push(1);
      state.gym.reminderSettings = { daysBefore };
      
      saveState();
      render();
      toast("Gym settings saved");
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
  const isGeneral = !activeModal.memberId;
  const targetMember = isGeneral ? state.members[0] : member;
  if (!targetMember) return `<div class="pad">No members available to renew.</div>`;
  
  const duration = targetMember.durationMonths === "custom" ? "1" : targetMember.durationMonths;
  const amount = state.plans[targetMember.planKey]?.prices[duration] || 1000;
  const startBase = daysToExpiry(targetMember.expiryDate) > 0 ? targetMember.expiryDate : todayISO();
  
  return `
    <form id="renewForm" class="stack">
      ${isGeneral ? `
        <label class="field">
          <span>Select Member</span>
          <select name="memberId" id="renewMemberSelect" required>
            ${state.members.map((item) => `<option value="${item.id}">${item.memberNo} · ${item.name} (Expires ${formatDate(item.expiryDate)})</option>`).join("")}
          </select>
        </label>
      ` : `
        <div class="member-summary">
          <strong>${targetMember.memberNo} · ${targetMember.name}</strong>
          <span>${planName(targetMember)} expires ${formatDate(targetMember.expiryDate)}</span>
        </div>
        <input type="hidden" name="memberId" value="${targetMember.id}" />
      `}
      <div class="form-grid">
        ${selectPlain("Plan", "planKey", [["strength", "Strength"], ["cardio", "Strength + Cardio"]], targetMember.planKey === "custom" ? "strength" : targetMember.planKey)}
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
  
  document.querySelector("#renewMemberSelect")?.addEventListener("change", (e) => {
    const selectedId = e.target.value;
    const member = getMember(selectedId);
    if (member) {
      const form = document.querySelector("#renewForm");
      const durationSelect = form.querySelector("select[name='duration']");
      const planSelect = form.querySelector("select[name='planKey']");
      const startInput = form.querySelector("input[name='startDate']");
      
      const duration = member.durationMonths === "custom" ? "1" : member.durationMonths;
      planSelect.value = member.planKey === "custom" ? "strength" : member.planKey;
      durationSelect.value = duration;
      
      const startBase = daysToExpiry(member.expiryDate) > 0 ? member.expiryDate : todayISO();
      startInput.value = startBase;
      
      updateRenewAmount();
    }
  });
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
  const regFee = state.gym.registrationFee !== undefined ? Number(state.gym.registrationFee) : 500;
  return base + (draftMember.waiveRegistration ? 0 : regFee);
}

async function saveMemberFromDraft(formElement) {
  const form = new FormData(formElement);
  const photo = await fileToDataUrl(form.get("photo"));
  const signature = await fileToDataUrl(form.get("signature"));
  const days = draftMember.durationMonths === "custom" ? Number(draftMember.customDays) : monthsToDays(draftMember.durationMonths);
  const membershipAmount = draftMember.planKey === "custom" || draftMember.durationMonths === "custom"
    ? Number(draftMember.customAmount || 0)
    : Number(state.plans[draftMember.planKey]?.prices[draftMember.durationMonths] || 0);
  const registrationFee = draftMember.waiveRegistration ? 0 : (state.gym.registrationFee !== undefined ? Number(state.gym.registrationFee) : 500);
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
        <thead><tr><th>Member</th><th>Plan</th><th>Expiry</th><th>Status</th></tr></thead>
        <tbody>
          ${members.map((member) => `
            <tr>
              <td>
                <div class="user-cell">
                  <div class="avatar-tiny">${member.photo ? `<img src="${member.photo}" />` : initials(member.name)}</div>
                  <strong>${member.name}</strong>
                </div>
              </td>
              <td>${planName(member)}</td>
              <td>${formatDate(member.expiryDate)}</td>
              <td>${expiryStatusBadge(member.expiryDate)}</td>
            </tr>
          `).join("")}
        </tbody>
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

function quickActionsSection() {
  return `
    <section class="card pad quick-actions-card" style="margin-top:16px">
      <div class="section-head"><h2>Quick Actions</h2></div>
      <div class="quick-actions-grid">
        <button class="btn quick-action-btn" data-go="new-member">
          <span class="icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </span>
          <span>Add Member</span>
        </button>
        <button class="btn quick-action-btn" data-go="payments">
          <span class="icon">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square"><rect x="1" y="4" width="22" height="16" rx="0"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
          </span>
          <span>Payments</span>
        </button>
        <button class="btn quick-action-btn" data-go="renewals">
          <span class="icon">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
          </span>
          <span>Renewal Center</span>
        </button>
        <button class="btn quick-action-btn" data-go="reminders">
          <span class="icon">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </span>
          <span>Reminders</span>
        </button>
      </div>
    </section>
  `;
}

function memberRiskWidget() {
  const dueMembers = state.members.filter(m => statusOf(m) === "Due" || m.paymentStatus === "Due" || m.dueOverride);
  
  let rowsHtml = "";
  if (!dueMembers.length) {
    rowsHtml = `<div class="empty">No members with outstanding dues.</div>`;
  } else {
    rowsHtml = `
      <ul class="risk-list">
        ${dueMembers.map(member => {
          const dues = getDuesAmount(member);
          return `
            <li class="risk-item">
              <div class="user-cell">
                <div class="avatar-tiny">${member.photo ? `<img src="${member.photo}" />` : initials(member.name)}</div>
                <div>
                  <strong>${member.name}</strong>
                  <span class="risk-subtext">${member.memberNo} · ${member.phoneDay}</span>
                </div>
              </div>
              <div class="risk-actions">
                <span class="due-amount">${money(dues)} Due</span>
                <button class="btn icon-only" title="Record Payment" data-action="add-payment" data-id="${member.id}">₹</button>
                <a class="btn icon-only" title="Call/WhatsApp Dues Reminder" href="https://wa.me/91${member.phoneDay}?text=Hi%20${encodeURIComponent(member.name)},%20this%20is%20a%20friendly%20reminder%20that%20your%20membership%20payment%20of%20Rs.%20${dues}%20is%20pending.%20Please%20clear%20it%20at%20the%20earliest.%20Thank%20you!" target="_blank">✆</a>
              </div>
            </li>
          `;
        }).join("")}
      </ul>
    `;
  }
  
  return `
    <section class="card pad risk-widget-card">
      <div class="section-head">
        <h2>Members With Dues</h2>
        <span class="badge due">${dueMembers.length} Risk</span>
      </div>
      ${rowsHtml}
    </section>
  `;
}

function monthlyRevenueTrendChart() {
  const monthsList = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = d.toISOString().slice(0, 7);
    const label = d.toLocaleDateString("en-US", { month: "short" });
    monthsList.push({ key: monthKey, label });
  }
  
  const totals = monthsList.map((month) => {
    const amount = state.payments
      .filter((payment) => payment.date.startsWith(month.key))
      .reduce((sum, payment) => sum + Number(payment.amount), 0);
    return { ...month, amount };
  });
  
  const max = Math.max(...totals.map(t => t.amount), 1);
  
  return `
    <div class="trend-chart-container">
      <div class="trend-bars">
        ${totals.map((t) => `
          <div class="trend-bar-wrapper">
            <div class="trend-bar-label-top">${money(t.amount)}</div>
            <div class="bar trend-bar" title="${t.label}: ${money(t.amount)}" style="height:${Math.max(8, (t.amount / max) * 100)}%"></div>
            <div class="trend-bar-label-bottom">${t.label}</div>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function expiryStatusBadge(expiryDate) {
  const days = daysToExpiry(expiryDate);
  if (days < 0) {
    return `<span class="badge expired">⚫ Expired (${Math.abs(days)}d ago)</span>`;
  }
  if (days === 0) {
    return `<span class="badge due">🔴 Today</span>`;
  }
  if (days <= 3) {
    return `<span class="badge expiring-soon" style="background:#feefe3;color:#b06000;">🟠 ${days} Days</span>`;
  }
  if (days <= 7) {
    return `<span class="badge expiring-soon" style="background:#fef7e0;color:#b06000;">🟡 ${days} Days</span>`;
  }
  return `<span class="badge active">🟢 ${days} Days</span>`;
}

function renderRenewalList(members, activeTab) {
  if (!members.length) {
    let msg = "No renewals due today! 🎉";
    if (activeTab === "this-week") msg = "No renewals due this week! 🎉";
    if (activeTab === "expired") msg = "No expired memberships found! 🎉";
    return `<div class="empty">${msg}</div>`;
  }
  
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Member</th>
            <th>Phone</th>
            <th>Plan</th>
            <th>Expiry Date</th>
            <th>Dues / Status</th>
            <th style="text-align:right">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${members.map((member) => {
            const days = daysToExpiry(member.expiryDate);
            const dues = getDuesAmount(member);
            const whatsappText = `Hi%20${encodeURIComponent(member.name)},%20your%20membership%20at%20DEV%20FITNESS%20GYM%20expires%20on%20${formatDate(member.expiryDate)}.%20Please%20renew%20to%20continue%20your%20sessions.%20Thank%20you!`;
            return `
              <tr>
                <td>
                  <div class="user-cell">
                    <div class="avatar-tiny">${member.photo ? `<img src="${member.photo}" />` : initials(member.name)}</div>
                    <div>
                      <strong>${member.name}</strong>
                      <span class="muted text-xs block">${member.memberNo}</span>
                    </div>
                  </div>
                </td>
                <td>${member.phoneDay}</td>
                <td>${planName(member)}</td>
                <td>${formatDate(member.expiryDate)}</td>
                <td>
                  <div class="stack-tight">
                    ${expiryStatusBadge(member.expiryDate)}
                    ${dues > 0 ? `<span class="badge due" style="margin-top:4px">${money(dues)} Pending</span>` : ""}
                  </div>
                </td>
                <td style="text-align:right">
                  <div class="actions" style="justify-content:flex-end">
                    <button class="btn primary" data-action="renew" data-id="${member.id}">↻ Renew</button>
                    <button class="btn" data-action="manual-reminder" data-id="${member.id}">✆ Notify</button>
                    <a class="btn icon-only" title="Direct WhatsApp Chat" href="https://wa.me/91${member.phoneDay}?text=${whatsappText}" target="_blank">💬</a>
                  </div>
                </td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    </div>
  `;
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
