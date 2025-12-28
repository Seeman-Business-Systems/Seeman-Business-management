import { Command } from '@nestjs/cqrs';
import Category from 'src/domain/product/category';

class CreateCategoryCommand extends Command<Category> {
  constructor(
    public readonly name: string,
    public readonly description: string | null,
    public readonly createdBy: number,
    public readonly parentId?: number | null,
  ) {
    super();
  }
}

export default CreateCategoryCommand;
