import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Get,
  Delete,
  Patch,
  Param,
  ParseIntPipe,
  UseGuards,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import JwtAuthGuard from 'src/modules/auth/guards/jwt-auth.guard';
import { RequirePermission } from 'src/modules/auth/decorators/role-guard.decorator';
import { Permission } from 'src/domain/permission/permission';
import Actor from 'src/modules/auth/decorators/actor.decorator';
import BranchScope from 'src/modules/auth/services/branch-scope.service';
import Staff from 'src/domain/staff/staff';
import CreateSaleCommand from 'src/application/sale/commands/create-sale/create-sale.command';
import CreateSaleValidator from 'src/application/sale/commands/create-sale/create-sale.validator';
import RecordSalePaymentCommand from 'src/application/sale/commands/record-payment/record-payment.command';
import RecordSalePaymentValidator from 'src/application/sale/commands/record-payment/record-payment.validator';
import CancelSaleCommand from 'src/application/sale/commands/cancel-sale/cancel-sale.command';
import UpdateSaleCommand from 'src/application/sale/commands/update-sale/update-sale.command';
import UpdateSaleValidator from 'src/application/sale/commands/update-sale/update-sale.validator';
import SaleQuery from 'src/application/sale/queries/sale.query';
import type { SaleFilters } from 'src/application/sale/queries/sale.filters';
import SaleSerialiser from 'src/presentation/serialisers/sale.serialiser';

@Controller('sales')
@UseGuards(JwtAuthGuard)
class SaleController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly saleQuery: SaleQuery,
    private readonly saleSerialiser: SaleSerialiser,
    private readonly branchScope: BranchScope,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequirePermission(Permission.SALE_CREATE)
  async create(
    @Body() dto: CreateSaleValidator,
    @Actor() actor: Staff,
  ) {
    const command = new CreateSaleCommand(
      dto.branchId,
      actor.getId()!,
      dto.paymentMethod,
      dto.lineItems,
      dto.customerId ?? null,
      dto.discountAmount ?? 0,
      dto.notes ?? null,
    );

    const sale = await this.commandBus.execute(command);

    return await this.saleSerialiser.serialise(sale);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @RequirePermission(Permission.SALE_READ)
  async findAll(@Query() filters: SaleFilters, @Actor() actor: Staff) {
    const branchId = await this.branchScope.resolve(
      actor,
      filters.branchId ? Number(filters.branchId) : undefined,
    );

    const result = await this.saleQuery.findBy({
      ...filters,
      branchId,
      take: filters.take ? Number(filters.take) : 10,
      skip: filters.skip ? Number(filters.skip) : 0,
    });

    return this.saleSerialiser.serialiseListResponse(result.data, result.total);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @RequirePermission(Permission.SALE_READ)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const sale = await this.saleQuery.findById(id);

    if (!sale) {
      throw new NotFoundException(`Sale with id ${id} not found`);
    }

    return this.saleSerialiser.serialise(sale);
  }

  @Post(':id/payments')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermission(Permission.PAYMENT_RECORD)
  async recordPayment(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RecordSalePaymentValidator,
    @Actor() actor: Staff,
  ) {
    const command = new RecordSalePaymentCommand(
      id,
      dto.amount,
      dto.paymentMethod,
      actor.getId()!,
      dto.reference ?? null,
      dto.notes ?? null,
    );

    const payment = await this.commandBus.execute(command);

    return this.saleSerialiser.serialisePayment(payment);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @RequirePermission(Permission.SALE_UPDATE)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSaleValidator,
  ) {
    const command = new UpdateSaleCommand(
      id,
      dto.notes,
      dto.paymentMethod,
      dto.status,
    );

    const sale = await this.commandBus.execute(command);

    return this.saleSerialiser.serialise(sale);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @RequirePermission(Permission.SALE_CANCEL)
  async cancel(@Param('id', ParseIntPipe) id: number, @Actor() actor: Staff) {
    const command = new CancelSaleCommand(id, actor.getId()!);

    const sale = await this.commandBus.execute(command);

    return this.saleSerialiser.serialise(sale);
  }
}

export default SaleController;
