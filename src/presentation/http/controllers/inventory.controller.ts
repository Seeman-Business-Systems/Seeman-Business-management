import {
  Controller,
  HttpCode,
  HttpStatus,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Body,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import InventoryQuery from 'src/application/inventory/queries/inventory.query';
import InventoryBatchQuery from 'src/application/inventory/queries/inventory-batch.query';
import InventorySerialiser from 'src/presentation/serialisers/inventory.serialiser';
import SetReorderLevelsCommand from 'src/application/inventory/commands/inventory/set-reorder-levels/set-reorder-levels.command';
import SetReorderLevelsValidator from 'src/application/inventory/commands/inventory/set-reorder-levels/set-reorder-levels.validator';
import AdjustBatchCommand from 'src/application/inventory/commands/inventory-batch/adjust/adjust-batch.command';
import AdjustInventoryValidator from 'src/application/inventory/commands/inventory/adjust-inventory/adjust-inventory.validator';
import JwtAuthGuard from 'src/modules/auth/guards/jwt-auth.guard';

@Controller('inventory')
@UseGuards(JwtAuthGuard)
class InventoryController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly inventoryQuery: InventoryQuery,
    private readonly inventoryBatchQuery: InventoryBatchQuery,
    private readonly inventorySerialiser: InventorySerialiser,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query('variantId') variantId?: string,
    @Query('warehouseId') warehouseId?: string,
    @Query('lowInventory') lowInventory?: string,
    @Query('includeVariant') includeVariant?: string,
    @Query('includeWarehouse') includeWarehouse?: string,
    @Query('includeBatches') includeBatches?: string,
  ) {
    const inventories = await this.inventoryQuery.findBy({
      variantId: variantId ? parseInt(variantId) : undefined,
      warehouseId: warehouseId ? parseInt(warehouseId) : undefined,
      lowInventory: lowInventory === 'true',
      includeVariant: includeVariant === 'true',
      includeWarehouse: includeWarehouse === 'true',
      includeBatches: includeBatches === 'true',
    });

    return await this.inventorySerialiser.serialiseMany(inventories);
  }

  @Get('low-inventory')
  @HttpCode(HttpStatus.OK)
  async getLowInventory(@Query('warehouseId') warehouseId?: string) {
    const inventories = await this.inventoryQuery.getLowInventoryItems(
      warehouseId ? parseInt(warehouseId) : undefined,
    );

    return await this.inventorySerialiser.serialiseMany(inventories);
  }

  @Get('variants/:variantId/summary')
  @HttpCode(HttpStatus.OK)
  async getInventorySummary(
    @Param('variantId', ParseIntPipe) variantId: number,
  ) {
    const summary = await this.inventoryQuery.getInventorySummary(variantId);

    return {
      totalQuantity: summary.totalQuantity,
      totalReserved: summary.totalReserved,
      totalAvailable: summary.totalAvailable,
      warehouses: await this.inventorySerialiser.serialiseMany(
        summary.warehouses,
      ),
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findById(@Param('id', ParseIntPipe) id: number) {
    const inventories = await this.inventoryQuery.findBy({ ids: id });

    if (inventories.length === 0) {
      throw new Error(`Inventory with id ${id} not found`);
    }

    return await this.inventorySerialiser.serialise(inventories[0]);
  }

  @Put('reorder-levels')
  @HttpCode(HttpStatus.OK)
  async setReorderLevels(@Body() dto: SetReorderLevelsValidator) {
    const command = new SetReorderLevelsCommand(
      dto.variantId,
      dto.warehouseId,
      dto.minimumQuantity,
      dto.maximumQuantity ?? null,
    );

    const inventory = await this.commandBus.execute(command);
    return await this.inventorySerialiser.serialise(inventory);
  }

  @Put('adjust')
  @HttpCode(HttpStatus.OK)
  async adjustInventory(@Body() dto: AdjustInventoryValidator) {
    // Find inventory record for this variant + warehouse
    const inventories = await this.inventoryQuery.findBy({
      variantId: dto.variantId,
      warehouseId: dto.warehouseId,
    });

    if (inventories.length === 0) {
      throw new BadRequestException(
        'No inventory record found for this variant and warehouse.',
      );
    }

    const inventory = inventories[0];

    // Find batches for this inventory
    const batches = await this.inventoryBatchQuery.findBy({
      inventoryId: inventory.getId(),
    });

    if (batches.length === 0) {
      throw new BadRequestException(
        'No stock batches found. Add stock first before making adjustments.',
      );
    }

    // For decrements, pick the batch with the highest currentQuantity.
    // For increments, pick any batch (first one).
    const batch =
      dto.adjustmentQuantity < 0
        ? batches.reduce((best, b) =>
            b.getCurrentQuantity() > best.getCurrentQuantity() ? b : best,
          )
        : batches[0];

    await this.commandBus.execute(
      new AdjustBatchCommand(batch.getId()!, dto.adjustmentQuantity, dto.notes, 1),
    );

    // Return updated inventory
    const updated = await this.inventoryQuery.findBy({
      variantId: dto.variantId,
      warehouseId: dto.warehouseId,
    });

    return await this.inventorySerialiser.serialise(updated[0]);
  }
}

export default InventoryController;
