import { Repository } from 'typeorm';
import StaffEntity from '../../entities/staff.entity';
import StaffRepository from './staff.repository';
import { InjectRepository } from '@nestjs/typeorm';
import Staff from 'src/domain/staff/staff';
import { Injectable } from '@nestjs/common';

@Injectable()
class StaffDBRepository extends StaffRepository {
  constructor(
    @InjectRepository(StaffEntity)
    private readonly repository: Repository<StaffEntity>,
  ) {
    super();
  }

  async findById(id: number): Promise<Staff | null> {
    const record = await this.repository.findOne({
      where: { id },
    });

    if (!record) {
      return null;
    }

    return this.toDomain(record);
  }

  async findByPhoneNumber(phoneNumber: string): Promise<Staff | null> {
    const record = await this.repository.findOne({
      where: { phoneNumber },
    });

    if (!record) {
      return null;
    }

    return this.toDomain(record);
  }

  async findByEmail(email: string): Promise<Staff | null> {
    const record = await this.repository.findOne({
      where: { email },
    });

    if (!record) {
      return null;
    }

    return this.toDomain(record);
  }

  async findAll(): Promise<Staff[]> {
    const records = await this.repository.find();

    return records.map((entity: StaffEntity) => this.toDomain(entity));
  }

  async commit(staff: Staff): Promise<Staff> {
    const entity = Object.assign(new StaffEntity(), staff);
    const savedEntity = await this.repository.save(entity);

    return this.toDomain(savedEntity);
  }

  private toDomain(entity: StaffEntity): Staff {
    return new Staff(
      entity.id,
      entity.firstName,
      entity.lastName,
      entity.phoneNumber,
      entity.roleId,
      entity.branchId,
      entity.createdAt,
      entity.updatedAt,
      entity.password,
      entity.createdBy,
      entity.initialPasswordChanged,
      entity.lastLoginAt,
      entity.middleName,
      entity.email,
      entity.joinedAt,
      entity.deletedAt,
    );
  }
}

export default StaffDBRepository;
