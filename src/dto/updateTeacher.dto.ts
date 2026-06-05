import { IsOptional, IsUUID } from "class-validator";

export class UpdateTeacherDto {
  @IsOptional()
  @IsUUID()
  department_id?: string;
}
