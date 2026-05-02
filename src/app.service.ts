import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return {
      name: 'Seeman Auto API',
      status: 'running',
      version: '1.0.0',
    };
  }
}
