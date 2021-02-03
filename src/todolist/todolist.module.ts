import { Module } from '@nestjs/common';
import { TodolistController } from './todolist.controller';
import { TodolistService } from './todolist.service';

@Module({
  controllers: [TodolistController],
  providers: [TodolistService]
})
export class TodolistModule {}
