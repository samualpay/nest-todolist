import { Injectable } from '@nestjs/common';
import { User } from '../entity/user.entity';
import { UserRepository } from '../repository/UserRepository';
import { CreateUserDTO } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}
  async createUser({ account, password }: CreateUserDTO) {
    let user = this.userRepository.create({ account, password });
    user = await this.userRepository.save(user);
    return user;
  }
}
