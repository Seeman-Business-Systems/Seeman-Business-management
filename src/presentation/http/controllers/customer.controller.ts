import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import CreateCustomerCommand from 'src/application/customer/commands/create/create-customer.command';
import CreateCustomerValidator from 'src/application/customer/commands/create/create-customer.validator';
import UpdateCustomerCommand from 'src/application/customer/commands/update/update-customer.command';
import UpdateCustomerValidator from 'src/application/customer/commands/update/update-customer.validator';
import DeleteCustomerCommand from 'src/application/customer/commands/delete/delete-customer.command';
import { ActorType } from 'src/domain/common/actor-type';
import Customer from 'src/domain/customer/customer';
import Staff from 'src/domain/staff/staff';
import CustomerRepository from 'src/infrastructure/database/repositories/customer/customer.repository';
import Actor from 'src/modules/auth/decorators/actor.decorator';
import JwtAuthGuard from 'src/modules/auth/guards/jwt-auth.guard';
import CustomerQuery from 'src/application/customer/queries/customer.query';
import type { CustomerFilters } from 'src/application/customer/queries/customer.filters';
import CustomerSerialiser from 'src/presentation/serialisers/customer.serialiser';

@Controller('customers')
// @UseGuards(JwtAuthGuard)
class CustomerController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly customers: CustomerRepository,
    private readonly customerQuery: CustomerQuery,
    private readonly customerSerialiser: CustomerSerialiser,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateCustomerValidator,
    @Actor() actor: Staff,
  ): Promise<Customer> {
    const command = new CreateCustomerCommand(
      dto.name,
      dto.phoneNumber,
      // actor.getId() ??
      1,
      dto.notes,
      dto.email,
      dto.companyName,
      dto.altPhoneNumber,
    );

    return await this.commandBus.execute(command);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCustomerValidator,
  ): Promise<Customer> {
    const command = new UpdateCustomerCommand(
      id,
      dto.name,
      dto.phoneNumber,
      dto.notes,
      dto.email,
      dto.companyName,
      dto.altPhoneNumber,
    );

    return await this.commandBus.execute(command);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    const command = new DeleteCustomerCommand(id);

    await this.commandBus.execute(command);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const customer = await this.customers.findById(id);

    if (!customer) {
      throw new Error(`Customer with id ${id} not found`);
    }

    return this.customerSerialiser.serialise(customer);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() filters: CustomerFilters) {
    const customers = await this.customerQuery.findBy(filters);

    return this.customerSerialiser.serialiseMany(customers);
  }
}

export default CustomerController;
