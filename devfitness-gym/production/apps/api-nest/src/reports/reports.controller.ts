import { Controller, Get, Param } from "@nestjs/common";
import { ReportsService } from "./reports.service";

@Controller()
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get("dashboard/stats")
  dashboard() {
    return this.reports.dashboard();
  }

  @Get("reports/:type")
  report(@Param("type") type: string) {
    return this.reports.report(type);
  }
}
