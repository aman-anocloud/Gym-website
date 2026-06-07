import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { AuthModule } from "./auth/auth.module";
import { DatabaseModule } from "./database/database.module";
import { MembersModule } from "./members/members.module";
import { PaymentsModule } from "./payments/payments.module";
import { MembershipsModule } from "./memberships/memberships.module";
import { RemindersModule } from "./reminders/reminders.module";
import { ReportsModule } from "./reports/reports.module";
import { UploadsModule } from "./uploads/uploads.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    AuthModule,
    MembersModule,
    PaymentsModule,
    MembershipsModule,
    RemindersModule,
    ReportsModule,
    UploadsModule,
  ],
})
export class AppModule {}
