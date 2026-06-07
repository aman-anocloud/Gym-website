import { Injectable, NotFoundException } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";

@Injectable()
export class PaymentsService {
  constructor(private readonly db: DatabaseService) {}

  async list(query: { memberId?: string; mode?: string; dateFrom?: string; dateTo?: string }) {
    const clauses: string[] = [];
    const params: unknown[] = [];
    if (query.memberId) { params.push(query.memberId); clauses.push(`member_id=$${params.length}`); }
    if (query.mode) { params.push(query.mode); clauses.push(`payment_mode=$${params.length}`); }
    if (query.dateFrom) { params.push(query.dateFrom); clauses.push(`payment_date >= $${params.length}`); }
    if (query.dateTo) { params.push(query.dateTo); clauses.push(`payment_date <= $${params.length}`); }
    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    return (await this.db.query(`SELECT * FROM payments ${where} ORDER BY payment_date DESC`, params)).rows;
  }

  async create(body: { memberId: string; membershipId?: string; amount: number; paymentMode: string; paymentDate?: string; remarks?: string }) {
    return this.db.transaction(async (client) => {
      const member = (await client.query("SELECT * FROM members WHERE id=$1", [body.memberId])).rows[0];
      if (!member) throw new NotFoundException("Member not found");
      const membershipId = body.membershipId || (await client.query("SELECT id FROM memberships WHERE member_id=$1 ORDER BY created_at DESC LIMIT 1", [body.memberId])).rows[0]?.id;
      const payment = (await client.query(
        "INSERT INTO payments (member_id, membership_id, amount, payment_date, payment_mode, remarks) VALUES ($1,$2,$3,COALESCE($4,CURRENT_DATE),$5,$6) RETURNING *",
        [body.memberId, membershipId, body.amount, body.paymentDate || null, body.paymentMode, body.remarks || ""],
      )).rows[0];
      await client.query("UPDATE members SET payment_status='Paid', updated_at=now() WHERE id=$1", [body.memberId]);
      return payment;
    });
  }
}
