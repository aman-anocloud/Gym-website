import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { CreateMemberDto, UpdateMemberDto } from "./dto";
import { MembersService } from "./members.service";

@Controller("members")
export class MembersController {
  constructor(private readonly members: MembersService) {}

  @Get()
  list(@Query("search") search = "", @Query("status") status = "") {
    return this.members.list(search, status);
  }

  @Post()
  create(@Body() body: CreateMemberDto) {
    return this.members.create(body);
  }

  @Get(":id")
  profile(@Param("id") id: string) {
    return this.members.profile(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: UpdateMemberDto) {
    return this.members.update(id, body);
  }
}
