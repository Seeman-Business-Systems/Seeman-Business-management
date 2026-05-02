import { Controller, HttpCode, HttpStatus, Get, Post, Delete, Body, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import JwtAuthGuard from 'src/modules/auth/guards/jwt-auth.guard';
import { RequirePermission } from 'src/modules/auth/decorators/role-guard.decorator';
import { Permission } from 'src/domain/permission/permission';
import Actor from 'src/modules/auth/decorators/actor.decorator';
import Staff from 'src/domain/staff/staff';
import InventoryBatchRepository from 'src/infrastructure/database/repositories/inventory/inventory-batch.repository';
import InventoryBatchSerialiser from 'src/presentation/serialisers/inventory-batch.serialiser';
import CreateBatchCommand from 'src/application/inventory/commands/batch/create-batch.command';
import AddBatchItemCommand from 'src/application/inventory/commands/batch/add-batch-item.command';
import RemoveBatchItemCommand from 'src/application/inventory/commands/batch/remove-batch-item.command';
import OffloadBatchCommand from 'src/application/inventory/commands/batch/offload-batch.command';
import CreateBatchValidator from 'src/application/inventory/validators/create-batch.validator';
import AddBatchItemValidator from 'src/application/inventory/validators/add-batch-item.validator';
import { NotFoundException } from '@nestjs/common';

@Controller('inventory-batches')
@UseGuards(JwtAuthGuard)
class InventoryBatchController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly batchRepo: InventoryBatchRepository,
    private readonly batchSerialiser: InventoryBatchSerialiser,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @RequirePermission(Permission.INVENTORY_READ)
  async findAll(@Query('offloaded') offloaded?: string) {
    const off = offloaded === 'true' ? true : offloaded === 'false' ? false : undefined;
    const batches = await this.batchRepo.findAll(off);
    return this.batchSerialiser.serialiseMany(batches);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @RequirePermission(Permission.INVENTORY_READ)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const batch = await this.batchRepo.findById(id);
    if (!batch) throw new NotFoundException('Container not found');
    return this.batchSerialiser.serialise(batch, true);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequirePermission(Permission.INVENTORY_ADJUST)
  async create(@Body() dto: CreateBatchValidator, @Actor() actor: Staff) {
    const batch = await this.commandBus.execute(
      new CreateBatchCommand(
        dto.batchNumber,
        new Date(dto.arrivedAt),
        dto.notes ?? null,
        actor.getId()!,
        dto.items ?? [],
      ),
    );
    return this.batchSerialiser.serialise(batch, true);
  }

  @Post(':id/items')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermission(Permission.INVENTORY_ADJUST)
  async addItem(@Param('id', ParseIntPipe) id: number, @Body() dto: AddBatchItemValidator) {
    const item = await this.commandBus.execute(new AddBatchItemCommand(id, dto.variantId, dto.warehouseId, dto.quantity));
    return this.batchSerialiser.serialiseItem(item);
  }

  @Delete(':id/items/:itemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermission(Permission.INVENTORY_ADJUST)
  async removeItem(@Param('id', ParseIntPipe) id: number, @Param('itemId', ParseIntPipe) itemId: number) {
    await this.commandBus.execute(new RemoveBatchItemCommand(id, itemId));
  }

  @Post(':id/offload')
  @HttpCode(HttpStatus.OK)
  @RequirePermission(Permission.INVENTORY_ADJUST)
  async offload(@Param('id', ParseIntPipe) id: number, @Actor() actor: Staff) {
    const batch = await this.commandBus.execute(new OffloadBatchCommand(id, actor.getId()!));
    return this.batchSerialiser.serialise(batch, true);
  }
}

export default InventoryBatchController;
