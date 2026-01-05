import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches } from "class-validator";

class CreateCustomerValidator {
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
}

export default CreateCustomerValidator