import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import SupplyEntity from './supply.entity';

@Entity({ name: 'supply_items' })
class SupplyItemEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'supply_id' })
  supplyId: number;

  @ManyToOne(() => SupplyEntity, (supply) => supply.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'supply_id' })
  supply: SupplyEntity;

  @Column({ name: 'variant_id' })
  variantId: number;

  @Column({ name: 'variant_name', type: 'varchar', length: 255, nullable: true })
  variantName: string | null;

  @Column()
  quantity: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

export default SupplyItemEntity;
