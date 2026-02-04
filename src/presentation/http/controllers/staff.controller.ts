import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import UpdateStaffCommand from 'src/application/staff/commands/update/update-staff.command';
import UpdateStaffValidator from 'src/application/staff/commands/update/update-staff.validator';
import DeleteStaffCommand from 'src/application/staff/commands/delete/delete-staff.command';
import StaffRepository from 'src/infrastructure/database/repositories/staff/staff.repository';
import StaffQuery from 'src/application/staff/queries/staff.query';
import type { StaffFilters } from 'src/application/staff/queries/staff.filters';
import JwtAuthGuard from 'src/modules/auth/guards/jwt-auth.guard';
import { StaffSerialiser } from 'src/presentation/serialisers/staff.serialiser';

@Controller('staff')
@UseGuards(JwtAuthGuard)
class StaffController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly staff: StaffRepository,
    private readonly staffQuery: StaffQuery,
    private readonly staffSerialiser: StaffSerialiser,
  ) {}

  @Put(':id')
  @HttpCode(HttpStatus.OK)
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
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    const command = new DeleteStaffCommand(id);
    await this.commandBus.execute(command);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getStaff(@Param('id', ParseIntPipe) id: number) {
    const staff = await this.staff.findById(id);

    if (staff) {
      return this.staffSerialiser.serialise(staff);
    }

    return null;
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMany(@Body('ids') ids: number[]) {
    await Promise.all(
      ids.map((id) => this.commandBus.execute(new DeleteStaffCommand(id))),
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllStaff(@Query() filters: StaffFilters) {
    const result = await this.staffQuery.findBy(filters);
    return {
      data: await this.staffSerialiser.serialiseMany(result.data),
      total: result.total,
      skip: result.skip,
      take: result.take,
    };
  }
}

export default StaffController;
