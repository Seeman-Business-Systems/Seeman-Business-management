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
  Query,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import CreateCategoryCommand from 'src/application/product/commands/category/create/create-category.command';
import CreateCategoryValidator from 'src/application/product/commands/category/create/create-category.validator';
import UpdateCategoryCommand from 'src/application/product/commands/category/update/update-category.command';
import UpdateCategoryValidator from 'src/application/product/commands/category/update/update-category.validator';
import DeleteCategoryCommand from 'src/application/product/commands/category/delete/delete-category.command';
import Actor from 'src/modules/auth/decorators/actor.decorator';
import Staff from 'src/domain/staff/staff';
import { ActorType } from 'src/domain/common/actor-type';
import CategoryRepository from 'src/infrastructure/database/repositories/product/category.repository';
import CategorySerialiser from 'src/presentation/serialisers/category.serialiser';

@Controller('categories')
class CategoryController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly categories: CategoryRepository,
    private readonly categorySerialiser: CategorySerialiser,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateCategoryValidator,
    @Actor() actor: Staff,
  ) {
    const command = new CreateCategoryCommand(
      dto.name,
      dto.description ?? null,
      actor?.getId() ?? ActorType.SYSTEM_ACTOR,
      dto.parentId ?? null,
    );

    const category = await this.commandBus.execute(command);
    return await this.categorySerialiser.serialise(category);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryValidator,
  ) {
    const command = new UpdateCategoryCommand(
      id,
      dto.name,
      dto.description,
      dto.parentId,
    );

    const category = await this.commandBus.execute(command);
    return await this.categorySerialiser.serialise(category);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseIntPipe) id: number) {
    const command = new DeleteCategoryCommand(id);
    await this.commandBus.execute(command);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findById(
    @Param('id', ParseIntPipe) id: number,
    @Query('includeParent') includeParent?: string,
  ) {
    const category = await this.categories.findById(id);
    if (!category) {
      throw new Error(`Category with id ${id} not found`);
    }
    return await this.categorySerialiser.serialise(
      category,
      includeParent === 'true',
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query('includeParent') includeParent?: string) {
    const categories = await this.categories.findAll();
    return await this.categorySerialiser.serialiseMany(
      categories,
      includeParent === 'true',
    );
  }
}

export default CategoryController;
