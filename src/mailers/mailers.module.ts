import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import PasswordResetMailer from './auth/password-reset/password-reset.mailer';
import WelcomeMailer from './auth/welcome/welcome.mailer';

@Module({
  imports: [ConfigModule],
  providers: [PasswordResetMailer, WelcomeMailer],
  exports: [PasswordResetMailer, WelcomeMailer],
})
class MailersModule {}

export default MailersModule;