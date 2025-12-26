import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import DeleteRoleCommand from './delete-role.command';
import RoleRepository from 'src/infrastructure/database/repositories/role/role.repository';

@CommandHandler(DeleteRoleCommand)
class DeleteRole implements ICommandHandler<DeleteRoleCommand> {
  constructor(private roles: RoleRepository) {}

  async execute(command: DeleteRoleCommand): Promise<void> {
    const role = await this.roles.findByIdOrName(command.id, undefined);

    if (!role) {
      throw new Error(`Role with id ${command.id} not found`);
    }

    await this.roles.delete(command.id);
  }
}

export default DeleteRole;
