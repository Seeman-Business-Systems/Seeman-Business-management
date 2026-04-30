import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { getPasswordResetTemplate } from './password-reset.template';

@Injectable()
class PasswordResetMailer {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get('MAIL_USER'),
        pass: this.configService.get('MAIL_PASSWORD'),
      },
    });
  }

  async send(to: string, resetToken: string, firstName: string): Promise<void> {
    const frontendUrl = this.configService.get(
      'FRONTEND_URL',
      'http://localhost:5173',
    );
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;
    const logoUrl = this.configService.get(
      'LOGO_URL',
      'https://res.cloudinary.com/dcbsqeglq/image/upload/f_auto,q_auto/full-logo_i43nwd',
    );

    const html = getPasswordResetTemplate({
      firstName,
      resetLink,
      logoUrl,
    });

    await this.transporter.sendMail({
      from: this.configService.get(
        'MAIL_FROM',
        '"Seeman Auto" <seeman.notifications@gmail.com>',
      ),
      to,
      subject: 'Password Reset Request - Seeman Auto',
      html,
    });
  }
}

export default PasswordResetMailer;
