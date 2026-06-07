import { Body, Controller, Post } from "@nestjs/common";
import { MembershipsService } from "./memberships.service";

@Controller("memberships")
export class MembershipsController {
  constructor(private readonly memberships: MembershipsService) {}

  @Post("renew")
  renew(@Body() body: { memberId: string; planKey: "strength" | "cardio" | "custom"; durationMonths: string; customDays?: number; customAmount?: number; amountPaid: number; paymentMode: string }) {
    return this.memberships.renew(body);
  }
}
