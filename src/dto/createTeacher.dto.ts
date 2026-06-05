import { IsOptional, IsUUID } from "class-validator";

export class CreateTeacherDto {
  @IsUUID()
  user_id: string;

  @IsOptional()
  @IsUUID()
  department_id?: string;
}
