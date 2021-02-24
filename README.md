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

## add exception filter filter/any-exception.filter.ts

```typescript
import {
  ArgumentsHost,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
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

### add create user for service

```typescript
async createUser({ account, password }: CreateUserDTO) {
    let user = this.userRepository.create({ account, password });
    user = await this.userRepository.save(user);
    return user;
  }
```

### add create user for controller

```typescript

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
