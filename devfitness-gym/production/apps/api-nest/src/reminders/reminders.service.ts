import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { DatabaseService } from "../database/database.service";

@Injectable()
export class RemindersService {
  constructor(private readonly db: DatabaseService) {}

  @Cron("0 9 * * *", { timeZone: "Asia/Kolkata" })
  async runDaily() {
    return this.run();
  }

  async run() {
    const rows = (await this.db.query(`
      SELECT m.id AS member_id, ms.id AS membership_id, m.full_name, m.phone_day, ms.expiry_date,
        CASE
          WHEN ms.expiry_date = CURRENT_DATE + 7 THEN '7-day'
          WHEN ms.expiry_date = CURRENT_DATE + 3 THEN '3-day'
          WHEN ms.expiry_date = CURRENT_DATE THEN 'expiry-day'
          WHEN ms.expiry_date < CURRENT_DATE THEN 'expired'
        END AS type
      FROM members m
      JOIN LATERAL (
        SELECT * FROM memberships WHERE member_id = m.id ORDER BY created_at DESC LIMIT 1
      ) ms ON true
      WHERE ms.expiry_date IN (CURRENT_DATE + 7, CURRENT_DATE + 3, CURRENT_DATE)
         OR ms.expiry_date < CURRENT_DATE
    `)).rows.filter((row: any) => row.type);
    const sent = [];
    for (const row of rows) {
      const exists = (await this.db.query(
        "SELECT 1 FROM reminder_logs WHERE member_id=$1 AND membership_id=$2 AND type=$3 AND (sent_at AT TIME ZONE 'Asia/Kolkata')::date=CURRENT_DATE",
        [row.member_id, row.membership_id, row.type],
      )).rowCount;
      if (exists) continue;
      const log = (await this.db.query(
        "INSERT INTO reminder_logs (member_id, membership_id, type, delivery_status, provider_message_id) VALUES ($1,$2,$3,'Sent',$4) RETURNING *",
        [row.member_id, row.membership_id, row.type, process.env.WHATSAPP_DRY_RUN === "false" ? "" : "dry-run"],
      )).rows[0];
      sent.push(log);
    }
    return { sent: sent.length, data: sent };
  }

  logs() {
    return this.db.query("SELECT * FROM reminder_logs ORDER BY sent_at DESC").then((result: any) => result.rows);
  }
}
