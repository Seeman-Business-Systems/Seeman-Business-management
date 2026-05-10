import { IsEnum, IsInt, IsISO8601, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import ExpenseCategory from 'src/domain/expense/expense-category';

class CreateExpenseValidator {
  @Type(() => Number)
  @IsPositive()
  amount: number;

  @IsEnum(ExpenseCategory)
  category: ExpenseCategory;

  @IsString()
  @IsOptional()
  description: string = '';

  @IsInt()
  @IsPositive()
  branchId: number;

  @IsISO8601()
  date: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  @MaxLength(64)
  idempotencyKey?: string;
}

export default CreateExpenseValidator;
