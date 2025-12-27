import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Matches } from 'class-validator';
import WarehouseStatus from 'src/domain/warehouse/warehouse-status';
import WarehouseType from 'src/domain/warehouse/warehouse-type';
import BranchEntity from './branch.entity';
import StaffEntity from './staff.entity';

@Entity({ name: 'warehouses' })
class WarehouseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column({
    type: 'enum',
    enum: WarehouseStatus,
    default: WarehouseStatus.ACTIVE,
  })
  status: WarehouseStatus;

  @Column()
  @Matches(/^[0-9+\-\s()]+$/, { message: 'Invalid phone number format' })
  phoneNumber: string;

  @ManyToOne(() => BranchEntity, (branch) => branch.warehouses)
  @JoinColumn({ name: 'branch_id' })
  branch: BranchEntity;

  @ManyToOne(() => StaffEntity)
  @JoinColumn({ name: 'manager_id' })
  manager: StaffEntity;

  @Column({ type: 'enum', enum: WarehouseType })
  warehouseType: WarehouseType;

  @Column({ type: 'int', nullable: true })
  capacity: number | null;

  @Column({ type: 'int' })
  createdBy: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;
}

export default WarehouseEntity;
