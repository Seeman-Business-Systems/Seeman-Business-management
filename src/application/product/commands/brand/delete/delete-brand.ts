import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import DeleteBrandCommand from './delete-brand.command';
import BrandRepository from 'src/infrastructure/database/repositories/product/brand.repository';

@CommandHandler(DeleteBrandCommand)
class DeleteBrand implements ICommandHandler<DeleteBrandCommand> {
  constructor(private brands: BrandRepository) {}

  async execute(command: DeleteBrandCommand): Promise<void> {
    await this.brands.delete(command.id);
  }
}

export default DeleteBrand;
