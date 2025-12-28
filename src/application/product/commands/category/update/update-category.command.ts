import { Command } from '@nestjs/cqrs';
import Category from 'src/domain/product/category';

class UpdateCategoryCommand extends Command<Category> {
  constructor(
    public readonly id: number,
    public readonly name?: string,
    public readonly description?: string | null,
    public readonly parentId?: number | null,
  ) {
    super();
  }
}

export default UpdateCategoryCommand;
