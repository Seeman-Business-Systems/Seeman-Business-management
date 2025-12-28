import { IsString, IsOptional, Length } from 'class-validator';

class UpdateBrandValidator {
  @IsOptional()
  @IsString()
  @Length(2, 100, { message: 'Brand name must be between 2 and 100 characters' })
  name?: string;

  @IsOptional()
  @IsString()
  description?: string | null;
}

export default UpdateBrandValidator;