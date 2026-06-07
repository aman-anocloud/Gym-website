import { IsArray, IsBoolean, IsIn, IsInt, IsOptional, IsString, Matches, Max, Min } from "class-validator";

export class CreateMemberDto {
  @IsString() fullName!: string;
  @IsInt() @Min(5) @Max(100) age!: number;
  @IsIn(["Male", "Female"]) gender!: "Male" | "Female";
  @Matches(/^[0-9]{10}$/) phoneDay!: string;
  @IsOptional() @Matches(/^[0-9]{10}$/) phoneEvening?: string;
  @IsOptional() @IsString() emergencyContact?: string;
  @IsString() address!: string;
  @IsString() city!: string;
  @IsString() state!: string;
  @Matches(/^[0-9]{6}$/) pin!: string;
  @IsBoolean() trainerRequired!: boolean;
  @IsArray() healthFlags!: string[];
  @IsOptional() @IsString() healthNotes?: string;
  @IsBoolean() termsAccepted!: boolean;
  @IsIn(["strength", "cardio", "custom"]) planKey!: string;
  @IsString() durationMonths!: string;
  @IsOptional() @IsInt() customDays?: number;
  @IsOptional() @IsInt() customAmount?: number;
  @IsBoolean() waiveRegistration!: boolean;
  @IsInt() amountPaid!: number;
  @IsIn(["Cash", "UPI", "Bank Transfer"]) paymentMode!: string;
  @IsOptional() @IsString() remarks?: string;
}

export class UpdateMemberDto {
  @IsOptional() @IsString() fullName?: string;
  @IsOptional() @Matches(/^[0-9]{10}$/) phoneDay?: string;
  @IsOptional() @IsIn(["Paid", "Due", "Pending"]) paymentStatus?: string;
  @IsOptional() @IsString() photoUrl?: string;
  @IsOptional() @IsString() signatureUrl?: string;
}
