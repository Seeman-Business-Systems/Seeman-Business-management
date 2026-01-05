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
import StockReservationQuery from 'src/application/inventory/queries/stock-reservation.query';
import StockReservationSerialiser from 'src/presentation/serialisers/stock-reservation.serialiser';
import FulfillReservationCommand from 'src/application/inventory/commands/stock-reservation/fulfill-reservation/fulfill-reservation.command';
import UpdateReservationCommand from 'src/application/inventory/commands/stock-reservation/update-reservation/update-reservation.command';
import UpdateReservationValidator from 'src/application/inventory/commands/stock-reservation/update-reservation/update-reservation.validator';
import ReserveStockCommand from 'src/application/inventory/commands/inventory/reserve-stock/reserve-stock.command';
import ReserveStockValidator from 'src/application/inventory/commands/inventory/reserve-stock/reserve-stock.validator';
import StockReservationRepository from 'src/infrastructure/database/repositories/inventory/stock-reservation.repository';
import CancelReservationCommand from 'src/application/inventory/commands/stock-reservation/cancel-reservation/cancel-reservation.command';

@Controller('stock-reservations')
class StockReservationController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly reservationQuery: StockReservationQuery,
    private readonly reservationSerialiser: StockReservationSerialiser,
    private readonly stockReservations: StockReservationRepository,
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
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      isExpired: isExpired === 'true' ? true : isExpired === 'false' ? false : undefined,
      includeVariant: includeVariant === 'true',
      includeWarehouse: includeWarehouse === 'true',
      includeReservedByStaff: includeReservedByStaff === 'true',
    });

    return await this.reservationSerialiser.serialiseMany(reservations);
  }

  @Get('active')
  @HttpCode(HttpStatus.OK)
  async findActive() {
    const reservations = await this.stockReservations.findActiveReservations();
    return this.reservationSerialiser.serialiseMany(reservations);
  }

  @Get('expired')
  @HttpCode(HttpStatus.OK)
  async findExpired() {
    const reservations = await this.stockReservations.findExpiredReservations();
    return this.reservationSerialiser.serialiseMany(reservations);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findById(@Param('id', ParseIntPipe) id: number) {
    const reservation = await this.stockReservations.findById(id);

    if (!reservation) {
      throw new Error(`Reservation with id ${id} not found`);
    }

    return await this.reservationSerialiser.serialise(reservation);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: ReserveStockValidator) {
    const command = new ReserveStockCommand(
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

export default StockReservationController;