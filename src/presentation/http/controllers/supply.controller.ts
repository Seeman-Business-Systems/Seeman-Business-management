import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { IsNumber, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import JwtAuthGuard from 'src/modules/auth/guards/jwt-auth.guard';
import { RequirePermission } from 'src/modules/auth/decorators/role-guard.decorator';
import { Permission } from 'src/domain/permission/permission';
import Actor from 'src/modules/auth/decorators/actor.decorator';
import Staff from 'src/domain/staff/staff';
import SupplyQuery from 'src/application/supply/queries/supply.query';
import SupplySerialiser from 'src/presentation/serialisers/supply.serialiser';
import SupplyItemDBRepository from 'src/infrastructure/database/repositories/supply/supply-item.db-repository';
import type SupplyFilters from 'src/application/supply/queries/supply.filters';
import FulfilSupplyCommand from 'src/application/supply/commands/fulfil-supply/fulfil-supply.command';
import CancelSupplyCommand from 'src/application/supply/commands/cancel-supply/cancel-supply.command';

class FulfilSupplyDto {
  @IsOptional()
  @IsString()
  notes?: string;
}

class AssignItemWarehouseDto {
  @IsNumber()
  @IsNotEmpty()
  warehouseId: number;
}

@Controller('supplies')
@UseGuards(JwtAuthGuard)
class SupplyController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly supplyQuery: SupplyQuery,
    private readonly serialiser: SupplySerialiser,
    private readonly supplyItemRepo: SupplyItemDBRepository,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @RequirePermission(Permission.SUPPLY_READ)
  async findAll(@Query() filters: SupplyFilters) {
    const result = await this.supplyQuery.findBy({
      ...filters,
      take: filters.take ? Number(filters.take) : 20,
      skip: filters.skip ? Number(filters.skip) : 0,
      branchId: filters.branchId ? Number(filters.branchId) : undefined,
      saleId: filters.saleId ? Number(filters.saleId) : undefined,
      suppliedBy: filters.suppliedBy ? Number(filters.suppliedBy) : undefined,
    });

    return this.serialiser.serialiseListResponse(result.data, result.total);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @RequirePermission(Permission.SUPPLY_READ)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const supply = await this.supplyQuery.findById(id);

    if (!supply) {
      throw new NotFoundException(`Supply with id ${id} not found`);
    }

    return this.serialiser.serialise(supply);
  }

  @Patch(':id/fulfil')
  @HttpCode(HttpStatus.OK)
  @RequirePermission(Permission.SUPPLY_FULFIL)
  async fulfil(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: FulfilSupplyDto,
    @Actor() actor: Staff,
  ) {
    const supply = await this.commandBus.execute(
      new FulfilSupplyCommand(id, actor.getId()!, dto.notes ?? null),
    );
    return this.serialiser.serialise(supply);
  }

  @Patch(':id/items/:itemId/warehouse')
  @HttpCode(HttpStatus.OK)
  @RequirePermission(Permission.SUPPLY_FULFIL)
  async assignItemWarehouse(
    @Param('id', ParseIntPipe) supplyId: number,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() dto: AssignItemWarehouseDto,
  ) {
    const supply = await this.supplyQuery.findById(supplyId);
    if (!supply) throw new NotFoundException(`Supply #${supplyId} not found`);
    if (!supply.isDraft()) throw new BadRequestException('Can only assign warehouse on DRAFT supplies');

    const item = supply.getItems().find((i) => i.getId() === itemId);
    if (!item) throw new NotFoundException(`Item #${itemId} not found on supply #${supplyId}`);

    item.setWarehouseId(dto.warehouseId);
    await this.supplyItemRepo.commitMany([item]);

    const updated = await this.supplyQuery.findById(supplyId);
    return this.serialiser.serialise(updated!);
  }

  @Patch(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @RequirePermission(Permission.SUPPLY_CANCEL)
  async cancel(
    @Param('id', ParseIntPipe) id: number,
    @Actor() actor: Staff,
  ) {
    const supply = await this.commandBus.execute(
      new CancelSupplyCommand(id, actor.getId()!),
    );
    return this.serialiser.serialise(supply);
  }
}

export default SupplyController;
