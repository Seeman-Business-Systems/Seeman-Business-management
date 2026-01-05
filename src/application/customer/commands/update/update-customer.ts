import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CommandBus } from "@nestjs/cqrs";
import UpdateCustomerCommand from "./update-customer.command";
import SetCreditLimitCommand from "../set-credit-limit/set-credit-limit.command";
import CustomerRepository from "src/infrastructure/database/repositories/customer/customer.repository";
import Customer from "src/domain/customer/customer";

@CommandHandler(UpdateCustomerCommand)
class UpdateCustomer implements ICommandHandler<UpdateCustomerCommand> {
    constructor(
        private customers: CustomerRepository,
        private commandBus: CommandBus,
    ) { }

    async execute(command: UpdateCustomerCommand): Promise<Customer> {
        const customer = await this.customers.findById(command.id);

        if (!customer) {
          throw new Error(`Customer with id ${command.id} not found`);
        }

        customer.setName(command.name);
        customer.setPhoneNumber(command.phoneNumber);

        if (command.notes) {
            customer.setNotes(command.notes);
        }

        if (command.email) {
            customer.setEmail(command.email);
        }

        if (command.companyName) {
            customer.setCompanyName(command.companyName);
        }

        if (command.altPhoneNumber) {
            customer.setAltPhoneNumber(command.altPhoneNumber);
        }

        if (command.outstandingBalance !== null) {
            customer.setOutstandingBalance(command.outstandingBalance);
        }

        // Save basic updates first
        const updatedCustomer = await this.customers.commit(customer);

        // Handle credit limit change separately via SetCreditLimit command
        // This ensures CEO authorization is enforced
        if (command.creditLimit !== null && command.creditLimit !== customer.getCreditLimit()) {
            const setCreditLimitCommand = new SetCreditLimitCommand(
                command.id,
                command.creditLimit,
                command.actorId,
            );
            return await this.commandBus.execute(setCreditLimitCommand);
        }

        return updatedCustomer;
    }
}

export default UpdateCustomer;