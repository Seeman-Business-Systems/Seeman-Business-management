import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Param,
  ParseIntPipe,
  Delete,
  UseGuards,
  Get,
  Query,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import CreateBranchCommand from 'src/application/branch/commands/create/create-branch.command';
import CreateBranchValidator from 'src/application/branch/commands/create/create-branch.validator';
import BranchStatus from 'src/domain/branch/branch-status';
import Branch from 'src/domain/branch/branch';
import UpdateBranchCommand from 'src/application/branch/commands/update/update-branch.command';
import UpdateBranchValidator from 'src/application/branch/commands/update/update-branch.validator';
import DeleteBranchCommand from 'src/application/branch/commands/delete/delete-branch.command';
import JwtAuthGuard from 'src/modules/auth/guards/jwt-auth.guard';
import Actor from 'src/modules/auth/decorators/actor.decorator';
import Staff from 'src/domain/staff/staff';
import { ActorType } from 'src/domain/common/actor-type';
import BranchRepository from 'src/infrastructure/database/repositories/branch/branch.repository';
import BranchQuery from 'src/application/branch/queries/branch.query';
import type { BranchFilters } from 'src/application/branch/queries/branch.filters';

@Controller('branches')
@UseGuards(JwtAuthGuard)
class BranchController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly branches: BranchRepository,
    private readonly branchQuery: BranchQuery,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateBranchValidator,
    @Actor() actor: Staff,
  ): Promise<Branch> {
    const command = new CreateBranchCommand(
      dto.name,
      dto.address,
      dto.city,
      dto.state,
      dto.status ?? BranchStatus.ACTIVE,
      dto.phoneNumber,
      dto.managerId,
      dto.isHeadOffice ?? false,
      actor.getId()! ?? ActorType.SYSTEM_ACTOR,
      dto.altPhoneNumber,
      dto.code,
    );

    return await this.commandBus.execute(command);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBranchValidator,
  ): Promise<Branch> {
    const command = new UpdateBranchCommand(
      id,
      dto.name,
      dto.address,
      dto.city,
      dto.state,
      dto.status,
      dto.phoneNumber,
      dto.managerId,
      dto.isHeadOffice,
      dto.code,
      dto.altPhoneNumber,
    );

    return await this.commandBus.execute(command);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    const command = new DeleteBranchCommand(id);

    await this.commandBus.execute(command);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Branch | null> {
    return await this.branches.findById(id);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() filters: BranchFilters): Promise<Branch[]> {
    return await this.branchQuery.findBy(filters);
  }
}

export default BranchController;
