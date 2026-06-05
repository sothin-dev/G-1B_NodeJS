import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  IsUUID,
} from "class-validator";

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsNumber()
  @IsPositive()
  credit: number;

  @IsNumber()
  @IsPositive()
  capacity: number;

  @IsUUID()
  department_id: string;

  @IsUUID()
  teacher_id: string;
}