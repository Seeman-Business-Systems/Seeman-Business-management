import { Command } from '@nestjs/cqrs';
import Role from 'src/domain/role/role';

class UpdateRoleCommand extends Command<Role> {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly isManagement: boolean,
  ) {
    super();
  }
}

export default UpdateRoleCommand;
