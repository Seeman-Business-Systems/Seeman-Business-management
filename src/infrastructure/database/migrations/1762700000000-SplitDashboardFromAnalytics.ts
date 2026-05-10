import { MigrationInterface, QueryRunner } from 'typeorm';

export class SplitDashboardFromAnalytics1762700000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO role_permissions (role_name, permission, granted)
      SELECT role_name, 'dashboard:view', true
      FROM (VALUES ('CEO'), ('Branch Manager'), ('Sales Rep'), ('Apprentice')) AS r(role_name)
      ON CONFLICT (role_name, permission) DO UPDATE SET granted = true
    `);

    await queryRunner.query(`
      UPDATE role_permissions
      SET granted = false
      WHERE role_name IN ('Sales Rep', 'Apprentice')
        AND permission = 'analytics:read'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM role_permissions
      WHERE permission = 'dashboard:view'
        AND role_name IN ('CEO', 'Branch Manager', 'Sales Rep', 'Apprentice')
    `);

    await queryRunner.query(`
      UPDATE role_permissions
      SET granted = true
      WHERE role_name IN ('Sales Rep', 'Apprentice')
        AND permission = 'analytics:read'
    `);
  }
}
