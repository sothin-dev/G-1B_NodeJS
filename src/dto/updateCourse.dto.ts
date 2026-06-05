import { IsOptional, IsPositive, IsString, IsUUID, IsNumber } from "class-validator";

export class UpdateCourseDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  credit?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  capacity?: number;

  @IsOptional()
  @IsUUID()
  teacher_id?: string;
}
