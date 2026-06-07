import { api } from "../../../lib/api";

export default async function RemindersPage() {
  const logs = await api<any[]>("/reminders/logs").catch(() => []);
  const rows = Array.isArray(logs) ? logs : (logs as any).data || [];
  return <><div className="topbar"><div><h1>Reminders</h1><p className="muted">WhatsApp reminder audit trail.</p></div></div><div className="card"><table><tbody>{rows.map((r: any) => <tr key={r.id}><td>{r.type}</td><td>{r.sentAt || r.sent_at}</td><td>{r.deliveryStatus || r.delivery_status}</td></tr>)}</tbody></table></div></>;
}
