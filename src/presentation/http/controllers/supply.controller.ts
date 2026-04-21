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
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { IsOptional, IsString } from 'class-validator';
import JwtAuthGuard from 'src/modules/auth/guards/jwt-auth.guard';
import Actor from 'src/modules/auth/decorators/actor.decorator';
import Staff from 'src/domain/staff/staff';
import SupplyQuery from 'src/application/supply/queries/supply.query';
import SupplySerialiser from 'src/presentation/serialisers/supply.serialiser';
import type SupplyFilters from 'src/application/supply/queries/supply.filters';
import FulfilSupplyCommand from 'src/application/supply/commands/fulfil-supply/fulfil-supply.command';
import CancelSupplyCommand from 'src/application/supply/commands/cancel-supply/cancel-supply.command';

class FulfilSupplyDto {
  @IsOptional()
  @IsString()
  notes?: string;
}

@Controller('supplies')
@UseGuards(JwtAuthGuard)
class SupplyController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly supplyQuery: SupplyQuery,
    private readonly serialiser: SupplySerialiser,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
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
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const supply = await this.supplyQuery.findById(id);

    if (!supply) {
      throw new NotFoundException(`Supply with id ${id} not found`);
    }

    return this.serialiser.serialise(supply);
  }

  @Patch(':id/fulfil')
  @HttpCode(HttpStatus.OK)
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

  @Patch(':id/cancel')
  @HttpCode(HttpStatus.OK)
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
