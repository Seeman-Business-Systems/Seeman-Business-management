import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import CreateCategoryCommand from './create-category.command';
import Category from 'src/domain/product/category';
import CategoryRepository from 'src/infrastructure/database/repositories/product/category.repository';

@CommandHandler(CreateCategoryCommand)
class CreateCategory implements ICommandHandler<CreateCategoryCommand> {
  constructor(private categories: CategoryRepository) {}

  async execute(command: CreateCategoryCommand): Promise<Category> {
    const category = new Category(
      undefined,
      command.name,
      command.description,
      command.parentId ?? null,
      command.createdBy,
      new Date(),
      new Date(),
    );

    return await this.categories.commit(category);
  }
}

export default CreateCategory;
