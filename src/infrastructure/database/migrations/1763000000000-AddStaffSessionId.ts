import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStaffSessionId1763000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE staff
      ADD COLUMN IF NOT EXISTS session_id varchar(64) NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE staff DROP COLUMN IF EXISTS session_id
    `);
  }
}
