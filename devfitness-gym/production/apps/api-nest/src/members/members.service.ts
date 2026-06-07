import { Injectable, NotFoundException } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import { addDays, memberNumber, PLAN_PRICES, statusFor } from "../common/domain";
import { CreateMemberDto, UpdateMemberDto } from "./dto";

@Injectable()
export class MembersService {
  constructor(private readonly db: DatabaseService) {}

  async list(search = "", status = "") {
    const result = await this.db.query("SELECT * FROM members ORDER BY created_at DESC");
    const members = await Promise.all(result.rows.map((member: any) => this.profile(member.id)));
    return members.filter((member: any) => {
      const matchesSearch = !search || `${member.full_name} ${member.phone_day} ${member.member_number}`.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = !status || member.status === status;
      return matchesSearch && matchesStatus;
    });
  }

  async profile(id: string) {
    const member = (await this.db.query("SELECT * FROM members WHERE id=$1", [id])).rows[0];
    if (!member) throw new NotFoundException("Member not found");
    const memberships = (await this.db.query("SELECT * FROM memberships WHERE member_id=$1 ORDER BY created_at DESC", [id])).rows;
    const payments = (await this.db.query("SELECT * FROM payments WHERE member_id=$1 ORDER BY payment_date DESC", [id])).rows;
    const current = memberships[0] || null;
    return {
      ...member,
      memberships,
      payments,
      currentMembership: current,
      totalPaid: payments.reduce((sum: number, item: any) => sum + Number(item.amount), 0),
      lastPaymentDate: payments[0]?.payment_date || null,
      status: current ? statusFor(current.expiry_date, member.payment_status) : "Due",
    };
  }

  async create(input: CreateMemberDto) {
    return this.db.transaction(async (client) => {
      const count = Number((await client.query("SELECT COUNT(*)::int AS count FROM members")).rows[0].count) + 1;
      const plan = input.planKey === "custom" ? null : PLAN_PRICES[input.planKey as "strength" | "cardio"];
      const membershipAmount = input.planKey === "custom" || input.durationMonths === "custom" ? Number(input.customAmount) : Number(plan?.prices[input.durationMonths as keyof typeof plan.prices]);
      const registrationFee = input.waiveRegistration ? 0 : 500;
      const durationDays = input.durationMonths === "custom" ? Number(input.customDays) : Number(input.durationMonths) * 30;
      const startDate = new Date().toISOString().slice(0, 10);
      const expiryDate = addDays(startDate, durationDays);
      const member = (await client.query(
        `INSERT INTO members (member_number, registration_date, full_name, age, gender, phone_day, phone_evening, emergency_contact, address, city, state, pin, trainer_required, health_flags, health_notes, terms_accepted)
         VALUES ($1,CURRENT_DATE,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
        [memberNumber(count), input.fullName, input.age, input.gender, input.phoneDay, input.phoneEvening || "", input.emergencyContact || "", input.address, input.city, input.state, input.pin, input.trainerRequired, input.healthFlags, input.healthNotes || "", input.termsAccepted],
      )).rows[0];
      const membership = (await client.query(
        `INSERT INTO memberships (member_id, plan_name, duration_label, start_date, expiry_date, membership_amount, registration_fee, total_amount, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
        [member.id, input.planKey === "custom" ? "Custom Plan" : plan?.label, input.durationMonths === "custom" ? `${input.customDays} days` : `${input.durationMonths} month`, startDate, expiryDate, membershipAmount, registrationFee, membershipAmount + registrationFee, statusFor(expiryDate, "Paid")],
      )).rows[0];
      const payment = (await client.query(
        `INSERT INTO payments (member_id, membership_id, amount, payment_date, payment_mode, remarks) VALUES ($1,$2,$3,CURRENT_DATE,$4,$5) RETURNING *`,
        [member.id, membership.id, input.amountPaid, input.paymentMode, input.remarks || "Registration payment"],
      )).rows[0];
      return { member, membership, payment };
    });
  }

  async update(id: string, input: UpdateMemberDto) {
    const existing: any = await this.profile(id);
    const result = await this.db.query(
      "UPDATE members SET full_name=$1, phone_day=$2, payment_status=$3, photo_url=$4, signature_url=$5, updated_at=now() WHERE id=$6 RETURNING *",
      [
        input.fullName || existing.full_name,
        input.phoneDay || existing.phone_day,
        input.paymentStatus || existing.payment_status,
        input.photoUrl || existing.photo_url,
        input.signatureUrl || existing.signature_url,
        id,
      ],
    );
    return result.rows[0];
  }
}
