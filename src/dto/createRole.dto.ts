import { IsString } from "class-validator";

export class CreateRole {

    @IsString()
    name: string
}