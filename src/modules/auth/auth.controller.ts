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
import ForgotPasswordValidator from 'src/application/staff/commands/auth/forgot-password.validator';
import ResetPasswordWithTokenValidator from 'src/application/staff/commands/auth/reset-password-with-token.validator';
import { StaffSerialiser } from 'src/presentation/serialisers/staff.serialiser';
import RolePermissionRepository from 'src/infrastructure/database/repositories/role-permission/role-permission.repository';
import RoleRepository from 'src/infrastructure/database/repositories/role/role.repository';
import { SUPERADMIN_ROLE } from 'src/domain/permission/permission';

@Controller('auth')
@UseGuards(JwtAuthGuard)
class AuthController {
  constructor(
    private authService: AuthService,
    private staffSerialiser: StaffSerialiser,
    private permissionRepo: RolePermissionRepository,
    private roleRepo: RoleRepository,
  ) {}

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

    const result = await this.authService.register(staffData);
    return {
      staff: await this.staffSerialiser.serialise(result.staff),
    };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: { identifier: string; password: string }) {
    const result = await this.authService.login(dto.identifier, dto.password);
    if (!result) return;

    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      staff: await this.staffSerialiser.serialise(result.staff),
    };
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

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordValidator) {
    await this.authService.forgotPassword(dto.email);
    return { message: 'If the email exists, a password reset link has been sent' };
  }

  @Public()
  @Post('reset-password-with-token')
  @HttpCode(HttpStatus.OK)
  async resetPasswordWithToken(@Body() dto: ResetPasswordWithTokenValidator) {
    await this.authService.resetPasswordWithToken(dto.token, dto.newPassword);
    return { message: 'Password has been reset successfully' };
  }

  /**
   * Get current authenticated user profile
   */
  @Post('impersonate/:staffId')
  @HttpCode(HttpStatus.OK)
  async impersonate(
    @Param('staffId', ParseIntPipe) staffId: number,
    @Actor() actor: Staff,
  ) {
    const result = await this.authService.impersonate(staffId);
    return {
      accessToken: result.accessToken,
      staff: await this.staffSerialiser.serialise(result.staff),
      impersonatedBy: actor.getId(),
    };
  }

  @Post('me')
  @HttpCode(HttpStatus.OK)
  async getProfile(@Actor() actor: Staff) {
    const role = await this.roleRepo.findByIdOrName(actor.getRoleId());
    const roleName = role?.getName() ?? '';
    const permissions = roleName === SUPERADMIN_ROLE
      ? ['*']
      : await this.permissionRepo.getGrantedForRole(roleName);
    return {
      staff: await this.staffSerialiser.serialise(actor),
      permissions,
    };
  }
}

export default AuthController;