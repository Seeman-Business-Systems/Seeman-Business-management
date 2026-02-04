import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
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
import { RoleSerialiser } from 'src/presentation/serialisers/role.serialiser';

const ROLES_CACHE_KEY = 'all_roles';

@Controller('roles')
@UseGuards(JwtAuthGuard)
class RoleController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly roles: RoleRepository,
    private readonly roleSerialiser: RoleSerialiser,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateRoleValidator, @Actor() actor: Staff) {
    const command = new CreateRoleCommand(
      dto.name,
      dto.isManagement,
      actor.getId(),
    );

    const role: Role = await this.commandBus.execute(command);
    await this.cacheManager.del(ROLES_CACHE_KEY);
    return this.roleSerialiser.serialise(role);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRoleValidator,
  ) {
    const command = new UpdateRoleCommand(id, dto.name, dto.isManagement);

    const role: Role = await this.commandBus.execute(command);
    await this.cacheManager.del(ROLES_CACHE_KEY);
    return this.roleSerialiser.serialise(role);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    const command = new DeleteRoleCommand(id);

    await this.commandBus.execute(command);
    await this.cacheManager.del(ROLES_CACHE_KEY);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMany(@Body('ids') ids: number[]): Promise<void> {
    await Promise.all(
      ids.map((id) => this.commandBus.execute(new DeleteRoleCommand(id))),
    );
    await this.cacheManager.del(ROLES_CACHE_KEY);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getRole(@Param('id', ParseIntPipe) id: number) {
    const role = await this.roles.findByIdOrName(id, undefined);
    if (role) {
      return this.roleSerialiser.serialise(role);
    }
    return null;
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllRoles() {
    const cached = await this.cacheManager.get(ROLES_CACHE_KEY);
    if (cached) {
      return cached;
    }

    const roles = await this.roles.findAll();
    const serialised = await this.roleSerialiser.serialiseMany(roles);
    await this.cacheManager.set(ROLES_CACHE_KEY, serialised);
    return serialised;
  }
}

export default RoleController;
