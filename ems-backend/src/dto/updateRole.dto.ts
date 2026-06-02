import { IsString, IsOptional } from "class-validator";

export class UpdateRole {

    @IsOptional()
    @IsString()
    name: string
}