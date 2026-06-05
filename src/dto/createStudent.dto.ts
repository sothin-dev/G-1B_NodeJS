import { IsNotEmpty, IsString, IsEmail, IsUUID } from "class-validator";

export class CreateStudentDto {
   @IsNotEmpty()
   student_number: string;

   @IsUUID()
   @IsString()
   user_id: string;


   @IsUUID()
   department_id: string;
}