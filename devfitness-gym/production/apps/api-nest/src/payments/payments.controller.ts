import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { PaymentsService } from "./payments.service";

@Controller("payments")
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Get()
  list(@Query() query: { memberId?: string; mode?: string; dateFrom?: string; dateTo?: string }) {
    return this.payments.list(query);
  }

  @Post()
  create(@Body() body: { memberId: string; membershipId?: string; amount: number; paymentMode: string; paymentDate?: string; remarks?: string }) {
    return this.payments.create(body);
  }
}
