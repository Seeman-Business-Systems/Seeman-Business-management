import { Command } from '@nestjs/cqrs';
import Brand from 'src/domain/product/brand';

class CreateBrandCommand extends Command<Brand> {
  constructor(
    public readonly name: string,
    public readonly description: string | null,
    public readonly createdBy: number,
  ) {
    super();
  }
}

export default CreateBrandCommand;
