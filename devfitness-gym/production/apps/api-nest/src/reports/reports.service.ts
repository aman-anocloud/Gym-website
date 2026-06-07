import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";

@Injectable()
export class ReportsService {
  constructor(private readonly db: DatabaseService) {}

  async dashboard() {
    const stats = (await this.db.query(`
      WITH current_memberships AS (
        SELECT DISTINCT ON (member_id) * FROM memberships ORDER BY member_id, created_at DESC
      )
      SELECT
        COUNT(*)::int AS total_members,
        COUNT(*) FILTER (WHERE m.payment_status='Due' OR m.payment_status='Pending')::int AS due_members,
        COUNT(*) FILTER (WHERE m.payment_status='Paid' AND cm.expiry_date > CURRENT_DATE + 7)::int AS active_members,
        COUNT(*) FILTER (WHERE m.payment_status='Paid' AND cm.expiry_date BETWEEN CURRENT_DATE AND CURRENT_DATE + 7)::int AS expiring_soon,
        COUNT(*) FILTER (WHERE m.payment_status='Paid' AND cm.expiry_date < CURRENT_DATE)::int AS expired_members
      FROM members m LEFT JOIN current_memberships cm ON cm.member_id=m.id
    `)).rows[0];
    const collections = (await this.db.query(`
      SELECT
        COALESCE(SUM(amount) FILTER (WHERE payment_date=CURRENT_DATE),0)::int AS today_collection,
        COALESCE(SUM(amount) FILTER (WHERE date_trunc('month', payment_date)=date_trunc('month', CURRENT_DATE)),0)::int AS monthly_collection
      FROM payments
    `)).rows[0];
    return { ...stats, ...collections };
  }

  async report(type: string) {
    if (type.includes("payment") || type.includes("collection")) {
      return (await this.db.query("SELECT * FROM payments ORDER BY payment_date DESC")).rows;
    }
    return (await this.db.query("SELECT * FROM members ORDER BY created_at DESC")).rows;
  }
}
