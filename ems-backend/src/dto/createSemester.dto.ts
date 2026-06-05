import { IsDateString, IsNotEmpty, IsNumber, IsString, Min } from "class-validator";

export class CreateSemesterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(2000)
  year: number;

  @IsDateString()
  start_date: string;

  @IsDateString()
  end_date: string;
}
