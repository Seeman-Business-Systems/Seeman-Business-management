import { InjectRepository } from '@nestjs/typeorm';
import CustomerRepository from './customer.repository';
import CustomerEntity from '../../entities/customer.entity';
import { IsNull, Like, Repository } from 'typeorm';
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
        name: Like(`%${name}%`),
      },
    });

    return records.map((entity: CustomerEntity) => this.toDomain(entity));
  }
}

export default CustomerDBRepository;
