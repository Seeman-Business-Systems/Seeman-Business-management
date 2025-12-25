import { Command } from "@nestjs/cqrs";

class DeleteRoleCommand extends Command<void> {
    constructor(
        public readonly id: number,
    ) {
        super();
    }
}

export default DeleteRoleCommand