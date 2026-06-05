import {
  IsEmail,
  IsString,
  IsOptional,
  MinLength,
  IsUUID
} from "class-validator";

export class RegisterDto {

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}