import { Command } from "@nestjs/cqrs";
import Customer from "src/domain/customer/customer";

class CreateCustomerCommand extends Command<Customer> {
  constructor(
    public readonly name: string,
    public readonly phoneNumber: string,
    public readonly createdBy: number,
    public readonly branchId: number,
    public readonly notes: string | null,
    public readonly email: string | null,
    public readonly companyName: string | null,
    public readonly altPhoneNumber: string | null,
  ) {
    super();
  }
}

export default CreateCustomerCommand;
