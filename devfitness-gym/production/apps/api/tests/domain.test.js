const test = require("node:test");
const assert = require("node:assert/strict");
const { addDays, calculatePlan, memberNumber, statusFor, todayISO, validateMemberInput } = require("../src/domain");
const { reminderTypeFor } = require("../src/reminders");

test("member numbers are sequential and padded", () => {
  assert.equal(memberNumber(1), "DEV-0001");
  assert.equal(memberNumber(42), "DEV-0042");
});

test("final freeze plan pricing and registration fee are applied", () => {
  assert.deepEqual(calculatePlan({ planKey: "strength", durationMonths: "1", waiveRegistration: false }), {
    membershipAmount: 1100,
    durationDays: 30,
    registrationFee: 500,
    totalAmount: 1600,
  });
  assert.deepEqual(calculatePlan({ planKey: "cardio", durationMonths: "12", waiveRegistration: true }), {
    membershipAmount: 11000,
    durationDays: 360,
    registrationFee: 0,
    totalAmount: 11000,
  });
});

test("custom plan supports arbitrary days and amount", () => {
  assert.equal(calculatePlan({ planKey: "custom", durationMonths: "custom", customDays: 17, customAmount: 700, waiveRegistration: true }).durationDays, 17);
});

test("membership status engine follows freeze rules", () => {
  const now = new Date("2026-01-01T10:00:00.000Z");
  assert.equal(statusFor("2026-01-20", "Paid", now), "Active");
  assert.equal(statusFor("2026-01-07", "Paid", now), "Expiring Soon");
  assert.equal(statusFor("2025-12-31", "Paid", now), "Expired");
  assert.equal(statusFor("2026-01-20", "Due", now), "Due");
  assert.equal(statusFor("2026-01-20", "Pending", now), "Due");
});

test("reminder schedule maps expiry distance", () => {
  const now = new Date("2026-01-01T10:00:00.000Z");
  assert.equal(reminderTypeFor("2026-01-08", now), "7-day");
  assert.equal(reminderTypeFor("2026-01-04", now), "3-day");
  assert.equal(reminderTypeFor("2026-01-01", now), "expiry-day");
  assert.equal(reminderTypeFor("2025-12-31", now), "expired");
});

test("member validation rejects missing required fields", () => {
  const errors = validateMemberInput({});
  assert.ok(errors.length > 5);
});

test("date helper adds custom days", () => {
  assert.equal(addDays(todayISO(new Date("2026-01-01T00:00:00.000Z")), 17), "2026-01-18");
});
