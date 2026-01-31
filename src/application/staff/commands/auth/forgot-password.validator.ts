import { IsEmail } from 'class-validator';

class ForgotPasswordValidator {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;
}

export default ForgotPasswordValidator;