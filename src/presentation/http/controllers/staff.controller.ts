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
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import UpdateStaffCommand from 'src/application/staff/commands/update/update-staff.command';
import UpdateStaffValidator from 'src/application/staff/commands/update/update-staff.validator';
import TransferStaffCommand from 'src/application/staff/commands/transfer/transfer-staff.command';
import TransferStaffValidator from 'src/application/staff/commands/transfer/transfer-staff.validator';
import DeleteStaffCommand from 'src/application/staff/commands/delete/delete-staff.command';
import StaffRepository from 'src/infrastructure/database/repositories/staff/staff.repository';
import StaffQuery from 'src/application/staff/queries/staff.query';
import type { StaffFilters } from 'src/application/staff/queries/staff.filters';
import JwtAuthGuard from 'src/modules/auth/guards/jwt-auth.guard';
import { RequirePermission } from 'src/modules/auth/decorators/role-guard.decorator';
import { Permission } from 'src/domain/permission/permission';
import Actor from 'src/modules/auth/decorators/actor.decorator';
import Staff from 'src/domain/staff/staff';
import { StaffSerialiser } from 'src/presentation/serialisers/staff.serialiser';
import BranchScope from 'src/modules/auth/services/branch-scope.service';

@Controller('staff')
@UseGuards(JwtAuthGuard)
class StaffController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly staff: StaffRepository,
    private readonly staffQuery: StaffQuery,
    private readonly staffSerialiser: StaffSerialiser,
    private readonly branchScope: BranchScope,
  ) {}

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @RequirePermission(Permission.STAFF_CREATE)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStaffValidator,
  ) {
    const command = new UpdateStaffCommand(
      id,
      dto.firstName,
      dto.lastName,
      dto.phoneNumber,
      dto.roleId,
      dto.branchId,
      dto.middleName,
      dto.email,
      dto.joinedAt,
    );

    const staff = await this.commandBus.execute(command);
    return this.staffSerialiser.serialise(staff);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermission(Permission.STAFF_DELETE)
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    const command = new DeleteStaffCommand(id);
    await this.commandBus.execute(command);
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getMe(@Actor() actor: Staff) {
    return this.staffSerialiser.serialise(actor);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @RequirePermission(Permission.STAFF_READ)
  async getStaff(@Param('id', ParseIntPipe) id: number) {
    const staff = await this.staff.findById(id);

    if (staff) {
      return this.staffSerialiser.serialise(staff);
    }

    return null;
  }

  @Patch(':id/transfer')
  @HttpCode(HttpStatus.OK)
  @RequirePermission(Permission.STAFF_TRANSFER)
  async transfer(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: TransferStaffValidator,
    @Actor() actor: Staff,
  ) {
    const command = new TransferStaffCommand(id, dto.branchId, actor.getId());
    const staff = await this.commandBus.execute(command);
    return this.staffSerialiser.serialise(staff);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermission(Permission.STAFF_DELETE)
  async deleteMany(@Body('ids') ids: number[]) {
    await Promise.all(
      ids.map((id) => this.commandBus.execute(new DeleteStaffCommand(id))),
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @RequirePermission(Permission.STAFF_READ)
  async getAllStaff(@Query() filters: StaffFilters, @Actor() actor: Staff) {
    const requested = Array.isArray(filters.branchId)
      ? undefined
      : filters.branchId
        ? Number(filters.branchId)
        : undefined;
    const branchId = await this.branchScope.resolve(actor, requested);

    const result = await this.staffQuery.findBy({ ...filters, branchId });
    return {
      data: await this.staffSerialiser.serialiseMany(result.data),
      total: result.total,
      skip: result.skip,
      take: result.take,
    };
  }
}

export default StaffController;
