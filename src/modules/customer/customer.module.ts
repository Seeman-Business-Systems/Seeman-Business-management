import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { TypeOrmModule } from "@nestjs/typeorm";
import CustomerEntity from "src/infrastructure/database/entities/customer.entity";
import CustomerDBRepository from "src/infrastructure/database/repositories/customer/customer.db-repository";
import CustomerRepository from "src/infrastructure/database/repositories/customer/customer.repository";
import CustomerController from "src/presentation/http/controllers/customer.controller";

@Module({
    imports: [CqrsModule, TypeOrmModule.forFeature([CustomerEntity])],
    controllers: [CustomerController],
    providers: [
        {
            provide: CustomerRepository,
            useClass: CustomerDBRepository,
        },
        // CustomerSeed,
    ],
    exports: [CustomerRepository,
        // CustomerSeed
    ]
})

export class CustomerModule {}
