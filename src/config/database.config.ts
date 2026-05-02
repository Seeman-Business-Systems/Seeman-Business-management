import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

export const DatabaseConfig = TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    type: 'postgres',
    host: config.get('DB_HOST'),
    port: config.get<number>('DB_PORT', 5432),
    username: config.get('DB_USERNAME'),
    password: config.get('DB_PASSWORD'),
    database: config.get('DB_NAME'),
    logging: true,
    autoLoadEntities: true,
    namingStrategy: new SnakeNamingStrategy(),
    synchronize: true,
    ssl:
      config.get('DB_SSL', 'false') === 'true'
        ? { rejectUnauthorized: false }
        : false,
  }),
});
