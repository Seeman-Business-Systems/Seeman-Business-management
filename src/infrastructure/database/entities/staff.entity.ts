import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
} from 'typeorm';
import BranchEntity from './branch.entity';
import { Matches } from 'class-validator';
import RoleEntity from './role.entity';

@Entity({ name: 'staff' })
class StaffEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Invalid phone number format',
  })
  phoneNumber: string;

  @Column({ name: 'role_id' })
  roleId: number;

  @ManyToOne(() => RoleEntity)
  @JoinColumn({ name: 'role_id' })
  role: RoleEntity;

  @Column({ name: 'branch_id', nullable: true })
  branchId: number;

  @ManyToOne(() => BranchEntity, { nullable: true })
  @JoinColumn({ name: 'branch_id' })
  branch: BranchEntity;

  @Column({ nullable: true })
  middleName?: string;

  @Column({ nullable: true, unique: true })
  email?: string;

  @Column({ type: 'timestamp', nullable: true })
  joinedAt?: Date;

  @Column()
  password: string;

  @Column()
  createdBy: number;

  @Column({ default: false })
  initialPasswordChanged: boolean;

  @Column({ nullable: true })
  lastLoginAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;
}

export default StaffEntity;
