import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import CreateRoleCommand from 'src/application/role/commands/create/create-role.command';
import CreateRoleValidator from 'src/application/role/commands/create/create-role.validator';
import DeleteRoleCommand from 'src/application/role/commands/delete/delete-role.command';
import UpdateRoleCommand from 'src/application/role/commands/udpate/update-role.command';
import UpdateRoleValidator from 'src/application/role/commands/udpate/update-role.validator';
import Role from 'src/domain/role/role';
import Staff from 'src/domain/staff/staff';
import RoleRepository from 'src/infrastructure/database/repositories/role/role.repository';
import Actor from 'src/modules/auth/decorators/actor.decorator';
import JwtAuthGuard from 'src/modules/auth/guards/jwt-auth.guard';

@Controller('roles')
// @UseGuards(JwtAuthGuard)
class RoleController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly roles: RoleRepository,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateRoleValidator,
    @Actor() actor: Staff,
  ): Promise<Role> {
    const command = new CreateRoleCommand(
      dto.name,
      dto.isManagement,
      // actor.getId(),
      1
    );

    return await this.commandBus.execute(command);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRoleValidator,
  ): Promise<Role> {
    const command = new UpdateRoleCommand(id, dto.name, dto.isManagement);

    return await this.commandBus.execute(command);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    const command = new DeleteRoleCommand(id);

    await this.commandBus.execute(command);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getRole(@Param('id', ParseIntPipe) id: number): Promise<Role | null> {
    return await this.roles.findByIdOrName(id, undefined);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllRoles(): Promise<Role[]> {
    return await this.roles.findAll();
  }
}

export default RoleController;
