import Customer from 'src/domain/customer/customer';
import InventoryReservation from 'src/domain/inventory/inventory-reservation';
import CustomerEntity from '../../entities/customer.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
abstract class CustomerRepository {
  abstract findById(id: number): Promise<Customer | null>;
  abstract findByName(name: string): Promise<Customer[]>;
  abstract findAll(): Promise<Customer[]>;
  abstract delete(id: number): Promise<void>;
  abstract restore(id: number): Promise<Customer>;
  abstract commit(customer: Customer): Promise<Customer>;
  abstract toDomain(entity: CustomerEntity): Customer;
}

export default CustomerRepository;
