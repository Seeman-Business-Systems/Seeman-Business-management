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
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import CreateProductCommand from 'src/application/product/commands/product/create/create-product.command';
import CreateProductValidator from 'src/application/product/commands/product/create/create-product.validator';
import UpdateProductCommand from 'src/application/product/commands/product/update/update-product.command';
import UpdateProductValidator from 'src/application/product/commands/product/update/update-product.validator';
import DeleteProductCommand from 'src/application/product/commands/product/delete/delete-product.command';
import CreateProductVariantCommand from 'src/application/product/commands/product-variant/create/create-product-variant.command';
import CreateProductVariantValidator from 'src/application/product/commands/product-variant/create/create-product-variant.validator';
import UpdateProductVariantCommand from 'src/application/product/commands/product-variant/update/update-product-variant.command';
import UpdateProductVariantValidator from 'src/application/product/commands/product-variant/update/update-product-variant.validator';
import DeleteProductVariantCommand from 'src/application/product/commands/product-variant/delete/delete-product-variant.command';
import Actor from 'src/modules/auth/decorators/actor.decorator';
import Staff from 'src/domain/staff/staff';
import { ActorType } from 'src/domain/common/actor-type';
import ProductRepository from 'src/infrastructure/database/repositories/product/product.repository';
import ProductVariantRepository from 'src/infrastructure/database/repositories/product/product-variant.repository';
import ProductQuery, {
  ProductFilters,
} from 'src/application/product/queries/product.query';
import ProductSerialiser from 'src/presentation/serialisers/product.serialiser';
import JwtAuthGuard from 'src/modules/auth/guards/jwt-auth.guard';

@Controller('products')
// @UseGuards(JwtAuthGuard)
class ProductController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly products: ProductRepository,
    private readonly productQuery: ProductQuery,
    private readonly productSerialiser: ProductSerialiser,
    private readonly variants: ProductVariantRepository,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateProductValidator, @Actor() actor: Staff) {
    const command = new CreateProductCommand(
      dto.name,
      dto.description ?? null,
      dto.productType,
      dto.status,
      dto.brandId,
      dto.categoryId,
      actor?.getId() ?? ActorType.SYSTEM_ACTOR,
    );

    const product = await this.commandBus.execute(command);
    return await this.productSerialiser.serialise(product);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductValidator,
  ) {
    const command = new UpdateProductCommand(
      id,
      dto.name,
      dto.description,
      dto.productType,
      dto.status,
      dto.brandId,
      dto.categoryId,
    );

    const product = await this.commandBus.execute(command);
    return await this.productSerialiser.serialise(product);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseIntPipe) id: number) {
    const command = new DeleteProductCommand(id);
    await this.commandBus.execute(command);
  }

  @Post(':id/variants')
  @HttpCode(HttpStatus.CREATED)
  async createVariant(
    @Param('id', ParseIntPipe) productId: number,
    @Body() dto: CreateProductVariantValidator,
    @Actor() actor: Staff,
  ) {
    const product = await this.products.findById(productId);
    if (!product) {
      throw new Error(`Product with id ${productId} not found`);
    }

    const command = new CreateProductVariantCommand(
      productId,
      dto.sku,
      dto.variantName,
      dto.price,
      dto.specifications ?? null,
      actor?.getId() ?? ActorType.SYSTEM_ACTOR,
    );

    const variant = await this.commandBus.execute(command);
    return await this.productSerialiser.serialiseVariant(variant);
  }

  @Put(':productId/variants/:variantId')
  @HttpCode(HttpStatus.OK)
  async updateVariant(
    @Param('productId', ParseIntPipe) productId: number,
    @Param('variantId', ParseIntPipe) variantId: number,
    @Body() dto: UpdateProductVariantValidator,
  ) {
    const product = await this.products.findById(productId);
    if (!product) {
      throw new Error(`Product with id ${productId} not found`);
    }

    const command = new UpdateProductVariantCommand(
      variantId,
      dto.sku,
      dto.variantName,
      dto.price,
      dto.specifications,
    );

    const variant = await this.commandBus.execute(command);
    return await this.productSerialiser.serialiseVariant(variant);
  }

  @Delete(':productId/variants/:variantId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteVariant(
    @Param('productId', ParseIntPipe) productId: number,
    @Param('variantId', ParseIntPipe) variantId: number,
  ) {
    const product = await this.products.findById(productId);
    if (!product) {
      throw new Error(`Product with id ${productId} not found`);
    }

    const command = new DeleteProductVariantCommand(variantId);
    await this.commandBus.execute(command);
  }

  @Get(':id/variants')
  @HttpCode(HttpStatus.OK)
  async getProductVariants(@Param('id', ParseIntPipe) id: number) {
    const product = await this.products.findById(id);
    if (!product) {
      throw new Error(`Product with id ${id} not found`);
    }
    const variants = await this.variants.findByProductId(id);
    return await this.productSerialiser.serialiseVariants(variants);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findById(
    @Param('id', ParseIntPipe) id: number,
    @Query('includeRelations') includeRelations?: string,
  ) {
    const product = await this.products.findById(id);
    if (!product) {
      throw new Error(`Product with id ${id} not found`);
    }
    return await this.productSerialiser.serialise(
      product,
      includeRelations === 'true',
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findBy(
    @Query('ids') ids?: string,
    @Query('name') name?: string,
    @Query('brandId') brandId?: string,
    @Query('categoryId') categoryId?: string,
    @Query('status') status?: string,
    @Query('productType') productType?: string,
    @Query('includeRelations') includeRelations?: string,
  ) {
    const filters: ProductFilters = {
      ids: ids ? ids.split(',').map(Number) : undefined,
      name,
      brandId: brandId ? Number(brandId) : undefined,
      categoryId: categoryId ? Number(categoryId) : undefined,
      status: status ? Number(status) : undefined,
      productType: productType ? Number(productType) : undefined,
      includeBrand: includeRelations === 'true',
      includeCategory: includeRelations === 'true',
    };

    const products = await this.productQuery.findBy(filters);
    return await this.productSerialiser.serialiseMany(
      products,
      includeRelations === 'true',
    );
  }
}

export default ProductController;