import Link from "next/link";
import { api } from "../../../lib/api";

export default async function MembersPage() {
  const response = await api<{ data?: any[] }>("/members").catch(() => ({ data: [] }));
  const members = response.data || [];
  return (
    <>
      <div className="topbar">
        <div><h1>Members</h1><p className="muted">Search, filter, renew, and open profiles.</p></div>
        <Link className="btn primary" href="/members/new">Add Member</Link>
      </div>
      <div className="card">
        <table><thead><tr><th>No.</th><th>Name</th><th>Phone</th><th>Status</th><th>Last Payment</th></tr></thead>
          <tbody>{members.map((m) => <tr key={m.id}><td><Link href={`/members/${m.id}`}>{m.memberNumber || m.member_number}</Link></td><td>{m.fullName || m.full_name}</td><td>{m.phoneDay || m.phone_day}</td><td>{m.status}</td><td>{m.lastPaymentDate || m.last_payment_date || "-"}</td></tr>)}</tbody>
        </table>
      </div>
    </>
  );
}
