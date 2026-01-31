import {
  Controller,
  HttpCode,
  HttpStatus,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Body,
  Post,
  Query,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import ReserveInventoryCommand from 'src/application/inventory/commands/inventory/reserve-inventory/reserve-inventory.command';
import ReserveInventoryValidator from 'src/application/inventory/commands/inventory/reserve-inventory/reserve-inventory.validator';
import CancelReservationCommand from 'src/application/inventory/commands/inventory-reservation/cancel-reservation/cancel-reservation.command';
import FulfillReservationCommand from 'src/application/inventory/commands/inventory-reservation/fulfill-reservation/fulfill-reservation.command';
import UpdateReservationCommand from 'src/application/inventory/commands/inventory-reservation/update-reservation/update-reservation.command';
import UpdateReservationValidator from 'src/application/inventory/commands/inventory-reservation/update-reservation/update-reservation.validator';
import InventoryReservationQuery from 'src/application/inventory/queries/inventory-reservation.query';
import InventoryReservationRepository from 'src/infrastructure/database/repositories/inventory/inventory-reservation.repository';
import InventoryReservationSerialiser from 'src/presentation/serialisers/inventory-reservation.serialiser';

@Controller('inventory-reservations')
class InventoryReservationController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly reservationQuery: InventoryReservationQuery,
    private readonly reservationSerialiser: InventoryReservationSerialiser,
    private readonly inventoryReservations: InventoryReservationRepository,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query('orderId') orderId?: string,
    @Query('customerId') customerId?: string,
    @Query('variantId') variantId?: string,
    @Query('warehouseId') warehouseId?: string,
    @Query('status') status?: string,
    @Query('reservedBy') reservedBy?: string,
    @Query('isActive') isActive?: string,
    @Query('isExpired') isExpired?: string,
    @Query('includeVariant') includeVariant?: string,
    @Query('includeWarehouse') includeWarehouse?: string,
    @Query('includeReservedByStaff') includeReservedByStaff?: string,
  ) {
    const reservations = await this.reservationQuery.findBy({
      orderId: orderId ? parseInt(orderId) : undefined,
      customerId: customerId ? parseInt(customerId) : undefined,
      variantId: variantId ? parseInt(variantId) : undefined,
      warehouseId: warehouseId ? parseInt(warehouseId) : undefined,
      status: status ? parseInt(status) : undefined,
      reservedBy: reservedBy ? parseInt(reservedBy) : undefined,
      isActive:
        isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      isExpired:
        isExpired === 'true' ? true : isExpired === 'false' ? false : undefined,
      includeVariant: includeVariant === 'true',
      includeWarehouse: includeWarehouse === 'true',
      includeReservedByStaff: includeReservedByStaff === 'true',
    });

    return await this.reservationSerialiser.serialiseMany(reservations);
  }

  @Get('active')
  @HttpCode(HttpStatus.OK)
  async findActive() {
    const reservations =
      await this.inventoryReservations.findActiveReservations();
    return this.reservationSerialiser.serialiseMany(reservations);
  }

  @Get('expired')
  @HttpCode(HttpStatus.OK)
  async findExpired() {
    const reservations =
      await this.inventoryReservations.findExpiredReservations();
    return this.reservationSerialiser.serialiseMany(reservations);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findById(@Param('id', ParseIntPipe) id: number) {
    const reservation = await this.inventoryReservations.findById(id);

    if (!reservation) {
      throw new Error(`Reservation with id ${id} not found`);
    }

    return await this.reservationSerialiser.serialise(reservation);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: ReserveInventoryValidator) {
    const command = new ReserveInventoryCommand(
      dto.variantId,
      dto.warehouseId,
      dto.quantity,
      dto.orderId ?? null,
      dto.customerId ?? null,
      dto.reservedBy,
      dto.expiresAt ? new Date(dto.expiresAt) : null,
      dto.notes ?? null,
    );

    const reservation = await this.commandBus.execute(command);
    return await this.reservationSerialiser.serialise(reservation);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  async cancelReservation(@Param('id', ParseIntPipe) id: number) {
    const command = new CancelReservationCommand(id);
    const reservation = await this.commandBus.execute(command);
    return await this.reservationSerialiser.serialise(reservation);
  }

  @Post(':id/fulfill')
  @HttpCode(HttpStatus.OK)
  async fulfillReservation(@Param('id', ParseIntPipe) id: number) {
    const command = new FulfillReservationCommand(id);
    const reservation = await this.commandBus.execute(command);
    return await this.reservationSerialiser.serialise(reservation);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateReservation(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReservationValidator,
  ) {
    const command = new UpdateReservationCommand(
      id,
      dto.quantity,
      dto.orderId,
      dto.customerId,
      dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      dto.notes,
    );
    const reservation = await this.commandBus.execute(command);
    return await this.reservationSerialiser.serialise(reservation);
  }
}

export default InventoryReservationController;
