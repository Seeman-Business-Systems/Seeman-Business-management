import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import DeleteCategoryCommand from './delete-category.command';
import CategoryRepository from 'src/infrastructure/database/repositories/product/category.repository';

@CommandHandler(DeleteCategoryCommand)
class DeleteCategory implements ICommandHandler<DeleteCategoryCommand> {
  constructor(private categories: CategoryRepository) {}

  async execute(command: DeleteCategoryCommand): Promise<void> {
    await this.categories.delete(command.id);
  }
}

export default DeleteCategory;
