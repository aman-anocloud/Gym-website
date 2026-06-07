export default function ReportsPage() {
  const reports = ["active-members", "due-members", "expiring-members", "expired-members", "monthly-collection", "payment-ledger"];
  return <><div className="topbar"><div><h1>Reports</h1><p className="muted">CSV/PDF/XLS export entry points.</p></div></div><div className="grid">{reports.map((r) => <a className="card" href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/reports/${r}?format=csv`} key={r}>{r}</a>)}</div></>;
}
