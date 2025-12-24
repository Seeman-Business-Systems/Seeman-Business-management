import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import * as path from 'path';

export const loggerConfig = WinstonModule.createLogger({
  transports: [
    // Console output
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, context }) => {
          return `[${timestamp}] ${level} [${context || 'Application'}]: ${message}`;
        }),
      ),
    }),
    
    // Single log file: nest.log
    new winston.transports.File({
      filename: path.join('storage', 'logs', 'nest.log'),
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      maxsize: 5242880, // 5MB
      maxFiles: 5, // Keep last 5 files when rotating
    }),
  ],
});