import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Param,
  ParseIntPipe,
  Delete,
  UseGuards,
  Get,
  Query,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import CreateWarehouseCommand from 'src/application/warehouse/commands/create/create-warehouse.command';
import CreateWarehouseValidator from 'src/application/warehouse/commands/create/create-warehouse.validator';
import WarehouseStatus from 'src/domain/warehouse/warehouse-status';
import UpdateWarehouseCommand from 'src/application/warehouse/commands/update/update-warehouse.command';
import UpdateWarehouseValidator from 'src/application/warehouse/commands/update/update-warehouse.validator';
import DeleteWarehouseCommand from 'src/application/warehouse/commands/delete/delete-warehouse.command';
import AssignWarehouseToStaffCommand from 'src/application/warehouse/commands/assign/assign-warehouse-to-staff.command';
import JwtAuthGuard from 'src/modules/auth/guards/jwt-auth.guard';
import Actor from 'src/modules/auth/decorators/actor.decorator';
import Staff from 'src/domain/staff/staff';
import { ActorType } from 'src/domain/common/actor-type';
import WarehouseRepository from 'src/infrastructure/database/repositories/warehouse/warehouse.repository';
import WarehouseQuery from 'src/application/warehouse/queries/warehouse.query';
import type { WarehouseFilters } from 'src/application/warehouse/queries/warehouse.filters';
import WarehouseSerialiser from 'src/presentation/serialisers/warehouse.serialiser';

@Controller('warehouses')
// @UseGuards(JwtAuthGuard)
class WarehouseController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly warehouses: WarehouseRepository,
    private readonly warehouseQuery: WarehouseQuery,
    private readonly warehouseSerialiser: WarehouseSerialiser,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED) 
  async create(
    @Body() dto: CreateWarehouseValidator,
    @Actor() actor: Staff,
  ) {
    const command = new CreateWarehouseCommand(
      dto.name,
      dto.address,
      dto.city,
      dto.state,
      dto.phoneNumber,
      dto.warehouseType,
      dto.status ?? WarehouseStatus.ACTIVE,
      actor.getId()! ?? ActorType.SYSTEM_ACTOR,
      dto.branchId ?? null,
      dto.managerId ?? null,
      dto.capacity ?? null,
    );

    const warehouse = await this.commandBus.execute(command);

    return await this.warehouseSerialiser.serialise(warehouse);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateWarehouseValidator,
  ) {
    const command = new UpdateWarehouseCommand(
      id,
      dto.name,
      dto.address,
      dto.city,
      dto.state,
      dto.phoneNumber,
      dto.warehouseType,
      dto.status,
      dto.branchId ?? null,
      dto.managerId ?? null,
      dto.capacity ?? null,
    );

    const warehouse = await this.commandBus.execute(command);

    return await this.warehouseSerialiser.serialise(warehouse);
  }

  @Post(':id/assign')
  @HttpCode(HttpStatus.OK)
  async assignToStaff(
    @Param('id', ParseIntPipe) warehouseId: number,
    @Body('staffId', ParseIntPipe) staffId: number,
  ) {
    const command = new AssignWarehouseToStaffCommand(warehouseId, staffId);

    const warehouse = await this.commandBus.execute(command);

    return await this.warehouseSerialiser.serialise(warehouse);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    const command = new DeleteWarehouseCommand(id);

    await this.commandBus.execute(command);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const warehouse = await this.warehouses.findById(id);

    if (warehouse) {
      return this.warehouseSerialiser.serialise(warehouse);
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() filters: WarehouseFilters) {
    const warehouses = await this.warehouseQuery.findBy(filters);

    return this.warehouseSerialiser.serialiseMany(warehouses);
  }
}

export default WarehouseController;
