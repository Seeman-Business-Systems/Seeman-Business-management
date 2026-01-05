import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import DeleteCustomerCommand from './delete-customer.command';
import CustomerRepository from 'src/infrastructure/database/repositories/customer/customer.repository';

@CommandHandler(DeleteCustomerCommand)
class DeleteCustomer implements ICommandHandler<DeleteCustomerCommand> {
  constructor(private customers: CustomerRepository) {}

  async execute(command: DeleteCustomerCommand): Promise<void> {
    const customer = await this.customers.findById(command.id);

    if (!customer) {
      throw new Error(`Customer with id ${command.id} not found`);
    }

    await this.customers.delete(command.id);
  }
}

export default DeleteCustomer;