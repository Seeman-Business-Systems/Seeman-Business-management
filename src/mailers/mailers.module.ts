import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import PasswordResetMailer from './auth/password-reset/password-reset.mailer';

@Module({
  imports: [ConfigModule],
  providers: [PasswordResetMailer],
  exports: [PasswordResetMailer],
})
class MailersModule {}

export default MailersModule;