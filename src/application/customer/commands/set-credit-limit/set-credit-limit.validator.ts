import { IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

class SetCreditLimitValidator {
  @Type(() => Number)
  @IsNumber({}, { message: 'Credit limit must be a number' })
  @Min(0, { message: 'Credit limit cannot be negative' })
  creditLimit: number;
}

export default SetCreditLimitValidator;