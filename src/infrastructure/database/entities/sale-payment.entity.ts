import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import SaleEntity from './sale.entity';
import StaffEntity from './staff.entity';
import PaymentMethod from 'src/domain/sale/payment-method';

@Entity({ name: 'sale_payments' })
class SalePaymentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => SaleEntity, (sale) => sale.payments)
  @JoinColumn({ name: 'sale_id' })
  sale: SaleEntity;

  @Column({ name: 'sale_id' })
  saleId: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: PaymentMethod, name: 'payment_method' })
  paymentMethod: PaymentMethod;

  @Column({ type: 'varchar', length: 255, nullable: true })
  reference: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ name: 'recorded_by' })
  recordedBy: number;

  @ManyToOne(() => StaffEntity)
  @JoinColumn({ name: 'recorded_by' })
  recordedByStaff: StaffEntity;

  @Column({ type: 'timestamp', name: 'recorded_at', default: () => 'CURRENT_TIMESTAMP' })
  recordedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

export default SalePaymentEntity;
