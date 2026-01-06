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
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import InventoryQuery from 'src/application/inventory/queries/inventory.query';
import InventorySerialiser from 'src/presentation/serialisers/inventory.serialiser';
import SetReorderLevelsCommand from 'src/application/inventory/commands/inventory/set-reorder-levels/set-reorder-levels.command';
import SetReorderLevelsValidator from 'src/application/inventory/commands/inventory/set-reorder-levels/set-reorder-levels.validator';
import JwtAuthGuard from 'src/modules/auth/guards/jwt-auth.guard';

@Controller('inventory')
// @UseGuards(JwtAuthGuard)
class InventoryController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly inventoryQuery: InventoryQuery,
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
}

export default InventoryController;
