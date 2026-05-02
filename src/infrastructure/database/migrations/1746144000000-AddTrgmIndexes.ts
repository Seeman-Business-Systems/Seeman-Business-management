import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTrgmIndexes1746144000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm`);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_customer_name_trgm
      ON customers USING gin(name gin_trgm_ops)
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_staff_email_trgm
      ON staff USING gin(email gin_trgm_ops)
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_product_variant_sku_trgm
      ON product_variants USING gin(sku gin_trgm_ops)
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_product_variant_name_trgm
      ON product_variants USING gin(variant_name gin_trgm_ops)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_product_variant_name_trgm`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_product_variant_sku_trgm`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_staff_email_trgm`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_customer_name_trgm`);
  }
}
