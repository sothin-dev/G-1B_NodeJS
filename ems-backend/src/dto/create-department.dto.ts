import { IsString, IsNotEmpty, MaxLength, IsOptional } from "class-validator";

export class CreateDepartmentDto {
  @IsString()
  @IsNotEmpty({ message: "Department name is required" })
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty({ message: "Department code is required" })
  @MaxLength(20, { message: "Code must be 20 characters or less" })
  code: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}