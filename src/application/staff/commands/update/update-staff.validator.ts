import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

class UpdateStaffValidator {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  middleName?: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^\+?\d{10,15}$/, {
    message: 'Phone number must be 10-15 digits',
  })
  phoneNumber: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsInt()
  roleId: number;

  @IsNotEmpty()
  @IsInt()
  branchId: number;

  @IsOptional()
  joinedAt?: Date;
}

export default UpdateStaffValidator;
