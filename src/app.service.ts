import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  getHello(): string {
    this.logger.log('Hello endpoint was called');
    this.logger.warn('This is a warning message');
    this.logger.error('This is an error message', 'Error stack trace here');
    
    return 'Hello World!';
  }
}