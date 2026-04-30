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
  Get,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import CreateBrandCommand from 'src/application/product/commands/brand/create/create-brand.command';
import CreateBrandValidator from 'src/application/product/commands/brand/create/create-brand.validator';
import UpdateBrandCommand from 'src/application/product/commands/brand/update/update-brand.command';
import UpdateBrandValidator from 'src/application/product/commands/brand/update/update-brand.validator';
import DeleteBrandCommand from 'src/application/product/commands/brand/delete/delete-brand.command';
import Actor from 'src/modules/auth/decorators/actor.decorator';
import Staff from 'src/domain/staff/staff';
import { ActorType } from 'src/domain/common/actor-type';
import BrandRepository from 'src/infrastructure/database/repositories/product/brand.repository';
import BrandSerialiser from 'src/presentation/serialisers/brand.serialiser';
import JwtAuthGuard from 'src/modules/auth/guards/jwt-auth.guard';
import { RequirePermission } from 'src/modules/auth/decorators/role-guard.decorator';
import { Permission } from 'src/domain/permission/permission';

@Controller('brands')
@UseGuards(JwtAuthGuard)
class BrandController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly brands: BrandRepository,
    private readonly brandSerialiser: BrandSerialiser,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequirePermission(Permission.BRAND_MANAGE)
  async create(
    @Body() dto: CreateBrandValidator,
    @Actor() actor: Staff,
  ) {
    const command = new CreateBrandCommand(
      dto.name,
      dto.description ?? null,
      actor?.getId() ?? ActorType.SYSTEM_ACTOR,
    );

    const brand = await this.commandBus.execute(command);
    return await this.brandSerialiser.serialise(brand);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @RequirePermission(Permission.BRAND_MANAGE)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBrandValidator,
  ) {
    const command = new UpdateBrandCommand(id, dto.name, dto.description);

    const brand = await this.commandBus.execute(command);
    return await this.brandSerialiser.serialise(brand);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermission(Permission.BRAND_MANAGE)
  async delete(@Param('id', ParseIntPipe) id: number) {
    const command = new DeleteBrandCommand(id);
    await this.commandBus.execute(command);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @RequirePermission(Permission.BRAND_MANAGE)
  async findById(@Param('id', ParseIntPipe) id: number) {
    const brand = await this.brands.findById(id);
    if (!brand) {
      throw new Error(`Brand with id ${id} not found`);
    }
    return await this.brandSerialiser.serialise(brand);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @RequirePermission(Permission.BRAND_MANAGE)
  async findAll() {
    const brands = await this.brands.findAll();
    return await this.brandSerialiser.serialiseMany(brands);
  }
}

export default BrandController;
