import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { TypeOrmModule } from "@nestjs/typeorm";
import CreateCustomerHandler from 'src/application/customer/commands/create/create-customer';
import UpdateCustomerHandler from "src/application/customer/commands/update/update-customer";
import DeleteCustomerHandler from "src/application/customer/commands/delete/delete-customer";
import SetCreditLimitHandler from "src/application/customer/commands/set-credit-limit/set-credit-limit";
import CustomerQuery from "src/application/customer/queries/customer.query";
import CustomerEntity from "src/infrastructure/database/entities/customer.entity";
import CustomerDBRepository from "src/infrastructure/database/repositories/customer/customer.db-repository";
import CustomerRepository from "src/infrastructure/database/repositories/customer/customer.repository";
import CustomerController from "src/presentation/http/controllers/customer.controller";
import CustomerSerialiser from "src/presentation/serialisers/customer.serialiser";
import { CustomerSeed } from "src/infrastructure/database/seeds/customer.seed";
import { StaffModule } from "../staff/staff.module";
import { StaffSerialiser } from "src/presentation/serialisers/staff.serialiser";

@Module({
    imports: [
        CqrsModule,
        TypeOrmModule.forFeature([CustomerEntity]),
        StaffModule,
    ],
    controllers: [CustomerController],
    providers: [
        {
            provide: CustomerRepository,
            useClass: CustomerDBRepository,
        },
        CustomerSeed,
        CreateCustomerHandler,
        UpdateCustomerHandler,
        DeleteCustomerHandler,
        SetCreditLimitHandler,
        CustomerQuery,
        CustomerSerialiser,
        StaffSerialiser,
    ],
    exports: [
        CustomerRepository,
        CustomerSeed,
    ]
})

export class CustomerModule {}
