import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { AllExceptionsFilter } from './filter/any-exception.filter';
import { TodolistModule } from './todolist/todolist.module';
import { UserModule } from './user/user.module';
import { LoggerModule } from 'nestjs-pino';
import { v4 } from 'uuid';

@Module({
  imports: [
    TodolistModule,
    UserModule,
    ConfigModule.forRoot({ load: [configuration] }),
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
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
