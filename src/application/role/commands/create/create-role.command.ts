import { Command } from "@nestjs/cqrs";
import Role from "src/domain/role/role";

class CreateRoleCommand extends Command<Role> {
    constructor(
        public readonly name: string,
        public readonly isManagement: boolean,
        public readonly createdBy: number,
    ) {
        super();
    }
}

export default CreateRoleCommand