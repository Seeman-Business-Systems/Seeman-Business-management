import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

class RegisterStaffValidator {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsNotEmpty()
  roleId: number;

  @IsNotEmpty()
  branchId: number;

  @IsString()
  @IsOptional()
  middleName: string;

  @IsString()
  @IsOptional()
  email: string;

  @IsOptional()
  joinedAt: Date;
}

export default RegisterStaffValidator;
