import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Supply from 'src/domain/supply/supply';
import SupplyItem from 'src/domain/supply/supply-item';
import TransactionContext from 'src/application/shared/transactions/transaction-context';
import TypeOrmTransactionContext from '../../transactions/typeorm-transaction-context';
import SupplyEntity from '../../entities/supply.entity';
import SupplyItemEntity from '../../entities/supply-item.entity';
import SupplyRepository from './supply.repository';

@Injectable()
class SupplyDBRepository extends SupplyRepository {
  constructor(
    @InjectRepository(SupplyEntity)
    private readonly repository: Repository<SupplyEntity>,
  ) {
    super();
  }

  private repoFor(tx?: TransactionContext): Repository<SupplyEntity> {
    const manager = TypeOrmTransactionContext.unwrap(tx);
    return manager ? manager.getRepository(SupplyEntity) : this.repository;
  }

  async findById(id: number): Promise<Supply | null> {
    const record = await this.repository.findOne({
      where: { id },
      relations: ['items', 'items.warehouse', 'branch', 'suppliedByStaff'],
    });
    return record ? this.toDomain(record) : null;
  }

  async findBySale(saleId: number): Promise<Supply | null> {
    const record = await this.repository.findOne({
      where: { saleId },
      relations: ['items', 'items.warehouse', 'branch', 'suppliedByStaff'],
    });
    return record ? this.toDomain(record) : null;
  }

  async commit(supply: Supply, tx?: TransactionContext): Promise<Supply> {
    const repo = this.repoFor(tx);
    const entity = new SupplyEntity();
    if (supply.getId()) {
      entity.id = supply.getId()!;
    }
    entity.supplyNumber = supply.getSupplyNumber();
    entity.saleId = supply.getSaleId();
    entity.saleNumber = supply.getSaleNumber();
    entity.branchId = supply.getBranchId();
    entity.status = supply.getStatus();
    entity.notes = supply.getNotes();
    entity.suppliedBy = supply.getSuppliedBy();

    const saved = await repo.save(entity);

    const full = await repo.findOne({
      where: { id: saved.id },
      relations: ['items', 'branch', 'suppliedByStaff'],
    });

    return this.toDomain(full!);
  }

  toDomain(entity: SupplyEntity): Supply {
    const items: SupplyItem[] = (entity.items ?? []).map(
      (item: SupplyItemEntity) =>
        new SupplyItem(
          item.id,
          item.supplyId,
          item.variantId,
          item.variantName,
          item.quantity,
          item.createdAt,
          item.warehouseId,
          item.warehouse?.name ?? null,
        ),
    );

    return new Supply(
      entity.id,
      entity.supplyNumber,
      entity.saleId,
      entity.saleNumber,
      entity.branchId,
      entity.status,
      entity.notes,
      entity.suppliedBy,
      items,
      entity.createdAt,
      entity.updatedAt,
    );
  }
}

export default SupplyDBRepository;
