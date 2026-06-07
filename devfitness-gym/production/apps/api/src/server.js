const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { URL } = require("node:url");
const { clearSessionCookie, hashPassword, sessionCookie, sessionFromRequest, verifyPassword } = require("./auth");
const { PLAN_PRICES, addDays, calculatePlan, statusFor, todayISO, validateMemberInput } = require("./domain");
const { createMember, currentMembership, load, save, uid, withStore } = require("./store");
const { runReminderJob, sendWhatsApp } = require("./reminders");

const PORT = Number(process.env.PORT || 3001);
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || hashPassword(process.env.ADMIN_PASSWORD || "devfitness");

function json(res, status, body, headers = {}) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": process.env.CORS_ORIGIN || "http://localhost:3000",
    "Access-Control-Allow-Credentials": "true",
    ...headers,
  });
  res.end(JSON.stringify(body, null, 2));
}

function text(res, status, body, headers = {}) {
  res.writeHead(status, {
    "Content-Type": "text/plain; charset=utf-8",
    ...headers,
  });
  res.end(body);
}

function notFound(res) {
  json(res, 404, { error: "Not found" });
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 7_000_000) {
        reject(new Error("Payload too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      if (!raw) resolve({});
      else resolve(JSON.parse(raw));
    });
    req.on("error", reject);
  });
}

function requireAuth(req, res) {
  const session = sessionFromRequest(req);
  if (!session) {
    json(res, 401, { error: "Unauthorized" });
    return null;
  }
  return session;
}

function memberView(data, member) {
  const memberships = data.memberships.filter((item) => item.memberId === member.id);
  const payments = data.payments.filter((item) => item.memberId === member.id);
  const current = currentMembership(data, member.id);
  const totalPaid = payments.reduce((sum, item) => sum + Number(item.amount), 0);
  const lastPayment = payments.sort((a, b) => b.paymentDate.localeCompare(a.paymentDate))[0] || null;
  return {
    ...member,
    currentMembership: current ? { ...current, status: statusFor(current.expiryDate, member.paymentStatus) } : null,
    status: current ? statusFor(current.expiryDate, member.paymentStatus) : "Due",
    totalPaid,
    lastPaymentDate: lastPayment?.paymentDate || null,
    memberships,
  };
}

function dashboard(data) {
  const members = data.members.map((member) => memberView(data, member));
  const today = todayISO();
  const month = today.slice(0, 7);
  const counts = {
    totalMembers: members.length,
    activeMembers: members.filter((member) => member.status === "Active").length,
    dueMembers: members.filter((member) => member.status === "Due").length,
    expiringSoon: members.filter((member) => member.status === "Expiring Soon").length,
    expiredMembers: members.filter((member) => member.status === "Expired").length,
    todayCollection: data.payments.filter((p) => p.paymentDate === today).reduce((sum, p) => sum + Number(p.amount), 0),
    monthlyCollection: data.payments.filter((p) => p.paymentDate.startsWith(month)).reduce((sum, p) => sum + Number(p.amount), 0),
  };
  return {
    ...counts,
    recentPayments: [...data.payments].sort((a, b) => b.paymentDate.localeCompare(a.paymentDate)).slice(0, 10),
    upcomingExpiries: members
      .filter((member) => member.currentMembership && ["Active", "Expiring Soon"].includes(member.status))
      .sort((a, b) => a.currentMembership.expiryDate.localeCompare(b.currentMembership.expiryDate))
      .slice(0, 10),
    recentRegistrations: [...data.members].sort((a, b) => b.registrationDate.localeCompare(a.registrationDate)).slice(0, 5),
  };
}

function csv(rows) {
  return rows.map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
}

async function route(req, res) {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": process.env.CORS_ORIGIN || "http://localhost:3000",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET,POST,PATCH,OPTIONS",
    });
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const data = load();

  if (req.method === "GET" && url.pathname === "/health") {
    json(res, 200, { ok: true, service: "devfitness-api" });
    return;
  }

  if (req.method === "POST" && url.pathname === "/auth/login") {
    const body = await readBody(req);
    const ok = body.username === ADMIN_USERNAME && verifyPassword(body.password || "", ADMIN_PASSWORD_HASH);
    if (!ok) {
      json(res, 401, { error: "Invalid username or password" });
      return;
    }
    json(res, 200, { ok: true }, { "Set-Cookie": sessionCookie(ADMIN_USERNAME) });
    return;
  }

  if (req.method === "POST" && url.pathname === "/auth/logout") {
    json(res, 200, { ok: true }, { "Set-Cookie": clearSessionCookie() });
    return;
  }

  if (!requireAuth(req, res)) return;

  if (req.method === "GET" && url.pathname.startsWith("/uploads/")) {
    const name = path.basename(url.pathname);
    const file = path.resolve(__dirname, "../data/uploads", name);
    if (!fs.existsSync(file)) return notFound(res);
    const ext = path.extname(file).slice(1).replace("jpg", "jpeg");
    res.writeHead(200, { "Content-Type": `image/${ext}` });
    fs.createReadStream(file).pipe(res);
    return;
  }

  if (req.method === "GET" && url.pathname === "/dashboard/stats") {
    json(res, 200, dashboard(data));
    return;
  }

  if (req.method === "GET" && url.pathname === "/plans") {
    json(res, 200, data.plans);
    return;
  }

  if (req.method === "POST" && (url.pathname === "/uploads/photo" || url.pathname === "/uploads/signature")) {
    const body = await readBody(req);
    const saved = saveUpload(body.dataUrl, body.filename || "upload.png");
    json(res, 201, saved);
    return;
  }

  if (req.method === "PATCH" && url.pathname === "/plans") {
    const body = await readBody(req);
    withStore((store) => {
      store.plans = body;
      store.auditLogs.push({ id: uid("audit"), type: "plans.updated", createdAt: new Date().toISOString() });
    });
    json(res, 200, { ok: true });
    return;
  }

  if (req.method === "GET" && url.pathname === "/members") {
    const search = (url.searchParams.get("search") || "").toLowerCase();
    const status = url.searchParams.get("status");
    let members = data.members.map((member) => memberView(data, member));
    if (search) members = members.filter((member) => `${member.fullName} ${member.phoneDay} ${member.memberNumber}`.toLowerCase().includes(search));
    if (status) members = members.filter((member) => member.status === status);
    json(res, 200, { data: members });
    return;
  }

  if (req.method === "POST" && url.pathname === "/members") {
    const body = await readBody(req);
    const errors = validateMemberInput(body);
    if (errors.length) {
      json(res, 422, { errors });
      return;
    }
    const planCalc = calculatePlan(body);
    const created = withStore((store) => createMember(store, body, planCalc));
    json(res, 201, created);
    return;
  }

  const memberMatch = url.pathname.match(/^\/members\/([^/]+)$/);
  if (memberMatch && req.method === "GET") {
    const member = data.members.find((item) => item.id === memberMatch[1]);
    if (!member) return notFound(res);
    json(res, 200, memberView(data, member));
    return;
  }

  if (memberMatch && req.method === "PATCH") {
    const body = await readBody(req);
    const member = withStore((store) => {
      const item = store.members.find((row) => row.id === memberMatch[1]);
      if (!item) return null;
      Object.assign(item, body, { updatedAt: new Date().toISOString() });
      store.auditLogs.push({ id: uid("audit"), type: "member.updated", memberId: item.id, createdAt: new Date().toISOString() });
      return item;
    });
    if (!member) return notFound(res);
    json(res, 200, member);
    return;
  }

  if (req.method === "GET" && url.pathname === "/payments") {
    let payments = [...data.payments];
    const memberId = url.searchParams.get("memberId");
    const mode = url.searchParams.get("mode");
    const dateFrom = url.searchParams.get("dateFrom");
    const dateTo = url.searchParams.get("dateTo");
    if (memberId) payments = payments.filter((item) => item.memberId === memberId);
    if (mode) payments = payments.filter((item) => item.paymentMode === mode);
    if (dateFrom) payments = payments.filter((item) => item.paymentDate >= dateFrom);
    if (dateTo) payments = payments.filter((item) => item.paymentDate <= dateTo);
    json(res, 200, { data: payments.sort((a, b) => b.paymentDate.localeCompare(a.paymentDate)) });
    return;
  }

  if (req.method === "POST" && url.pathname === "/payments") {
    const body = await readBody(req);
    const result = withStore((store) => {
      const member = store.members.find((item) => item.id === body.memberId);
      if (!member) return null;
      const payment = {
        id: uid("pay"),
        memberId: member.id,
        membershipId: body.membershipId || currentMembership(store, member.id)?.id || null,
        amount: Number(body.amount),
        paymentDate: body.paymentDate || todayISO(),
        paymentMode: body.paymentMode,
        remarks: body.remarks || "",
        createdAt: new Date().toISOString(),
      };
      store.payments.push(payment);
      member.paymentStatus = "Paid";
      member.updatedAt = new Date().toISOString();
      store.auditLogs.push({ id: uid("audit"), type: "payment.created", paymentId: payment.id, memberId: member.id, createdAt: new Date().toISOString() });
      return payment;
    });
    if (!result) return notFound(res);
    json(res, 201, result);
    return;
  }

  if (req.method === "POST" && url.pathname === "/memberships/renew") {
    const body = await readBody(req);
    const renewed = withStore((store) => {
      const member = store.members.find((item) => item.id === body.memberId);
      if (!member) return null;
      const planCalc = calculatePlan({ ...body, waiveRegistration: true });
      const startDate = body.startDate || todayISO();
      const membership = {
        id: uid("mship"),
        memberId: member.id,
        planKey: body.planKey,
        planName: body.planKey === "custom" ? "Custom Plan" : store.plans[body.planKey].label,
        duration: body.durationMonths === "custom" ? `${body.customDays} days` : `${body.durationMonths} month`,
        startDate,
        expiryDate: addDays(startDate, planCalc.durationDays),
        membershipAmount: planCalc.membershipAmount,
        registrationFee: 0,
        totalAmount: Number(body.amountPaid || planCalc.membershipAmount),
        status: "Active",
        createdAt: new Date().toISOString(),
      };
      const payment = {
        id: uid("pay"),
        memberId: member.id,
        membershipId: membership.id,
        amount: Number(body.amountPaid || membership.totalAmount),
        paymentDate: body.paymentDate || todayISO(),
        paymentMode: body.paymentMode || "UPI",
        remarks: body.remarks || `Renewal for ${membership.duration}`,
        createdAt: new Date().toISOString(),
      };
      store.memberships.push(membership);
      store.payments.push(payment);
      member.paymentStatus = "Paid";
      member.updatedAt = new Date().toISOString();
      store.auditLogs.push({ id: uid("audit"), type: "membership.renewed", memberId: member.id, membershipId: membership.id, createdAt: new Date().toISOString() });
      return { membership, payment };
    });
    if (!renewed) return notFound(res);
    json(res, 201, renewed);
    return;
  }

  if (req.method === "POST" && url.pathname.startsWith("/reminders/send/")) {
    const memberId = url.pathname.split("/").pop();
    const member = data.members.find((item) => item.id === memberId);
    if (!member) return notFound(res);
    const membership = currentMembership(data, memberId);
    const delivery = await sendWhatsApp(member, membership, "manual");
    withStore((store) => {
      store.reminders.push({
        id: uid("rem"),
        memberId,
        membershipId: membership?.id || null,
        type: "manual",
        sentAt: new Date().toISOString(),
        deliveryStatus: delivery.status,
        providerMessageId: delivery.providerMessageId || "",
        error: delivery.error || "",
      });
    });
    json(res, 200, delivery);
    return;
  }

  if (req.method === "POST" && url.pathname === "/reminders/run") {
    const result = await withAsyncStore(runReminderJob);
    json(res, 200, { sent: result.length, data: result });
    return;
  }

  if (req.method === "GET" && url.pathname === "/reminders/logs") {
    json(res, 200, { data: data.reminders });
    return;
  }

  if (req.method === "GET" && url.pathname.startsWith("/reports/")) {
    const type = url.pathname.split("/").pop();
    const rows = reportRows(data, type);
    if (url.searchParams.get("format") === "csv") {
      text(res, 200, csv(rows), { "Content-Type": "text/csv; charset=utf-8" });
    } else {
      json(res, 200, { data: rows });
    }
    return;
  }

  notFound(res);
}

async function withAsyncStore(mutator) {
  const data = load();
  const result = await mutator(data);
  save(data);
  return result;
}

function reportRows(data, type) {
  const members = data.members.map((member) => memberView(data, member));
  const memberRows = (rows) => [
    ["member_number", "name", "phone", "status", "expiry_date", "last_payment_date"],
    ...rows.map((member) => [member.memberNumber, member.fullName, member.phoneDay, member.status, member.currentMembership?.expiryDate || "", member.lastPaymentDate || ""]),
  ];
  if (type === "payment-ledger" || type === "monthly-collection") {
    return [
      ["payment_id", "date", "member_id", "amount", "mode", "remarks"],
      ...data.payments.map((payment) => [payment.id, payment.paymentDate, payment.memberId, payment.amount, payment.paymentMode, payment.remarks]),
    ];
  }
  if (type === "active-members") return memberRows(members.filter((member) => member.status === "Active"));
  if (type === "due-members") return memberRows(members.filter((member) => member.status === "Due"));
  if (type === "expiring-members") return memberRows(members.filter((member) => member.status === "Expiring Soon"));
  if (type === "expired-members") return memberRows(members.filter((member) => member.status === "Expired"));
  return memberRows(members);
}

const server = http.createServer((req, res) => {
  route(req, res).catch((error) => {
    json(res, 500, { error: error.message });
  });
});

function saveUpload(dataUrl, filename) {
  if (!dataUrl || !/^data:image\/(png|jpeg|jpg|webp);base64,/.test(dataUrl)) {
    throw new Error("Expected image dataUrl");
  }
  const match = dataUrl.match(/^data:image\/([^;]+);base64,(.+)$/);
  const ext = match[1] === "jpeg" ? "jpg" : match[1];
  const bytes = Buffer.from(match[2], "base64");
  if (bytes.length > 5 * 1024 * 1024) throw new Error("Upload max size is 5MB");
  const uploadDir = path.resolve(__dirname, "../data/uploads");
  fs.mkdirSync(uploadDir, { recursive: true });
  const safeName = `${uid("file")}-${filename.replace(/[^a-z0-9_.-]/gi, "_")}.${ext}`;
  const file = path.join(uploadDir, safeName);
  fs.writeFileSync(file, bytes);
  return { url: `/uploads/${safeName}`, path: file };
}

function startDailyReminderScheduler() {
  if (process.env.DISABLE_REMINDER_SCHEDULER === "true") return;
  let lastRunDate = "";
  setInterval(async () => {
    const now = new Date();
    const ist = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(now).reduce((acc, part) => ({ ...acc, [part.type]: part.value }), {});
    const runDate = `${ist.year}-${ist.month}-${ist.day}`;
    if (ist.hour === "09" && ist.minute === "00" && lastRunDate !== runDate) {
      lastRunDate = runDate;
      try {
        await withAsyncStore(runReminderJob);
      } catch (error) {
        console.error("Reminder scheduler failed", error);
      }
    }
  }, 60 * 1000).unref();
}

if (require.main === module) {
  server.listen(PORT, () => {
    startDailyReminderScheduler();
    console.log(`DEV FITNESS API listening on http://localhost:${PORT}`);
  });
}

module.exports = {
  server,
  route,
};
