import { Entity, Column, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('role_permissions')
class RolePermissionEntity {
  @PrimaryColumn({ type: 'varchar', length: 100, name: 'role_name' })
  roleName: string;

  @PrimaryColumn({ type: 'varchar', length: 100 })
  permission: string;

  @Column({ type: 'boolean', default: true })
  granted: boolean;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

export default RolePermissionEntity;
