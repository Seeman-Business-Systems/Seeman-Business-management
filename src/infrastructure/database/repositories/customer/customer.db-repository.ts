import { InjectRepository } from '@nestjs/typeorm';
import CustomerRepository from './customer.repository';
import CustomerEntity from '../../entities/customer.entity';
import { IsNull, ILike, Repository } from 'typeorm';
import Customer from 'src/domain/customer/customer';

class CustomerDBRepository extends CustomerRepository {
  constructor(
    @InjectRepository(CustomerEntity)
    private readonly repository: Repository<CustomerEntity>,
  ) {
    super();
  }

  async findById(id: number): Promise<Customer | null> {
    const record = await this.repository.findOne({ where: { id } });

    if (!record) {
      return null;
    }

    return this.toDomain(record);
  }

  async findByName(name: string): Promise<Customer[]> {
    const records = await this.repository.find({
      where: {
        name: ILike(`%${name}%`),
      },
    });

    return records.map((entity: CustomerEntity) => this.toDomain(entity));
  }

  async findAll(): Promise<Customer[]> {
    const records = await this.repository.find();

    return records.map((entity: CustomerEntity) => this.toDomain(entity));
  }

  async delete(id: number): Promise<void> {
    this.repository.softDelete(id);
  }

  async restore(id: number): Promise<Customer> {
    await this.repository.restore(id);
    const restoredRecord = await this.repository.findOne({
      where: { id },
      withDeleted: true, // Important: need this to find the just-restored entity
    });

    if (!restoredRecord) {
      throw new Error(`Customer with id ${id} not found`);
    }

    return this.toDomain(restoredRecord);
  }

  async commit(customer: Customer): Promise<Customer> {
    const entity = this.toEntity(customer);
    const savedEntity = await this.repository.save(entity);

    return this.toDomain(savedEntity);
  }

  toDomain(entity: CustomerEntity): Customer {
    return new Customer(
      entity.id,
      entity.name,
      entity.email,
      entity.notes,
      entity.phoneNumber,
      entity.companyName,
      entity.altPhoneNumber,
      Number(entity.creditLimit),
      Number(entity.outstandingBalance),
      entity.createdBy,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  private toEntity(customer: Customer): CustomerEntity {
    const entity = new CustomerEntity();

    if (customer.getId()) {
      entity.id = customer.getId();
    }
    entity.name = customer.getName();
    entity.phoneNumber = customer.getPhoneNumber();
    entity.createdBy = customer.getCreatedBy();
    entity.createdAt = customer.getCreatedAt();
    entity.updatedAt = customer.getUpdatedAt();
    entity.notes = customer.getNotes();
    entity.companyName = customer.getCompanyName();
    entity.altPhoneNumber = customer.getAltPhoneNumber();
    entity.email = customer.getEmail();
    entity.creditLimit = customer.getCreditLimit();
    entity.outstandingBalance = customer.getOutstandingBalance();

    return entity;
  }
}

export default CustomerDBRepository;
