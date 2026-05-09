import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import AuthController from './auth.controller';
import AuthService from './auth.service';
import BranchScope from './services/branch-scope.service';
import { StaffModule } from '../staff/staff.module';
import { RoleModule } from '../role/role.module';
import JwtStrategy from './strategies/jwt.strategy';
import { RefreshTokenModule } from '../tokens/refresh-token.module';
import { PasswordResetTokenModule } from '../tokens/password-reset-token.module';
import MailersModule from 'src/mailers/mailers.module';
import { PermissionModule } from '../permission/permission.module';
@Module({
  imports: [
    ConfigModule,
    PassportModule,
    StaffModule,
    RoleModule,
    RefreshTokenModule,
    PasswordResetTokenModule,
    MailersModule,
    PermissionModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        secret: config.get('JWT_ACCESS_SECRET', 'default-secret'),
        signOptions: {
          expiresIn: config.get('JWT_ACCESS_EXPIRATION_TIME', '15m'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, BranchScope],
  exports: [AuthService, JwtModule, BranchScope],
})
export class AuthModule {}