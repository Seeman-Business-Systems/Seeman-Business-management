import { IsInt, IsPositive } from 'class-validator';

class TransferStaffValidator {
  @IsInt()
  @IsPositive()
  branchId: number;
}

export default TransferStaffValidator;
