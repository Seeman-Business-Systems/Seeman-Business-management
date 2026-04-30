import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import CustomerEntity from './customer.entity';
import StaffEntity from './staff.entity';
import BranchEntity from './branch.entity';
import SaleLineItemEntity from './sale-line-item.entity';
import SalePaymentEntity from './sale-payment.entity';
import SaleStatus from 'src/domain/sale/sale-status';
import PaymentStatus from 'src/domain/sale/payment-status';
import PaymentMethod from 'src/domain/sale/payment-method';

@Entity({ name: 'sales' })
class SaleEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true, name: 'sale_number' })
  saleNumber: string;

  @Column({ name: 'customer_id', nullable: true })
  customerId: number | null;

  @ManyToOne(() => CustomerEntity, { nullable: true })
  @JoinColumn({ name: 'customer_id' })
  customer: CustomerEntity | null;

  @Column({ name: 'sold_by' })
  soldBy: number;

  @ManyToOne(() => StaffEntity)
  @JoinColumn({ name: 'sold_by' })
  soldByStaff: StaffEntity;

  @Column({ name: 'branch_id' })
  branchId: number;

  @ManyToOne(() => BranchEntity)
  @JoinColumn({ name: 'branch_id' })
  branch: BranchEntity;

  @Column({ type: 'enum', enum: SaleStatus, default: SaleStatus.FULFILLED })
  status: SaleStatus;

  @Column({ type: 'enum', enum: PaymentStatus, name: 'payment_status', nullable: true, default: PaymentStatus.PENDING })
  paymentStatus: PaymentStatus | null;

  @Column({ type: 'enum', enum: PaymentMethod, name: 'payment_method', nullable: true })
  paymentMethod: PaymentMethod | null;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'discount_amount', default: 0 })
  discountAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'total_amount' })
  totalAmount: number;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'timestamp', name: 'sold_at', default: () => 'CURRENT_TIMESTAMP' })
  soldAt: Date;

  @OneToMany(() => SaleLineItemEntity, (lineItem) => lineItem.sale, { cascade: true })
  lineItems: SaleLineItemEntity[];

  @OneToMany(() => SalePaymentEntity, (payment) => payment.sale, { cascade: true })
  payments: SalePaymentEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}

export default SaleEntity;
