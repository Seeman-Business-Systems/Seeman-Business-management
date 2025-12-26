import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import BranchStatus from 'src/domain/branch/branch-status';
import StaffEntity from './staff.entity';
import { Matches } from 'class-validator';

@Entity({ name: 'branches' })
class BranchEntity {
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

  @Column({ type: 'enum', enum: BranchStatus, default: BranchStatus.ACTIVE })
  status: BranchStatus;

  @Column()
  @Matches(/^[0-9+\-\s()]+$/, { message: 'Invalid phone number format' })
  phoneNumber: string;

  @Column({ nullable: true })
  managerId: number;

  @OneToMany(() => StaffEntity, (staff) => staff.id, {})
  @JoinColumn()
  manager: number;

  @Column()
  isHeadOffice: boolean;

  @Column({ nullable: true })
  @Matches(/^[0-9+\-\s()]+$/, { message: 'Invalid phone number format' })
  altPhoneNumber?: string;

  @Column({ nullable: true })
  code?: string;

  @Column()
  createdBy: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;
}

export default BranchEntity;
