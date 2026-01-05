import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import CreateCustomerCommand from './create-customer.command';
import CustomerRepository from 'src/infrastructure/database/repositories/customer/customer.repository';
import Customer from 'src/domain/customer/customer';

@CommandHandler(CreateCustomerCommand)
class CreateCustomer implements ICommandHandler<CreateCustomerCommand> {
  constructor(private customers: CustomerRepository) {}

  async execute(command: CreateCustomerCommand): Promise<Customer> {
    const customer = new Customer(
      undefined,
      command.name,
      command.email,
      command.notes,
      command.phoneNumber,
      command.companyName,
      command.altPhoneNumber,
      command.createdBy,
      new Date(),
      new Date(),
      undefined,
    );

    return await this.customers.commit(customer);
  }
}

export default CreateCustomer;