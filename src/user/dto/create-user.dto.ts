import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDTO {
  @IsString()
  @IsEmail()
  readonly account: string;
  @IsString()
  @MinLength(6, { message: 'password is too short' })
  readonly password: string;
}
