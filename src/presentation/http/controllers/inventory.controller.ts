import { Controller, HttpCode, HttpStatus, Get, Post, Put, Body, Query, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import InventoryQuery from 'src/application/inventory/queries/inventory.query';
import InventorySerialiser from 'src/presentation/serialisers/inventory.serialiser';
import SetReorderLevelsCommand from 'src/application/inventory/commands/inventory/set-reorder-levels/set-reorder-levels.command';
import SetReorderLevelsValidator from 'src/application/inventory/commands/inventory/set-reorder-levels/set-reorder-levels.validator';
import AddStockValidator from 'src/application/inventory/commands/inventory/add-stock/add-stock.validator';
import AddStockCommand from 'src/application/inventory/commands/inventory/add-stock/add-stock.command';
import AdjustInventoryValidator from 'src/application/inventory/commands/inventory/adjust-inventory/adjust-inventory.validator';
import AdjustInventoryCommand from 'src/application/inventory/commands/inventory/adjust-inventory/adjust-inventory.command';
import JwtAuthGuard from 'src/modules/auth/guards/jwt-auth.guard';
import { RequirePermission } from 'src/modules/auth/decorators/role-guard.decorator';
import { Permission } from 'src/domain/permission/permission';
import Actor from 'src/modules/auth/decorators/actor.decorator';
import Staff from 'src/domain/staff/staff';
import type { InventoryFilters } from 'src/application/inventory/queries/inventory.filters';

@Controller('inventory')
@UseGuards(JwtAuthGuard)
class InventoryController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly inventoryQuery: InventoryQuery,
    private readonly inventorySerialiser: InventorySerialiser,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @RequirePermission(Permission.INVENTORY_READ)
  async findAll(@Query() filters: InventoryFilters) {
    const inventory = await this.inventoryQuery.findBy({
      variantId: filters.variantId ? Number(filters.variantId) : undefined,
      warehouseId: filters.warehouseId ? Number(filters.warehouseId) : undefined,
      lowInventory: String(filters.lowInventory) === 'true',
    });
    return this.inventorySerialiser.serialiseMany(inventory);
  }

  @Post('add-stock')
  @HttpCode(HttpStatus.OK)
  @RequirePermission(Permission.INVENTORY_ADJUST)
  async addStock(@Body() dto: AddStockValidator, @Actor() actor: Staff) {
    const inventory = await this.commandBus.execute(
      new AddStockCommand(
        dto.variantId,
        dto.warehouseId,
        dto.quantity,
        dto.notes ?? null,
        actor.getId()!,
      ),
    );
    return this.inventorySerialiser.serialise(inventory);
  }

  @Put('reorder-levels')
  @HttpCode(HttpStatus.OK)
  @RequirePermission(Permission.INVENTORY_ADJUST)
  async setReorderLevels(@Body() dto: SetReorderLevelsValidator) {
    const inventory = await this.commandBus.execute(
      new SetReorderLevelsCommand(
        dto.variantId,
        dto.warehouseId,
        dto.minimumQuantity,
        dto.maximumQuantity ?? null,
      ),
    );
    return this.inventorySerialiser.serialise(inventory);
  }

  @Put('adjust')
  @HttpCode(HttpStatus.OK)
  @RequirePermission(Permission.INVENTORY_ADJUST)
  async adjustInventory(@Body() dto: AdjustInventoryValidator, @Actor() actor: Staff) {
    const inventory = await this.commandBus.execute(
      new AdjustInventoryCommand(
        dto.variantId,
        dto.warehouseId,
        dto.adjustmentQuantity,
        dto.notes,
        actor.getId()!,
      ),
    );
    return this.inventorySerialiser.serialise(inventory);
  }
}

export default InventoryController;
