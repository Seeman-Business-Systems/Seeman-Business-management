import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import CreateRoleCommand from "./create-role.command";
import RoleRepository from "src/infrastructure/database/repositories/role/role.repository";
import Role from "src/domain/role/role";

@CommandHandler(CreateRoleCommand)
class CreateRole implements ICommandHandler<CreateRoleCommand> {
    constructor(
        private roles: RoleRepository,
    ) {}

    async execute(command: CreateRoleCommand): Promise<Role> {
        const role = new Role(
            undefined,
            command.name,
            command.isManagement,
            command.createdBy,
            new Date(),
            new Date(),
            undefined,
        )

        return await this.roles.commit(role);
    }
}

export default CreateRole