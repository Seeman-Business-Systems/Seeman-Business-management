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
import BranchSerialiser from 'src/presentation/serialisers/branch.serialiser';

@Controller('branches')
// @UseGuards(JwtAuthGuard)
class BranchController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly branches: BranchRepository,
    private readonly branchQuery: BranchQuery,
    private readonly branchSerialiser: BranchSerialiser,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateBranchValidator, @Actor() actor: Staff) {
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

    const branch = await this.commandBus.execute(command);

    return await this.branchSerialiser.serialise(branch);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBranchValidator,
  ) {
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

    const branch = await this.commandBus.execute(command);

    return await this.branchSerialiser.serialise(branch);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    const command = new DeleteBranchCommand(id);

    await this.commandBus.execute(command);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const branch = await this.branches.findById(id);

    if (branch) {
      return this.branchSerialiser.serialise(branch);
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() filters: BranchFilters) {
    const branches = await this.branchQuery.findBy(filters);

    return this.branchSerialiser.serialiseMany(branches);
  }
}

export default BranchController;
