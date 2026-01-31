import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import Staff from 'src/domain/staff/staff';
import RegisterStaffValidator from 'src/application/staff/commands/auth/register-staff.validator';
import AuthService from './auth.service';
import JwtAuthGuard from './guards/jwt-auth.guard';
import Actor from './decorators/actor.decorator';
import { Public } from './decorators/public.decorator';
import PasswordResetValidator from 'src/application/staff/commands/auth/password-reset.validator';

@Controller('auth')
@UseGuards(JwtAuthGuard)
class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterStaffValidator, @Actor() actor: Staff) {
    const staffData = {
      firstName: dto.firstName,
      lastName: dto.lastName,
      phoneNumber: dto.phoneNumber,
      roleId: dto.roleId ?? 1,
      branchId: dto.branchId ?? 1,
      createdBy: actor.id,
      middleName: dto.middleName,
      email: dto.email,
      joinedAt: dto.joinedAt,
    };

    return await this.authService.register(staffData);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: { identifier: string; password: string }) {
    return await this.authService.login(dto.identifier, dto.password);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body('refreshToken') refreshToken: string) {
    return await this.authService.refresh(refreshToken);
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Body('refreshToken') refreshToken: string) {
    await this.authService.logout(refreshToken);
    return { message: 'Logged out successfully' };
  }

  @Post('reset-password/:id')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: PasswordResetValidator,
  ): Promise<Staff> {
    return await this.authService.resetPassword(id, dto.newPassword);
  }

  /**
   * Get current authenticated user profile
   */
  @Post('me')
  @HttpCode(HttpStatus.OK)
  async getProfile(@Actor() actor: Staff) {
    return { staff: actor };
  }
}

export default AuthController;
