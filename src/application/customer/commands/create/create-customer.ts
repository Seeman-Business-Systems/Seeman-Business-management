import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import CreateCustomerCommand from './create-customer.command';
import CustomerRepository from 'src/infrastructure/database/repositories/customer/customer.repository';
import Customer from 'src/domain/customer/customer';
import CustomerCreated from 'src/domain/customer/events/customer-created.event';

@CommandHandler(CreateCustomerCommand)
class CreateCustomer implements ICommandHandler<CreateCustomerCommand> {
  constructor(
    private customers: CustomerRepository,
    private eventBus: EventBus,
  ) {}

  async execute(command: CreateCustomerCommand): Promise<Customer> {
    const customer = new Customer(
      undefined,
      command.name,
      command.email,
      command.notes,
      command.phoneNumber,
      command.companyName,
      command.altPhoneNumber,
      0, // creditLimit - default to 0, must be set by CEO
      0, // outstandingBalance - starts at 0
      command.createdBy,
      new Date(),
      new Date(),
      undefined,
    );

    const saved = await this.customers.commit(customer);

    this.eventBus.publish(
      new CustomerCreated(saved.getId()!, saved.getName(), command.createdBy),
    );

    return saved;
  }
}

export default CreateCustomer;