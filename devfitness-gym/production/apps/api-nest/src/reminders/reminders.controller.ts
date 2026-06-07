import { Controller, Get, Post } from "@nestjs/common";
import { RemindersService } from "./reminders.service";

@Controller("reminders")
export class RemindersController {
  constructor(private readonly reminders: RemindersService) {}

  @Post("run")
  run() {
    return this.reminders.run();
  }

  @Get("logs")
  logs() {
    return this.reminders.logs();
  }
}
