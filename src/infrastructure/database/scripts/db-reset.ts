import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../../app.module';
import { DataSource } from 'typeorm';

async function resetDatabase() {
  const app = await NestFactory.create(AppModule);
  const dataSource = app.get(DataSource);

  try {
    console.log('Starting database reset…');

    // Get all table names
    const tables = await dataSource.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
    `);

    console.log(`Found ${tables.length} tables to truncate`);

    // Disable foreign key checks temporarily and truncate all tables
    for (const { tablename } of tables) {
      if (tablename !== 'migrations') {
        // Skip migrations table if you have one
        console.log(`Truncating table: ${tablename}`);
        await dataSource.query(
          `TRUNCATE TABLE "${tablename}" RESTART IDENTITY CASCADE`,
        );
      }
    }

    console.log('Database reset completed successfully!');
    console.log('All tables have been truncated and sequences reset.');
  } catch (error) {
    console.error('Error resetting database:', error);
  } finally {
    await app.close();
  }
}

resetDatabase();
