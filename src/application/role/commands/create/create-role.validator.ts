import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

class CreateRoleValidator {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsBoolean()
  isManagement: boolean;
}

export default CreateRoleValidator;
