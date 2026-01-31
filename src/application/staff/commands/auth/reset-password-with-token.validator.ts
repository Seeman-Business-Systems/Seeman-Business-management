import { IsString, MinLength } from 'class-validator';

class ResetPasswordWithTokenValidator {
  @IsString()
  token: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  newPassword: string;
}

export default ResetPasswordWithTokenValidator;