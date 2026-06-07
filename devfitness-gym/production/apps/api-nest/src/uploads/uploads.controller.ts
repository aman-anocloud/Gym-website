import { Body, Controller, Post } from "@nestjs/common";
import { UploadsService } from "./uploads.service";

@Controller("uploads")
export class UploadsController {
  constructor(private readonly uploads: UploadsService) {}

  @Post("photo")
  photo(@Body() body: { filename: string; dataUrl: string }) {
    return this.uploads.saveDataUrl("photo", body);
  }

  @Post("signature")
  signature(@Body() body: { filename: string; dataUrl: string }) {
    return this.uploads.saveDataUrl("signature", body);
  }
}
