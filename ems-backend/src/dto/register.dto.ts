import {
  IsEmail,
  isNumber,
  IsString,
  IsOptional,
  MinLength,
  IsNumber
} from "class-validator";

export class RegisterDto {

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  //optional
  @IsNumber()
  @IsOptional()
  roleID: number;
}