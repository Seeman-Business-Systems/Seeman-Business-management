import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Put, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import UpdateStaffCommand from 'src/application/staff/commands/update/update-staff.command';
import UpdateStaffValidator from 'src/application/staff/commands/update/update-staff.validator';
import Staff from 'src/domain/staff/staff';
import StaffRepository from 'src/infrastructure/database/repositories/staff/staff.repository';
import JwtAuthGuard from 'src/modules/auth/guards/jwt-auth.guard';

@Controller('staff')
// @UseGuards(JwtAuthGuard)
class StaffController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly staff: StaffRepository,
  ) {}

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStaffValidator,
  ): Promise<Staff> {
    const command = new UpdateStaffCommand(
      id,
      dto.firstName,
      dto.lastName,
      dto.phoneNumber,
      dto.roleId,
      dto.branchId,
      dto.middleName,
      dto.email,
    );

    return await this.commandBus.execute(command);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getStaff(@Param('id', ParseIntPipe) id: number): Promise<Staff | null> {
    return await this.staff.findById(id);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllStaff(): Promise<Staff[]> {
    return await this.staff.findAll();
  }
}

export default StaffController;
