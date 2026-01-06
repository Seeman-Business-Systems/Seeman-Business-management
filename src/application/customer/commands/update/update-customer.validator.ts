import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, Min } from "class-validator";
import { Type } from "class-transformer";

class UpdateCustomerValidator {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsOptional()
  email: string;

  @IsString()
  @IsOptional()
  notes: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Invalid phone number format',
  })
  phoneNumber: string;

  @IsString()
  @IsOptional()
  companyName: string;

  @IsString()
  @IsOptional()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Invalid phone number format',
  })
  altPhoneNumber: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'Credit limit must be a number' })
  @Min(0, { message: 'Credit limit cannot be negative' })
  @IsOptional()
  creditLimit: number | null;

  @Type(() => Number)
  @IsNumber({}, { message: 'Outstanding balance must be a number' })
  @Min(0, { message: 'Outstanding balance cannot be negative' })
  @IsOptional()
  outstandingBalance: number | null;
}

export default UpdateCustomerValidator