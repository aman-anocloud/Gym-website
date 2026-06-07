const DAY_MS = 24 * 60 * 60 * 1000;

const PLAN_PRICES = {
  strength: {
    label: "Strength",
    prices: { "1": 1100, "3": 2500, "6": 4800, "12": 9000 },
  },
  cardio: {
    label: "Strength + Cardio",
    prices: { "1": 1400, "3": 3200, "6": 5700, "12": 11000 },
  },
};

const HEALTH_FLAGS = [
  "Hypertension",
  "Diabetes",
  "Asthma",
  "Heart Disease",
  "Joint/Muscle Pain",
  "Pregnancy",
  "Spinal Disease",
  "Recent Injury",
  "Surgery in Past Year",
];

function todayISO(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

function addDays(date, days) {
  const value = new Date(`${date}T00:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() + Number(days));
  return value.toISOString().slice(0, 10);
}

function monthsToDays(months) {
  return Number(months) * 30;
}

function daysToExpiry(expiryDate, now = new Date()) {
  const today = new Date(`${todayISO(now)}T00:00:00.000Z`);
  const expiry = new Date(`${expiryDate}T00:00:00.000Z`);
  return Math.ceil((expiry - today) / DAY_MS);
}

function statusFor(expiryDate, paymentStatus = "Paid", now = new Date()) {
  if (paymentStatus === "Due" || paymentStatus === "Pending") return "Due";
  const days = daysToExpiry(expiryDate, now);
  if (days < 0) return "Expired";
  if (days <= 7) return "Expiring Soon";
  return "Active";
}

function memberNumber(nextMemberNumber) {
  return `DEV-${String(nextMemberNumber).padStart(4, "0")}`;
}

function calculatePlan({ planKey, durationMonths, customAmount, customDays, waiveRegistration }) {
  const custom = planKey === "custom" || durationMonths === "custom";
  const membershipAmount = custom ? Number(customAmount || 0) : Number(PLAN_PRICES[planKey]?.prices[durationMonths] || 0);
  const durationDays = custom ? Number(customDays || 0) : monthsToDays(durationMonths);
  const registrationFee = waiveRegistration ? 0 : 500;
  return {
    membershipAmount,
    durationDays,
    registrationFee,
    totalAmount: membershipAmount + registrationFee,
  };
}

function validateMemberInput(input) {
  const errors = [];
  if (!input.fullName || input.fullName.trim().length < 2) errors.push("Full name is required");
  if (!Number.isInteger(Number(input.age)) || Number(input.age) < 5 || Number(input.age) > 100) errors.push("Age must be 5-100");
  if (!["Male", "Female"].includes(input.gender)) errors.push("Gender must be Male or Female");
  if (!/^[0-9]{10}$/.test(input.phoneDay || "")) errors.push("Phone day must be 10 digits");
  if (input.phoneEvening && !/^[0-9]{10}$/.test(input.phoneEvening)) errors.push("Phone evening must be 10 digits");
  if (input.pin && !/^[0-9]{6}$/.test(input.pin)) errors.push("PIN must be 6 digits");
  if (!input.address) errors.push("Address is required");
  if (!input.termsAccepted) errors.push("Terms acceptance is required");
  if (!["strength", "cardio", "custom"].includes(input.planKey)) errors.push("Plan is invalid");
  if (input.planKey === "custom" || input.durationMonths === "custom") {
    if (!Number(input.customDays) || Number(input.customDays) < 1) errors.push("Custom days must be at least 1");
    if (!Number(input.customAmount) || Number(input.customAmount) < 1) errors.push("Custom amount must be at least 1");
  }
  return errors;
}

module.exports = {
  HEALTH_FLAGS,
  PLAN_PRICES,
  addDays,
  calculatePlan,
  daysToExpiry,
  memberNumber,
  monthsToDays,
  statusFor,
  todayISO,
  validateMemberInput,
};
