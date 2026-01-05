import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import Actor from 'src/modules/auth/decorators/actor.decorator';
import Staff from 'src/domain/staff/staff';
import { ActorType } from 'src/domain/common/actor-type';
import InventoryBatchQuery from 'src/application/inventory/queries/inventory-batch.query';
import InventoryMovementQuery from 'src/application/inventory/queries/inventory-movement.query';
import InventoryBatchSerialiser from 'src/presentation/serialisers/inventory-batch.serialiser';
import InventoryMovementSerialiser from 'src/presentation/serialisers/inventory-movement.serialiser';
import CreateInventoryBatchCommand from 'src/application/inventory/commands/inventory-batch/create/create-inventory-batch.command';
import CreateInventoryBatchValidator from 'src/application/inventory/commands/inventory-batch/create/create-inventory-batch.validator';
import ReceiveBatchCommand from 'src/application/inventory/commands/inventory-batch/receive/receive-batch.command';
import UpdateBatchStatusCommand from 'src/application/inventory/commands/inventory-batch/update-status/update-batch-status.command';
import UpdateBatchStatusValidator from 'src/application/inventory/commands/inventory-batch/update-status/update-batch-status.validator';
import TransferBatchCommand from 'src/application/inventory/commands/inventory-batch/transfer/transfer-batch.command';
import TransferBatchValidator from 'src/application/inventory/commands/inventory-batch/transfer/transfer-batch.validator';
import AdjustBatchCommand from 'src/application/inventory/commands/inventory-batch/adjust/adjust-batch.command';
import AdjustBatchValidator from 'src/application/inventory/commands/inventory-batch/adjust/adjust-batch.validator';
import DeleteBatchCommand from 'src/application/inventory/commands/inventory-batch/delete/delete-batch.command';
import JwtAuthGuard from 'src/modules/auth/guards/jwt-auth.guard';

@Controller('inventory-batches')
// @UseGuards(JwtAuthGuard)
class InventoryBatchController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly inventoryBatchQuery: InventoryBatchQuery,
    private readonly inventoryMovementQuery: InventoryMovementQuery,
    private readonly inventoryBatchSerialiser: InventoryBatchSerialiser,
    private readonly inventoryMovementSerialiser: InventoryMovementSerialiser,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateInventoryBatchValidator,
    @Actor() actor: Staff,
  ) {
    const command = new CreateInventoryBatchCommand(
      dto.variantId,
      dto.warehouseId,
      dto.batchNumber,
      dto.supplierId,
      dto.quantityReceived,
      dto.costPricePerUnit,
      dto.expiryDate ? new Date(dto.expiryDate) : null,
      actor?.getId() ?? ActorType.SYSTEM_ACTOR,
    );

    const batch = await this.commandBus.execute(command);
    return await this.inventoryBatchSerialiser.serialise(batch);
  }

  @Put(':id/status')
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBatchStatusValidator,
  ) {
    const command = new UpdateBatchStatusCommand(id, dto.status);

    const batch = await this.commandBus.execute(command);
    return await this.inventoryBatchSerialiser.serialise(batch);
  }

  @Post(':id/receive')
  @HttpCode(HttpStatus.OK)
  async receive(@Param('id', ParseIntPipe) id: number, @Actor() actor: Staff) {
    const command = new ReceiveBatchCommand(
      id,
      actor?.getId() ?? ActorType.SYSTEM_ACTOR,
    );

    const batch = await this.commandBus.execute(command);
    return await this.inventoryBatchSerialiser.serialise(batch);
  }

  @Post(':id/transfer')
  @HttpCode(HttpStatus.OK)
  async transfer(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: TransferBatchValidator,
    @Actor() actor: Staff,
  ) {
    const command = new TransferBatchCommand(
      id,
      dto.destinationWarehouseId,
      dto.quantity,
      actor?.getId() ?? ActorType.SYSTEM_ACTOR,
      dto.notes ?? null,
    );

    const batch = await this.commandBus.execute(command);
    return await this.inventoryBatchSerialiser.serialise(batch);
  }

  @Put(':id/adjust')
  @HttpCode(HttpStatus.OK)
  async adjust(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AdjustBatchValidator,
    @Actor() actor: Staff,
  ) {
    const command = new AdjustBatchCommand(
      id,
      dto.adjustmentQuantity,
      dto.notes,
      actor?.getId() ?? ActorType.SYSTEM_ACTOR,
    );

    const batch = await this.commandBus.execute(command);
    return await this.inventoryBatchSerialiser.serialise(batch);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseIntPipe) id: number) {
    const command = new DeleteBatchCommand(id);
    await this.commandBus.execute(command);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findById(
    @Param('id', ParseIntPipe) id: number,
    @Query('includeInventory') includeInventory?: string,
    @Query('includeWarehouse') includeWarehouse?: string,
  ) {
    const batches = await this.inventoryBatchQuery.findBy({
      ids: id,
      includeInventory: includeInventory === 'true',
      includeWarehouse: includeWarehouse === 'true',
    });

    if (batches.length === 0) {
      throw new Error(`Batch with id ${id} not found`);
    }

    return await this.inventoryBatchSerialiser.serialise(batches[0]);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query('variantId') variantId?: string,
    @Query('warehouseId') warehouseId?: string,
    @Query('batchNumber') batchNumber?: string,
    @Query('status') status?: string,
    @Query('supplierId') supplierId?: string,
    @Query('expiringInDays') expiringInDays?: string,
    @Query('includeInventory') includeInventory?: string,
    @Query('includeWarehouse') includeWarehouse?: string,
  ) {
    const batches = await this.inventoryBatchQuery.findBy({
      variantId: variantId ? parseInt(variantId) : undefined,
      warehouseId: warehouseId ? parseInt(warehouseId) : undefined,
      batchNumber,
      status: status ? parseInt(status) : undefined,
      supplierId: supplierId ? parseInt(supplierId) : undefined,
      expiringInDays: expiringInDays ? parseInt(expiringInDays) : undefined,
      includeInventory: includeInventory === 'true',
      includeWarehouse: includeWarehouse === 'true',
    });

    return await this.inventoryBatchSerialiser.serialiseMany(batches);
  }

  @Get(':id/movements')
  @HttpCode(HttpStatus.OK)
  async getMovements(@Param('id', ParseIntPipe) id: number) {
    const movements = await this.inventoryMovementQuery.getMovementHistory(id);
    return await this.inventoryMovementSerialiser.serialiseMany(movements);
  }
}

export default InventoryBatchController;