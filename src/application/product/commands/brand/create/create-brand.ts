import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import CreateBrandCommand from './create-brand.command';
import Brand from 'src/domain/product/brand';
import BrandRepository from 'src/infrastructure/database/repositories/product/brand.repository';

@CommandHandler(CreateBrandCommand)
class CreateBrand implements ICommandHandler<CreateBrandCommand> {
  constructor(private brands: BrandRepository) {}

  async execute(command: CreateBrandCommand): Promise<Brand> {
    const code = Brand.makeCode(command.name);

    const brand = new Brand(
      undefined,
      command.name,
      code,
      command.description,
      command.createdBy,
      new Date(),
      new Date(),
    );

    return await this.brands.commit(brand);
  }
}

export default CreateBrand;
