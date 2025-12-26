import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  IsNumber,
  Length,
  Matches,
  IsEnum,
} from 'class-validator';
import BranchStatus from '../../../../domain/branch/branch-status';

class CreateBranchValidator {
  @IsString()
  @IsNotEmpty({ message: 'Branch name is required' })
  @Length(2, 100, {
    message: 'Branch name must be between 2 and 100 characters',
  })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Address is required' })
  address: string;

  @IsString()
  @IsNotEmpty({ message: 'City is required' })
  city: string;

  @IsString()
  @IsNotEmpty({ message: 'State is required' })
  state: string;

  @IsEnum(BranchStatus, { message: 'Invalid status' })
  status?: BranchStatus;

  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  @Matches(/^[0-9+\-\s()]+$/, { message: 'Invalid phone number format' })
  phoneNumber: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9+\-\s()]+$/, { message: 'Invalid phone number format' })
  altPhoneNumber?: string;

  @IsOptional()
  @IsString()
  @Length(3, 6, { message: 'Branch code must be between 3 and 6 characters' })
  code?: string;

  @IsNumber()
  @IsNotEmpty({ message: 'Manager ID is required' })
  managerId: number;

  @IsBoolean()
  isHeadOffice?: boolean;
}

export default CreateBranchValidator;
