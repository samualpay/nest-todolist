import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TodolistModule } from './todolist/todolist.module';

@Module({
  imports: [TodolistModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
