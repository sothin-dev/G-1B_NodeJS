import {
  IsString,
  IsEmail,
  IsUUID,
  IsBoolean,
  MinLength,
} from "class-validator";

export class CreateUserDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsUUID()
  roleId: string;

  @IsBoolean()
  isActive: boolean;

  @IsString()
  @MinLength(6)
  password: string;
}