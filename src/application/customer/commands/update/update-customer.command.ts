import { Command } from "@nestjs/cqrs";
import Customer from "src/domain/customer/customer";

class UpdateCustomerCommand extends Command<Customer> {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly phoneNumber: string,
    public readonly notes: string | null,
    public readonly email: string | null,
    public readonly companyName: string | null,
    public readonly altPhoneNumber: string | null,
  ) {
    super();
  }
}

export default UpdateCustomerCommand;
