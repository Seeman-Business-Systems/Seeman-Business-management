import { Injectable } from '@nestjs/common';
import RoleRepository from './role.repository';
import Role from 'src/domain/role/role';
import { InjectRepository } from '@nestjs/typeorm';
import RoleEntity from '../../entities/role.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import BranchEntity from '../../entities/branch.entity';

@Injectable()
class RoleDBRepository extends RoleRepository {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly repository: Repository<RoleEntity>,
  ) {
    super();
  }

  async findByIdOrName(id?: number, name?: string): Promise<Role | null> {
    if (!id && !name) {
      return null;
    }

    const where: FindOptionsWhere<BranchEntity>[] = [];

    if (id) {
      where.push({ id });
    }

    if (name) {
      where.push({ name });
    }

    const record = await this.repository.findOne({ where });

    if (!record) {
      return null;
    }

    return this.toDomain(record);
  }

  async findAll(): Promise<Role[]> {
    const records = await this.repository.find();

    return records.map((entity: RoleEntity) => this.toDomain(entity));
  }

  async delete(id: number): Promise<void> {
    this.repository.softDelete(id);
  }

  async restore(id: number): Promise<Role> {
    await this.repository.restore(id);

    const restoredRecord = await this.repository.findOne({
      where: { id },
      withDeleted: true, // Important: need this to find the just-restored entity
    });

    if (!restoredRecord) {
      throw new Error(`Role with id ${id} not found`);
    }

    return this.toDomain(restoredRecord);
  }

  async commit(role: Role): Promise<Role> {
    const entity = Object.assign(new RoleEntity(), role);

    const savedEntity = await this.repository.save(entity);

    return this.toDomain(savedEntity);
  }

  private toDomain(entity: RoleEntity): Role {
    return new Role(
      entity.id,
      entity.name,
      entity.isManagement,
      entity.createdBy,
      entity.createdAt,
      entity.updatedAt,
      entity.deletedAt,
    );
  }
}

export default RoleDBRepository;
