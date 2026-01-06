import { Command } from '@nestjs/cqrs';
import Customer from 'src/domain/customer/customer';

class SetCreditLimitCommand extends Command<Customer> {
  constructor(
    public readonly customerId: number,
    public readonly creditLimit: number,
    public readonly actorId: number,
  ) {
    super();
  }
}

export default SetCreditLimitCommand;