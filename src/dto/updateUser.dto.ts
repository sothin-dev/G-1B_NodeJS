import {
  IsString,
  IsEmail,
  IsUUID,
  IsBoolean,
  IsOptional,
} from "class-validator";

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  lastName: string;

  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsUUID()
  roleId: string;

  @IsOptional()
  @IsBoolean()
  isActive: boolean;

  @IsOptional()
  @IsString()
  password?: string;
}