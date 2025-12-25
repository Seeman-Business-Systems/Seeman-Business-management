import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

class UpdateRoleValidator {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsBoolean()
  isManagement: boolean;
}

export default UpdateRoleValidator;
