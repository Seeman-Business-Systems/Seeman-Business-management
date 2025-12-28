import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import UpdateBrandCommand from './update-brand.command';
import Brand from 'src/domain/product/brand';
import BrandRepository from 'src/infrastructure/database/repositories/product/brand.repository';

@CommandHandler(UpdateBrandCommand)
class UpdateBrand implements ICommandHandler<UpdateBrandCommand> {
  constructor(private brands: BrandRepository) {}

  async execute(command: UpdateBrandCommand): Promise<Brand> {
    const brand = await this.brands.findById(command.id);
    if (!brand) {
      throw new Error(`Brand with id ${command.id} not found`);
    }

    if (command.name !== undefined) {
      brand.setName(command.name);
      brand.setCode(Brand.makeCode(command.name));
    }

    if (command.description !== undefined) {
      brand.setDescription(command.description);
    }

    brand.setUpdatedAt(new Date());

    return await this.brands.commit(brand);
  }
}

export default UpdateBrand;
