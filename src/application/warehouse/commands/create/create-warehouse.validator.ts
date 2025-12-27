import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Length,
  Matches,
  IsEnum,
} from 'class-validator';
import WarehouseStatus from 'src/domain/warehouse/warehouse-status';
import WarehouseType from 'src/domain/warehouse/warehouse-type';

class CreateWarehouseValidator {
  @IsString()
  @IsNotEmpty({ message: 'Warehouse name is required' })
  @Length(2, 100, {
    message: 'Warehouse name must be between 2 and 100 characters',
  })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Address is required' })
  address: string;

  @IsString()
  @IsNotEmpty({ message: 'City is required' })
  city: string;

  @IsString()
  @IsNotEmpty({ message: 'State is required' })
  state: string;

  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  @Matches(/^[0-9+\-\s()]+$/, { message: 'Invalid phone number format' })
  phoneNumber: string;

  @IsEnum(WarehouseType, { message: 'Invalid warehouse type' })
  @IsNotEmpty({ message: 'Warehouse type is required' })
  warehouseType: WarehouseType;

  @IsEnum(WarehouseStatus, { message: 'Invalid status' })
  @IsOptional()
  status?: WarehouseStatus;

  @IsNumber()
  @IsOptional()
  branchId?: number | null;

  @IsNumber()
  @IsOptional()
  managerId?: number | null;

  @IsNumber()
  @IsOptional()
  capacity?: number | null;
}

export default CreateWarehouseValidator;
