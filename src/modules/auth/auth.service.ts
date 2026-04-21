import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import Staff from 'src/domain/staff/staff';
import RefreshToken from 'src/domain/tokens/refresh-token';
import PasswordResetToken from 'src/domain/tokens/password-reset-token';
import StaffRepository from 'src/infrastructure/database/repositories/staff/staff.repository';
import RefreshTokenRepository from 'src/infrastructure/database/repositories/token/refresh-token.repository';
import PasswordResetTokenRepository from 'src/infrastructure/database/repositories/token/password-reset-token.repository';
import PasswordResetMailer from 'src/mailers/auth/password-reset/password-reset.mailer';

@Injectable()
class AuthService {
  constructor(
    private staff: StaffRepository,
    private refreshTokens: RefreshTokenRepository,
    private passwordResetTokens: PasswordResetTokenRepository,
    private passwordResetMailer: PasswordResetMailer,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Register new user
   */
  async register(
    staffData: Partial<Staff>,
  ): Promise<{ accessToken: string; refreshToken: string; staff: Staff }> {
    if (await this.isExistingUser(staffData.phoneNumber!, staffData?.email)) {
      throw new BadRequestException(
        'User with provided phone number or email already exists',
      );
    }

    const newStaff = new Staff(
      undefined, // id
      staffData.firstName!,
      staffData.lastName!,
      staffData.phoneNumber!,
      staffData.roleId!,
      staffData.branchId!,
      new Date(),
      new Date(),
      await this.genInitialPassword(),
      staffData.createdBy!,
      false,
      undefined, // lastLoginAt
      staffData.middleName,
      staffData.email,
      staffData.joinedAt,
    );

    const savedStaff = await this.staff.commit(newStaff);

    const tokens = await this.generateTokens(savedStaff);

    return {
      ...tokens,
      staff: savedStaff,
    };
  }

  /**
   * Login with phone/email and password
   */
  async login(
    identifier: string, // phone or email
    password: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    staff: Staff;
  } | void> {
    const staff =
      (await this.staff.findByPhoneNumber(identifier)) ||
      (await this.staff.findByEmail(identifier));

    if (!staff) {
      throw new UnauthorizedException('Staff not found');
    }

    if (!await this.passwordsMatch(password, staff.getPassword())) {
      throw new UnauthorizedException('Invalid email/phone or password');
    }

    const tokens = await this.generateTokens(staff);

    staff.setLastLoginAt(new Date());
    await this.staff.commit(staff);

    return {
      ...tokens,
      staff,
    };
  }

  async refresh(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const decoded = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const storedToken = await this.refreshTokens.findByToken(refreshToken);

      if (!storedToken) {
        throw new BadRequestException('Invalid refresh token');
      }

      await this.refreshTokens.revoke(refreshToken);

      const payload = {
        sub: decoded.sub,
        phoneNumber: decoded.phoneNumber,
        email: decoded.email,
      };

      const accessToken = this.jwtService.sign(payload);

      const token = this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION_TIME'),
      });

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const newRefreshToken = new RefreshToken(
        undefined,
        token,
        decoded.sub,
        expiresAt,
        new Date(),
        undefined,
      );

      this.refreshTokens.commit(newRefreshToken);

      return {
        accessToken,
        refreshToken: token,
      };
    } catch (error) {
      throw new BadRequestException('Invalid refresh token');
    }
  }

  async logout(staffRefreshToken: string): Promise<void> {
    await this.refreshTokens.revoke(staffRefreshToken);
  }

  async forgotPassword(email: string): Promise<void> {
    const staff = await this.staff.findByEmail(email);

    if (!staff) {
      // Don't reveal if email exists - always return success
      return;
    }

    // Invalidate any existing reset tokens for this user
    await this.passwordResetTokens.invalidateAllForStaff(staff.getId()!);

    // Generate secure random token
    const token = crypto.randomBytes(32).toString('hex');

    // Token expires in 30 minutes
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30);

    const resetToken = new PasswordResetToken(
      undefined,
      token,
      staff.getId()!,
      expiresAt,
      new Date(),
      undefined,
    );

    await this.passwordResetTokens.commit(resetToken);

    // Send email with reset link
    await this.passwordResetMailer.send(
      email,
      token,
      staff.getFirstName(),
    );
  }

  async resetPasswordWithToken(
    token: string,
    newPassword: string,
  ): Promise<void> {
    const resetToken = await this.passwordResetTokens.findByToken(token);

    if (!resetToken) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (!resetToken.isValid()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const staff = await this.staff.findById(resetToken.getStaffId());

    if (!staff) {
      throw new NotFoundException('Staff not found');
    }

    if (await this.passwordsMatch(newPassword, staff.getPassword())) {
      throw new BadRequestException("You can't use your previous password. Please try a different password.");
    }

    // Update password
    staff.setInitialPasswordChanged(true);
    staff.setPassword(await this.hash(newPassword));
    await this.staff.commit(staff);

    // Mark token as used
    await this.passwordResetTokens.markAsUsed(token);
  }

  private async genInitialPassword(): Promise<string> {
    const chars = this.configService.get<string>(
      'INITIAL_PASSWORD_CHARS',
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*',
    );
    const charsLength = this.configService.get<number>(
      'INITIAL_PASSWORD_LENGTH',
      10,
    );

    return Array.from(
      { length: charsLength },
      () => chars[Math.floor(Math.random() * chars.length)],
    ).join('');
  }

  /**
   * Check if user with phone number or email already exists
   */
  private async isExistingUser(
    phoneNumber: string,
    email?: string,
  ): Promise<boolean> {
    const staff =
      (await this.staff.findByPhoneNumber(phoneNumber)) ||
      (email && (await this.staff.findByEmail(email)));

    return !!staff;
  }

  private async hash(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  /**
   * Generate access and refresh tokens
   */
  private async generateTokens(
    staff: Staff,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      sub: staff.getId(),
      phoneNumber: staff.getPhoneNumber(),
      email: staff.getEmail(),
    };

    // Generate access token
    const accessToken = this.jwtService.sign(payload);

    // Generate refresh token
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION_TIME'),
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    const newRefreshToken = new RefreshToken(
      undefined,
      refreshToken,
      staff.getId()!,
      expiresAt,
      new Date(),
      undefined, // not revoked
    );

    await this.refreshTokens.commit(newRefreshToken);

    return {
      accessToken,
      refreshToken, // Return plain token to user
    };
  }

  private async passwordsMatch(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  private async isLoggedIn(staffId: number): Promise<boolean> {
    const refreshToken = await this.refreshTokens.findActiveByStaffId(staffId);

    if (refreshToken) {
      return true;
    }

    return false;
  }
}

export default AuthService;
