import { Injectable, NotFoundException } from "@nestjs/common";
import { addDays, PLAN_PRICES, statusFor } from "../common/domain";
import { DatabaseService } from "../database/database.service";

@Injectable()
export class MembershipsService {
  constructor(private readonly db: DatabaseService) {}

  async renew(body: { memberId: string; planKey: "strength" | "cardio" | "custom"; durationMonths: string; customDays?: number; customAmount?: number; amountPaid: number; paymentMode: string }) {
    return this.db.transaction(async (client) => {
      const member = (await client.query("SELECT * FROM members WHERE id=$1", [body.memberId])).rows[0];
      if (!member) throw new NotFoundException("Member not found");
      const custom = body.planKey === "custom" || body.durationMonths === "custom";
      const planKey = body.planKey as "strength" | "cardio";
      const amount = custom ? Number(body.customAmount) : Number(PLAN_PRICES[planKey].prices[body.durationMonths as keyof typeof PLAN_PRICES.strength.prices]);
      const days = custom ? Number(body.customDays) : Number(body.durationMonths) * 30;
      const start = new Date().toISOString().slice(0, 10);
      const expiry = addDays(start, days);
      const membership = (await client.query(
        "INSERT INTO memberships (member_id, plan_name, duration_label, start_date, expiry_date, membership_amount, registration_fee, total_amount, status) VALUES ($1,$2,$3,$4,$5,$6,0,$7,$8) RETURNING *",
        [body.memberId, custom ? "Custom Plan" : PLAN_PRICES[planKey].label, custom ? `${body.customDays} days` : `${body.durationMonths} month`, start, expiry, amount, body.amountPaid || amount, statusFor(expiry, "Paid")],
      )).rows[0];
      const payment = (await client.query(
        "INSERT INTO payments (member_id, membership_id, amount, payment_date, payment_mode, remarks) VALUES ($1,$2,$3,CURRENT_DATE,$4,$5) RETURNING *",
        [body.memberId, membership.id, body.amountPaid || amount, body.paymentMode, `Renewal for ${membership.duration_label}`],
      )).rows[0];
      await client.query("UPDATE members SET payment_status='Paid', updated_at=now() WHERE id=$1", [body.memberId]);
      return { membership, payment };
    });
  }
}
