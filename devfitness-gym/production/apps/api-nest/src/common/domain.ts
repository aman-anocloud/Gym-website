export const PLAN_PRICES = {
  strength: { label: "Strength", prices: { "1": 1100, "3": 2500, "6": 4800, "12": 9000 } },
  cardio: { label: "Strength + Cardio", prices: { "1": 1400, "3": 3200, "6": 5700, "12": 11000 } },
} as const;

export function addDays(date: string, days: number) {
  const value = new Date(`${date}T00:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

export function statusFor(expiryDate: string, paymentStatus: string) {
  if (paymentStatus === "Due" || paymentStatus === "Pending") return "Due";
  const today = new Date(new Date().toISOString().slice(0, 10));
  const expiry = new Date(`${expiryDate}T00:00:00.000Z`);
  const days = Math.ceil((expiry.getTime() - today.getTime()) / 86400000);
  if (days < 0) return "Expired";
  if (days <= 7) return "Expiring Soon";
  return "Active";
}

export function memberNumber(next: number) {
  return `DEV-${String(next).padStart(4, "0")}`;
}
