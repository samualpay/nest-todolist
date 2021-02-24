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
