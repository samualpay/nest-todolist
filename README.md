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
        synchronize: true,
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
