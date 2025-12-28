import { IsString, IsNotEmpty, IsOptional, Length, IsNumber } from 'class-validator';

class CreateCategoryValidator {
  @IsString()
  @IsNotEmpty({ message: 'Category name is required' })
  @Length(2, 100, { message: 'Category name must be between 2 and 100 characters' })
  name: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsNumber()
  parentId?: number | null;
}

export default CreateCategoryValidator;