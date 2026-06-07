import { api } from "../../../lib/api";

export default async function PaymentsPage() {
  const payments = await api<any[]>("/payments").catch(() => []);
  const rows = Array.isArray(payments) ? payments : (payments as any).data || [];
  return <><div className="topbar"><div><h1>Payment Ledger</h1><p className="muted">Append-only payment history.</p></div></div><div className="card"><table><thead><tr><th>ID</th><th>Date</th><th>Amount</th><th>Mode</th><th>Remarks</th></tr></thead><tbody>{rows.map((p: any) => <tr key={p.id}><td>{p.id}</td><td>{p.paymentDate || p.payment_date}</td><td>Rs. {p.amount}</td><td>{p.paymentMode || p.payment_mode}</td><td>{p.remarks}</td></tr>)}</tbody></table></div></>;
}
