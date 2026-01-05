import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import UpdateCustomerCommand from "./update-customer.command";
import CustomerRepository from "src/infrastructure/database/repositories/customer/customer.repository";
import Customer from "src/domain/customer/customer";

@CommandHandler(UpdateCustomerCommand)
class UpdateCustomer implements ICommandHandler<UpdateCustomerCommand> {
    constructor(private customers: CustomerRepository) { }
    
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

        return await this.customers.commit(customer);
    }
}

export default UpdateCustomer;