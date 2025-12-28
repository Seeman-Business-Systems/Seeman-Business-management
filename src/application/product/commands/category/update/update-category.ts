import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import UpdateCategoryCommand from './update-category.command';
import Category from 'src/domain/product/category';
import CategoryRepository from 'src/infrastructure/database/repositories/product/category.repository';

@CommandHandler(UpdateCategoryCommand)
class UpdateCategory implements ICommandHandler<UpdateCategoryCommand> {
  constructor(private categories: CategoryRepository) {}

  async execute(command: UpdateCategoryCommand): Promise<Category> {
    const category = await this.categories.findById(command.id);
    if (!category) {
      throw new Error(`Category with id ${command.id} not found`);
    }

    if (command.name !== undefined) {
      category.setName(command.name);
    }

    if (command.description !== undefined) {
      category.setDescription(command.description);
    }

    if (command.parentId !== undefined) {
      category.setParentId(command.parentId);
    }

    category.setUpdatedAt(new Date());

    return await this.categories.commit(category);
  }
}

export default UpdateCategory;
