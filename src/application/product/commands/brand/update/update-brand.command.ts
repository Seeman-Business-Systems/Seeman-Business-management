import { Command } from '@nestjs/cqrs';
import Brand from 'src/domain/product/brand';

class UpdateBrandCommand extends Command<Brand> {
  constructor(
    public readonly id: number,
    public readonly name?: string,
    public readonly description?: string | null,
  ) {
    super();
  }
}

export default UpdateBrandCommand;
