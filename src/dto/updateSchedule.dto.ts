import { IsString, IsOptional, Matches } from "class-validator";

export class UpdateScheduleDto {
  @IsOptional()
  @IsString()
  day?: string;

  @IsOptional()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "start_time must be in HH:mm format" })
  start_time?: string;

  @IsOptional()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "end_time must be in HH:mm format" })
  end_time?: string;

  @IsOptional()
  @IsString()
  room?: string;
}
