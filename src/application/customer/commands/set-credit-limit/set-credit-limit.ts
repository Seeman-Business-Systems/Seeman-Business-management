import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import SetCreditLimitCommand from './set-credit-limit.command';
import CustomerRepository from 'src/infrastructure/database/repositories/customer/customer.repository';
import StaffRepository from 'src/infrastructure/database/repositories/staff/staff.repository';
import Customer from 'src/domain/customer/customer';
import DefaultRoles from 'src/domain/role/default-roles';

@CommandHandler(SetCreditLimitCommand)
class SetCreditLimit implements ICommandHandler<SetCreditLimitCommand> {
  constructor(
    private customers: CustomerRepository,
    private staff: StaffRepository,
  ) {}

  async execute(command: SetCreditLimitCommand): Promise<Customer> {
    // Verify actor is CEO
    const actor = await this.staff.findById(command.actorId);
    if (!actor) {
      throw new NotFoundException('Staff member not found');
    }

    if (actor.getRoleId() !== DefaultRoles.CEO) {
      throw new ForbiddenException(
        'Only CEO can set customer credit limits',
      );
    }

    // Find customer
    const customer = await this.customers.findById(command.customerId);
    if (!customer) {
      throw new NotFoundException(
        `Customer with id ${command.customerId} not found`,
      );
    }

    // Set credit limit
    customer.setCreditLimit(command.creditLimit);
    customer.setUpdatedAt(new Date());

    return await this.customers.commit(customer);
  }
}

export default SetCreditLimit;