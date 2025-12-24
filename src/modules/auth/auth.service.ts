import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import Staff from 'src/domain/staff/staff';
import RefreshToken from 'src/domain/tokens/refresh-token';
import StaffRepository from 'src/infrastructure/database/repositories/staff/staff.repository';
import RefreshTokenRepository from 'src/infrastructure/database/repositories/token/refresh-token.repository';

@Injectable()
class AuthService {
  constructor(
    private staff: StaffRepository,
    private refreshTokens: RefreshTokenRepository,
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
    console.log('Login attempt for identifier:', identifier, password);
    const staff =
      (await this.staff.findByPhoneNumber(identifier)) ||
      (await this.staff.findByEmail(identifier));

    console.log('Found staff during login:', staff);

    if (!staff) {
      throw new UnauthorizedException('Staff not found');
    }

    if (!this.passwordsMatch(password, staff.getPassword())) {
      throw new UnauthorizedException('Invalid credentials');
    }

    //we do not need this for now because of multiple devices
    // if (await this.isLoggedIn(staff.getId()!)) {
    //   throw new UnauthorizedException('User already logged in');
    // }

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

  async resetPassword(staffId: number, newPassword: string): Promise<Staff> {
    const staff = await this.staff.findById(staffId);
    console.log('staff: ', staff);

    if (!staff) throw new NotFoundException('Staff not found');

    if (await this.passwordsMatch(newPassword, staff.getPassword())) {
      throw new BadRequestException("Can't use same password as old");
    }

    staff.setInitialPasswordChanged(true);
    staff.setPassword(await this.hash(newPassword));

    this.staff.commit(staff);

    return staff;
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
    return bcrypt.compare(password, hashedPassword);
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
