import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import UpdateRoleCommand from "./update-role.command";
import RoleRepository from "src/infrastructure/database/repositories/role/role.repository";
import Role from "src/domain/role/role";

@CommandHandler(UpdateRoleCommand)
class UpdateRole implements ICommandHandler<UpdateRoleCommand> {
    constructor(
        private roles: RoleRepository,
    ) {}
    
    async execute(command: UpdateRoleCommand): Promise<Role> {
        const role = await this.roles.findByIdOrName(command.id, undefined);

        if (!role) {
            throw new Error(`Role with id ${command.id} nto found`);
        }

        role.setName(command.name);
        role.setIsManagement(command.isManagement);

        return await this.roles.commit(role);
    }
}

export default UpdateRole