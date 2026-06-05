import { IsString, IsNotEmpty, Matches } from "class-validator";

export class CreateScheduleDto {
  @IsNotEmpty()
  @IsString()
  course_id: string;

  @IsNotEmpty()
  @IsString()
  day: string;

  @IsNotEmpty()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "start_time must be in HH:mm format" })
  start_time: string;

  @IsNotEmpty()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "end_time must be in HH:mm format" })
  end_time: string;

  @IsNotEmpty()
  @IsString()
  room: string;
}
