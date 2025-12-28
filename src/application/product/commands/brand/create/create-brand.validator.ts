import { IsString, IsNotEmpty, IsOptional, Length } from 'class-validator';

class CreateBrandValidator {
  @IsString()
  @IsNotEmpty({ message: 'Brand name is required' })
  @Length(2, 100, { message: 'Brand name must be between 2 and 100 characters' })
  name: string;

  @IsOptional()
  @IsString()
  description?: string | null;
}

export default CreateBrandValidator;