import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entity/user.entity';
import { UserService } from '../user/user.service';
import { LoginResponseDTO } from './dto/login.response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}
  async validateUser(account: string, password: string) {
    const user = await this.userService.findUserByAccount(account);
    if (user && user.password === password) {
      return user;
    }
    return null;
  }
  async login(user: User): Promise<LoginResponseDTO> {
    const payload = { account: user.account, sub: user.id };
    return {
      token: this.jwtService.sign(payload),
    };
  }
}
