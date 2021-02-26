import { Controller, HttpCode, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDTO } from './dto/login.dto';
import { LoginResponseDTO } from './dto/login.response.dto';
import { LocalAuthGuard } from './local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiBody({ type: LoginDTO })
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    type: LoginResponseDTO,
    description: 'Login Success',
  })
  async login(@Request() req) {
    return this.authService.login(req.user);
  }
}
