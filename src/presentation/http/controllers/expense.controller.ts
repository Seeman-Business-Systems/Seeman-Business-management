import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import JwtAuthGuard from 'src/modules/auth/guards/jwt-auth.guard';
import { RequirePermission } from 'src/modules/auth/decorators/role-guard.decorator';
import { Permission } from 'src/domain/permission/permission';
import Actor from 'src/modules/auth/decorators/actor.decorator';
import Staff from 'src/domain/staff/staff';
import CreateExpenseCommand from 'src/application/expense/commands/create/create-expense.command';
import CreateExpenseValidator from 'src/application/expense/commands/create/create-expense.validator';
import DeleteExpenseCommand from 'src/application/expense/commands/delete/delete-expense.command';
import UpdateExpenseCommand from 'src/application/expense/commands/update/update-expense.command';
import UpdateExpenseValidator from 'src/application/expense/commands/update/update-expense.validator';
import ExpenseQuery from 'src/application/expense/queries/expense.query';
import type { ExpenseFilters } from 'src/application/expense/queries/expense.filters';
import ExpenseSerialiser from 'src/presentation/serialisers/expense.serialiser';
import ExpenseCategory from 'src/domain/expense/expense-category';

@Controller('expenses')
@UseGuards(JwtAuthGuard)
class ExpenseController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly expenseQuery: ExpenseQuery,
    private readonly expenseSerialiser: ExpenseSerialiser,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @RequirePermission(Permission.EXPENSE_READ)
  async getAll(@Query() query: any) {
    const filters: ExpenseFilters = {
      branchId: query.branchId ? Number(query.branchId) : undefined,
      category: query.category as ExpenseCategory | undefined,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
      take: query.take ? Number(query.take) : undefined,
      skip: query.skip ? Number(query.skip) : undefined,
    };
    const result = await this.expenseQuery.findBy(filters);
    return {
      data: await this.expenseSerialiser.serialiseMany(result.data),
      total: result.total,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequirePermission(Permission.EXPENSE_CREATE)
  async create(@Body() dto: CreateExpenseValidator, @Actor() actor: Staff) {
    const command = new CreateExpenseCommand(
      dto.amount,
      dto.category,
      dto.description,
      dto.branchId,
      actor.getId(),
      new Date(dto.date),
      dto.notes ?? null,
    );
    const expense = await this.commandBus.execute(command);
    return this.expenseSerialiser.serialise(expense);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @RequirePermission(Permission.EXPENSE_UPDATE)
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateExpenseValidator) {
    const command = new UpdateExpenseCommand(
      id,
      dto.amount,
      dto.category,
      dto.description,
      dto.branchId,
      new Date(dto.date),
      dto.notes ?? null,
    );
    const expense = await this.commandBus.execute(command);
    return this.expenseSerialiser.serialise(expense);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermission(Permission.EXPENSE_DELETE)
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.commandBus.execute(new DeleteExpenseCommand(id));
  }
}

export default ExpenseController;
