const { daysToExpiry, todayISO } = require("./domain");
const { currentMembership, uid } = require("./store");

function reminderTypeFor(expiryDate, now = new Date()) {
  const days = daysToExpiry(expiryDate, now);
  if (days === 7) return "7-day";
  if (days === 3) return "3-day";
  if (days === 0) return "expiry-day";
  if (days < 0) return "expired";
  return null;
}

function buildMessage(member, membership) {
  return [
    `Hello ${member.fullName}`,
    "",
    `Your membership at DEV FITNESS GYM will expire on ${membership.expiryDate}.`,
    "",
    "Please renew your membership.",
    "",
    "Contact:",
    "9572762242",
    "",
    "DEV FITNESS GYM",
  ].join("\n");
}

async function sendWhatsApp(member, membership, type) {
  if (process.env.WHATSAPP_DRY_RUN !== "false") {
    return { status: "Sent", providerMessageId: `dry_${uid("wa")}`, dryRun: true };
  }
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) {
    return { status: "Failed", error: "WhatsApp credentials are missing" };
  }
  const payload = {
    messaging_product: "whatsapp",
    to: `91${member.phoneDay}`,
    type: "text",
    text: { body: buildMessage(member, membership, type) },
  };
  const response = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) return { status: "Failed", error: JSON.stringify(json) };
  return { status: "Sent", providerMessageId: json.messages?.[0]?.id || "" };
}

async function runReminderJob(data, now = new Date()) {
  const sentAt = todayISO(now);
  const results = [];
  for (const member of data.members) {
    const membership = currentMembership(data, member.id);
    if (!membership) continue;
    const type = reminderTypeFor(membership.expiryDate, now);
    if (!type) continue;
    const duplicate = data.reminders.some((item) => item.memberId === member.id && item.membershipId === membership.id && item.type === type && item.sentAt.startsWith(sentAt));
    if (duplicate) continue;
    const delivery = await sendWhatsApp(member, membership, type);
    const log = {
      id: uid("rem"),
      memberId: member.id,
      membershipId: membership.id,
      type,
      sentAt: new Date().toISOString(),
      deliveryStatus: delivery.status,
      providerMessageId: delivery.providerMessageId || "",
      error: delivery.error || "",
    };
    data.reminders.push(log);
    results.push(log);
  }
  return results;
}

module.exports = {
  buildMessage,
  reminderTypeFor,
  runReminderJob,
  sendWhatsApp,
};
