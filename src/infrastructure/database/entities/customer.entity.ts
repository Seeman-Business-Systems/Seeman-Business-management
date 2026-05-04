import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import StaffEntity from './staff.entity';
import BranchEntity from './branch.entity';

@Entity('customers')
class CustomerEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'varchar', length: 20, name: 'phone_number' })
  phoneNumber: string;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'company_name',
    nullable: true,
  })
  companyName: string | null;

  @Column({
    type: 'varchar',
    length: 20,
    name: 'alt_phone_number',
    nullable: true,
  })
  altPhoneNumber: string | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'credit_limit', default: 0 })
  creditLimit: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'outstanding_balance', default: 0 })
  outstandingBalance: number;

  @Column({ type: 'int', name: 'created_by' })
  createdBy: number;

  @ManyToOne(() => StaffEntity)
  @JoinColumn({ name: 'created_by' })
  createdByStaff: StaffEntity;

  @Column({ type: 'int', name: 'branch_id' })
  branchId: number;

  @ManyToOne(() => BranchEntity)
  @JoinColumn({ name: 'branch_id' })
  branch: BranchEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}

export default CustomerEntity;
