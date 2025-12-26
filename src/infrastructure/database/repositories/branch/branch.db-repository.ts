import Branch from 'src/domain/branch/branch';
import BranchRepository from './branch.repository';
import BranchEntity from 'src/infrastructure/database/entities/branch.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
class BranchDBRepository extends BranchRepository {
  constructor(
    @InjectRepository(BranchEntity)
    private readonly repository: Repository<BranchEntity>,
  ) {
    super();
  }

  async findById(id: number): Promise<Branch | null> {
    const record = await this.repository.findOne({ where: { id } });

    if (!record) {
      return null;
    }

    return this.toDomain(record);
  }

  async findByState(state: string): Promise<Branch[]> {
    const records = await this.repository.find({ where: { state } });

    return records.map((entity: BranchEntity) => this.toDomain(entity));
  }

  async findAll(): Promise<Branch[]> {
    const records = await this.repository.find();

    return records.map((entity: BranchEntity) => this.toDomain(entity));
  }

  async delete(id: number): Promise<void> {
    this.repository.softDelete(id);
  }

  async restore(id: number): Promise<Branch> {
    await this.repository.restore(id);
    const restoredRecord = await this.repository.findOne({
      where: { id },
      withDeleted: true, // Important: need this to find the just-restored entity
    });

    if (!restoredRecord) {
      throw new Error(`Branch with id ${id} not found`);
    }

    return this.toDomain(restoredRecord);
  }

  async commit(branch: Branch): Promise<Branch> {
    const entity = Object.assign(new BranchEntity(), branch);
    const savedEntity = await this.repository.save(entity);

    return this.toDomain(savedEntity);
  }

  toDomain(entity: BranchEntity): Branch {
    return new Branch(
      entity.id,
      entity.name,
      entity.address,
      entity.city,
      entity.state,
      entity.status,
      entity.phoneNumber,
      entity.managerId,
      entity.isHeadOffice,
      entity.createdBy,
      entity.createdAt,
      entity.updatedAt,
      entity.deletedAt,
      entity.altPhoneNumber,
      entity.code,
    );
  }
}

export default BranchDBRepository;
