import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import ExpenseEntity from 'src/infrastructure/database/entities/expense.entity';
import ExpenseRepository from 'src/infrastructure/database/repositories/expense/expense.repository';
import ExpenseDBRepository from 'src/infrastructure/database/repositories/expense/expense.db-repository';
import ExpenseQuery from 'src/application/expense/queries/expense.query';
import ExpenseSerialiser from 'src/presentation/serialisers/expense.serialiser';
import ExpenseController from 'src/presentation/http/controllers/expense.controller';
import CreateExpenseHandler from 'src/application/expense/commands/create/create-expense.handler';
import DeleteExpenseHandler from 'src/application/expense/commands/delete/delete-expense.handler';
import UpdateExpenseHandler from 'src/application/expense/commands/update/update-expense.handler';
import BranchRepository from 'src/infrastructure/database/repositories/branch/branch.repository';
import BranchDBRepository from 'src/infrastructure/database/repositories/branch/branch.db-repository';
import BranchEntity from 'src/infrastructure/database/entities/branch.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([ExpenseEntity, BranchEntity]),
    AuthModule,
  ],
  controllers: [ExpenseController],
  providers: [
    { provide: ExpenseRepository, useClass: ExpenseDBRepository },
    { provide: BranchRepository, useClass: BranchDBRepository },
    ExpenseDBRepository,
    BranchDBRepository,
    ExpenseQuery,
    ExpenseSerialiser,
    CreateExpenseHandler,
    DeleteExpenseHandler,
    UpdateExpenseHandler,
  ],
})
export class ExpenseModule {}
