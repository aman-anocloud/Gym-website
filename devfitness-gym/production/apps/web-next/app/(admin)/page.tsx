import { api, DashboardStats } from "../../lib/api";

export default async function DashboardPage() {
  const stats: DashboardStats = await api<DashboardStats>("/dashboard/stats").catch(() => ({} as DashboardStats));
  const cards = [
    ["Total Members", stats.totalMembers ?? stats.total_members ?? 0],
    ["Active", stats.activeMembers ?? stats.active_members ?? 0],
    ["Due", stats.dueMembers ?? stats.due_members ?? 0],
    ["Expiring Soon", stats.expiringSoon ?? stats.expiring_soon ?? 0],
    ["Expired", stats.expiredMembers ?? stats.expired_members ?? 0],
  ];
  return (
    <>
      <div className="topbar"><div><h1>Dashboard</h1><p className="muted">Owner overview for memberships and collections.</p></div></div>
      <section className="grid stats">{cards.map(([label, value]) => <div className="card" key={label}><div className="muted">{label}</div><div className="value">{value}</div></div>)}</section>
      <section className="grid" style={{ marginTop: 16, gridTemplateColumns: "repeat(2, minmax(0,1fr))" }}>
        <div className="card"><div className="muted">Today Collection</div><div className="value">Rs. {stats.todayCollection ?? stats.today_collection ?? 0}</div></div>
        <div className="card"><div className="muted">Monthly Collection</div><div className="value">Rs. {stats.monthlyCollection ?? stats.monthly_collection ?? 0}</div></div>
      </section>
    </>
  );
}
