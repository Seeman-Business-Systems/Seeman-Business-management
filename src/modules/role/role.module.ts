import { Module, forwardRef } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { TypeOrmModule } from "@nestjs/typeorm";
import RoleEntity from "src/infrastructure/database/entities/role.entity";
import RoleDBRepository from "src/infrastructure/database/repositories/role/role.db-repository";
import RoleRepository from "src/infrastructure/database/repositories/role/role.repository";
import RoleController from "src/presentation/http/controllers/role.controller";
import { RoleSeed } from "src/infrastructure/database/seeds/role.seed";
import CreateRoleHandler from 'src/application/role/commands/create/create-role';
import UpdateRoleHandler from 'src/application/role/commands/udpate/update-role';
import DeleteRoleHandler from 'src/application/role/commands/delete/delete-role';
import { RoleSerialiser } from "src/presentation/serialisers/role.serialiser";
import { BaseStaffSerialiser } from "src/presentation/serialisers/base-staff.serialiser";
import { StaffModule } from "../staff/staff.module";

@Module({
    imports: [
        CqrsModule,
        TypeOrmModule.forFeature([RoleEntity]),
        forwardRef(() => StaffModule),
    ],
    controllers: [RoleController],
    providers: [
        {
            provide: RoleRepository,
            useClass: RoleDBRepository,
        },
        RoleSeed,
        CreateRoleHandler,
        UpdateRoleHandler,
        DeleteRoleHandler,
        RoleSerialiser,
        BaseStaffSerialiser,
    ],
    exports: [RoleRepository, RoleSeed, RoleSerialiser],
})

export class RoleModule {}