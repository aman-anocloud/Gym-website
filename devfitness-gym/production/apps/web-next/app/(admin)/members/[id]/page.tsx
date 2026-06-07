import { api } from "../../../../lib/api";

export default async function MemberProfilePage({ params }: { params: { id: string } }) {
  const member = await api<any>(`/members/${params.id}`).catch(() => null);
  if (!member) return <div className="card">Member not found</div>;
  return (
    <>
      <div className="topbar"><div><h1>{member.fullName || member.full_name}</h1><p className="muted">{member.memberNumber || member.member_number}</p></div></div>
      <section className="grid" style={{ gridTemplateColumns: "300px 1fr" }}>
        <div className="card"><h2>Personal Details</h2><p>{member.phoneDay || member.phone_day}</p><p>{member.status}</p></div>
        <div className="grid">
          <div className="card"><h2>Payment Summary</h2><p>Total paid: Rs. {member.totalPaid}</p><p>Last payment: {member.lastPaymentDate || "-"}</p></div>
          <div className="card"><h2>Membership History</h2><table><tbody>{(member.memberships || []).map((m: any) => <tr key={m.id}><td>{m.plan_name || m.planName}</td><td>{m.expiry_date || m.expiryDate}</td><td>Rs. {m.total_amount || m.totalAmount}</td></tr>)}</tbody></table></div>
        </div>
      </section>
    </>
  );
}
