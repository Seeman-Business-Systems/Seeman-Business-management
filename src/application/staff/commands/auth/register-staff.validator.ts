import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

class RegisterStaffValidator {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?\d{10,15}$/, {
    message: 'Phone number must be 10-15 digits',
  })
  phoneNumber: string;

  @IsNotEmpty()
  roleId: number;

  @IsNotEmpty()
  branchId: number;

  @IsString()
  @IsOptional()
  middleName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsOptional()
  joinedAt: Date;
}

export default RegisterStaffValidator;
