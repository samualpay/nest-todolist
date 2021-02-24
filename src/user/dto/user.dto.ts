import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNumber, IsString, MinLength } from 'class-validator';

export class UserDTO {
  @ApiProperty()
  @IsNumber()
  readonly id: number;
  @ApiProperty()
  @IsString()
  @IsEmail()
  readonly account: string;
}
