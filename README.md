# nest-todolist

## install nestjs cli

```bash
$ sudo npm i -g @nestjs/cli
```

## install typeorm cli

```bash
$ sudo npm i -g typeorm
```

## create nestjs project

```bash
$ nest new nest-todolist
```

## install typeorm

```bash
$ npm i @nestjs/typeorm typeorm
```

## install mysql

```bash
$ npm i mysql2
```

## install config

```bash
$ npm i --save @nesgtjs/config
```

## install nestjs-pino

```bash
$ npm i nestjs-pino pino-pretty
```

## install uuid

```bash
$ npm i uuid @types/uuid
```

## install swagger

```bash
$ npm i @nestjs/swagger swagger-ui-express
```

## add Custom configuration files config/configuration.ts

```typescript
export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    username: 'root',
    password: 'root',
    database: 'todolist',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT, 10) || 3306,
  },
  log: {
    level: process.env.LOG_LEVEL || 'debug',
    pretty: process.env.LOG_PRETTY || 'true',
  },
  swagger: {
    visible: process.env.SWAGGER_VISIBLE || 'true',
  },
});
```

## add configuration in app.module.tw

```typescript
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
  ],
})
```

## Using configService in the main.ts

```typescript
const configService = app.get(ConfigService);
const port = configService.get('port');
```

## Using swaggerModule in the main.ts

```typescript
if (configService.get<string>('swagger.visible') === 'true') {
  const swaggerConfig = new DocumentBuilder()
    .setTitle('nest todolist')
    .setDescription('nest todolist swagger')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, document);
}
```

## Using exception filter in app.module.ts

```typescript
providers: [
    AppService,
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
```

## Using LoggerModule in the app.module.ts

```typescript
@Module({
  imports: [
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (ConfigService: ConfigService) => ({
        pinoHttp: {
          level: ConfigService.get('log.level'),
          genReqId: function (req) {
            return v4();
          },
          prettyPrint:
            ConfigService.get<string>('log.pretty') === 'true'
              ? {
                  colorize: true,
                  levelFirst: true,
                  translateTime: 'UTC:yyyy/mm/dd HH:MM:ss Z',
                }
              : false,
        },
      }),
    }),
    ...
  ]
```

## Using Logger in the app.controller.ts

```typescript
import { Controller, Get } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly logger: PinoLogger,
  ) {
    logger.setContext(AppController.name);
  }

  @Get()
  getHello(): string {
    this.logger.info('getHello');
    return this.appService.getHello();
  }
}
```

## add exception filter filter/any-exception.filter.ts

```typescript
import {
  ArgumentsHost,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Response } from 'express';
import { PinoLogger } from 'nestjs-pino';
@Injectable()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private logger: PinoLogger) {
    logger.setContext(AllExceptionsFilter.name);
  }
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    let status = 400;
    let message = exception.message;
    let stack = '';
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      this.logger.warn({ message });
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      stack = exception.stack;
      this.logger.error({ message, stack });
    }
    response.status(status).json({
      statusCode: status,
      message,
      stack,
    });
  }
}
```

## Using TypeOrmModule in the app.module.ts

```typescript
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/migration/*{.ts,.js}'],
        migrationsRun: false, //使用migration時開啟,適合上線後
        synchronize: true, //使用自動sync與migrationsRun只能留一個,適合上線前
      }),
      inject: [ConfigService],
    }),
  ]
})
```

## add user entity entity/user.entity.ts

```typescript
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({
    length: 128,
    nullable: false,
    unique: true,
  })
  account: string;
  @Column({
    length: 128,
    nullable: false,
  })
  password: string;
  @CreateDateColumn({ type: 'timestamp' })
  createAt: Date;
  @UpdateDateColumn({ type: 'timestamp' })
  updateAt: Date;
}
```

## add migration file(Option should set migrationsRun:true)

```bash
$ typeorm migration:create -n InitUser -d src/migration
```

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitUser1614039944079 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // RUN
    await queryRunner.query(
      "Insert Into `user` (`account`,`password`) values('admin','admin')",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // REVERT
    await queryRunner.query("Delete from `user` Where `account` = 'admin'");
  }
}
```

## add user repository at repository/UserRepository.ts

```typescript
import { EntityRepository, Repository } from 'typeorm';
import { User } from '../entity/user.entity';

@EntityRepository(User)
export class UserRepository extends Repository<User> {}
```

## import UserRepositoryc into UserModule

```typescript
@Module({
  imports: [TypeOrmModule.forFeature([UserRepository])],
  controllers: [UserController],
  providers: [UserService],
})
```

## inject userRepository into userService

```typescript
import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repository/UserRepository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}
}
```

## add todolist module controller service

```bash
$ nest g module todolist
$ nest g controller todolist
$ nest g service todolist
```

## add user module controller service

```bash
$ nest g module user
$ nest g controller user
$ nest g service user

```

## add class validator and class-transformer for validation pipe

```bash
$ npm i --save class-validator class-transformer
```

## add DTO for create user at user/dto/create-user.dto.ts

```typescript
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDTO {
  @IsString()
  @IsEmail()
  readonly account: string;
  @IsString()
  @MinLength(6, { message: 'password is too short' })
  readonly password: string;
}
```

## add validation pipe

```bash
nest g pi validation
```

```typescript
import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class ValidationPipe implements PipeTransform {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    const object = plainToClass(metatype, value);
    const errors = await validate(object);
    if (errors.length > 0) {
      throw new BadRequestException('Validation failed');
    }
    return value;
  }
  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];

    return !types.includes(metatype);
  }
}
```

## add validation pipe to main.ts

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from './validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
bootstrap();
```

## add create user api

### add create-user.dto

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDTO {
  @ApiProperty()
  @IsString()
  @IsEmail()
  readonly account: string;
  @ApiProperty()
  @IsString()
  @MinLength(6, { message: 'password is too short' })
  readonly password: string;
}
```

### add user dto

```typescript
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
```

### add create user for service

```typescript
async createUser({ account, password }: CreateUserDTO): Promise<UserDTO> {
    let user = this.userRepository.create({ account, password });
    user = await this.userRepository.save(user);
    return { id: user.id, account: user.account };
  }
```

### add create user for controller

```typescript
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Post()
  @ApiResponse({ status: 201, type: UserDTO, description: 'Create user' })
  async create(@Body() createUserDTO: CreateUserDTO) {
    return this.userService.createUser(createUserDTO);
  }
}
```

## add login auth api

### install passport

```bash
$ npm install --save @nestjs/passport passport passport-local
$ npm install --save-dev @types/passport-local
```

### create auth module & service

```bash
$ nest g module auth
$ nest g controller auth
$ nest g service auth
```

### add findUserByAccount in userService

```typescript
async findUserByAccount(account: string) {
    let user = await this.userRepository.findOne({ account });
    return user;
  }
```

### export userService in userModule

```typescript
@Module({
  ...
exports: [UserService]
})
```

### add valiateUser function in authService

```typescript
import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}
  async validateUser(account: string, password: string) {
    const user = await this.userService.findUserByAccount(account);
    if (user && user.password === password) {
      return user;
    }
    return null;
  }
}
```

### import userModule in authModule

```typescript
import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { AuthService } from './auth.service';

@Module({
  imports: [UserModule],
  providers: [AuthService],
})
export class AuthModule {}
```

### add local strategy auth/local.strategy.ts

```typescript
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({ usernameField: 'account' }); //change default column username -> account
  }

  async validate(account: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(account, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
```

### use LocalStrategy in auth module

```typescript
import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';

@Module({
  imports: [UserModule, PassportModule],
  providers: [AuthService, LocalStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
```

### add LocalAuthGuard auth/local-auth.guard.ts

```typescript
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
```

### install jwt

```bash
$ npm i @nestjs/jwt passport-jwt
$ npm i @types/passport-jwt --save-dev
```

### add login dto

```typescript
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
```

### add login response dto

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDTO {
  @ApiProperty()
  readonly token: string;
}
```

### add login funtion to authService

```typescript
async login(user: User): Promise<LoginResponseDTO> {
    const payload = { account: user.account, sub: user.id };
    return {
      token: this.jwtService.sign(payload),
    };
  }
```

### add login api and use localAuthGuard in auth controller

```typescript
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

```

### using JwtModule in auth module

```typescript
JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('jwt.secret');
        const expiresIn = configService.get<string>('jwt.expires') + 's';
        return { secret, signOptions: { expiresIn } };
      },
    }),
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## 參考資料

- [https://docs.nestjs.cn/7/firststeps](https://docs.nestjs.cn/7/firststeps)
