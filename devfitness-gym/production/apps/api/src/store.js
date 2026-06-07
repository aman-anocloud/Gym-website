const fs = require("node:fs");
const path = require("node:path");
const { PLAN_PRICES, addDays, memberNumber, statusFor, todayISO } = require("./domain");

const DEFAULT_DATA_FILE = path.resolve(__dirname, "../data/devfitness.json");

function dataFile() {
  return path.resolve(process.env.DATA_FILE || DEFAULT_DATA_FILE);
}

function uid(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(16).slice(2)}`;
}

function seed() {
  const today = todayISO();
  return {
    nextMemberNumber: 1,
    gym: {
      name: "DEV FITNESS GYM",
      phone: "9572762242",
      address: "1st Floor of Co-Operative Maintenance Office, Near SBI & BOI ATM, Bokaro Steel City, Jharkhand - 827013",
      services: ["Personal Training", "Bodybuilding", "Cardio", "Powerlifting", "Yoga", "Zumba", "Aerobics", "Weight Loss", "Weight Gain", "Supplements"],
    },
    plans: PLAN_PRICES,
    members: [],
    memberships: [],
    payments: [],
    reminders: [],
    auditLogs: [
      { id: uid("audit"), type: "system.seed", createdAt: new Date().toISOString() },
    ],
    seededAt: today,
  };
}

function ensureFile() {
  const file = dataFile();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify(seed(), null, 2));
}

function load() {
  ensureFile();
  return JSON.parse(fs.readFileSync(dataFile(), "utf8"));
}

function save(data) {
  fs.writeFileSync(dataFile(), JSON.stringify(data, null, 2));
}

function withStore(mutator) {
  const data = load();
  const result = mutator(data);
  save(data);
  return result;
}

function createMember(data, input, planCalc) {
  const id = uid("mem");
  const no = memberNumber(data.nextMemberNumber);
  data.nextMemberNumber += 1;
  const startDate = input.startDate || input.paymentDate || todayISO();
  const expiryDate = addDays(startDate, planCalc.durationDays);
  const member = {
    id,
    memberNumber: no,
    registrationDate: input.registrationDate || todayISO(),
    fullName: input.fullName.trim(),
    age: Number(input.age),
    gender: input.gender,
    phoneDay: input.phoneDay,
    phoneEvening: input.phoneEvening || "",
    emergencyContact: input.emergencyContact || "",
    address: input.address,
    city: input.city || "Bokaro Steel City",
    state: input.state || "Jharkhand",
    pin: input.pin || "827013",
    trainerRequired: input.trainerRequired === true || input.trainerRequired === "Yes",
    healthFlags: input.healthFlags || [],
    healthNotes: input.healthNotes || "",
    termsAccepted: Boolean(input.termsAccepted),
    paymentStatus: "Paid",
    photoUrl: input.photoUrl || "",
    signatureUrl: input.signatureUrl || "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const membership = {
    id: uid("mship"),
    memberId: id,
    planKey: input.planKey,
    planName: input.planKey === "custom" ? "Custom Plan" : data.plans[input.planKey].label,
    duration: input.durationMonths === "custom" ? `${input.customDays} days` : `${input.durationMonths} month`,
    startDate,
    expiryDate,
    membershipAmount: planCalc.membershipAmount,
    registrationFee: planCalc.registrationFee,
    totalAmount: planCalc.totalAmount,
    status: statusFor(expiryDate, "Paid"),
    createdAt: new Date().toISOString(),
  };
  const payment = {
    id: uid("pay"),
    memberId: id,
    membershipId: membership.id,
    amount: Number(input.amountPaid || planCalc.totalAmount),
    paymentDate: input.paymentDate || todayISO(),
    paymentMode: input.paymentMode || "Cash",
    remarks: input.remarks || "Registration payment",
    createdAt: new Date().toISOString(),
  };
  data.members.push(member);
  data.memberships.push(membership);
  data.payments.push(payment);
  data.auditLogs.push({ id: uid("audit"), type: "member.created", memberId: id, createdAt: new Date().toISOString() });
  return { member, membership, payment };
}

function currentMembership(data, memberId) {
  return data.memberships
    .filter((item) => item.memberId === memberId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
}

module.exports = {
  createMember,
  currentMembership,
  load,
  save,
  uid,
  withStore,
};
