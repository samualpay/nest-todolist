import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDTO {
  @ApiProperty()
  @IsString()
  @IsEmail()
  readonly account: string;
  @ApiProperty()
  @IsString()
  @MinLength(6, { message: 'password is too short' })
  readonly password: string;
}
