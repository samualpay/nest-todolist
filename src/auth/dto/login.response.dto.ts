import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDTO {
  @ApiProperty()
  readonly token: string;
}
