import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import BranchEntity from './branch.entity';
import StaffEntity from './staff.entity';
import SaleEntity from './sale.entity';
import SupplyItemEntity from './supply-item.entity';
import SupplyStatus from 'src/domain/supply/supply-status';

@Entity({ name: 'supplies' })
class SupplyEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'supply_number', type: 'varchar', length: 50, unique: true })
  supplyNumber: string;

  @Column({ name: 'sale_id' })
  saleId: number;

  @ManyToOne(() => SaleEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sale_id' })
  sale: SaleEntity;

  @Column({ name: 'sale_number', type: 'varchar', length: 50 })
  saleNumber: string;

  @Column({ name: 'branch_id' })
  branchId: number;

  @ManyToOne(() => BranchEntity)
  @JoinColumn({ name: 'branch_id' })
  branch: BranchEntity;

  @Column({ type: 'enum', enum: SupplyStatus, default: SupplyStatus.DRAFT })
  status: SupplyStatus;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ name: 'supplied_by', type: 'int', nullable: true })
  suppliedBy: number | null;

  @ManyToOne(() => StaffEntity, { nullable: true })
  @JoinColumn({ name: 'supplied_by' })
  suppliedByStaff: StaffEntity | null;

  @OneToMany(() => SupplyItemEntity, (item) => item.supply, { cascade: true })
  items: SupplyItemEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

export default SupplyEntity;
