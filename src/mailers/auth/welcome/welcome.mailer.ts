import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { getWelcomeTemplate } from './welcome.template';

@Injectable()
class WelcomeMailer {
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

  async send(to: string, setupToken: string, firstName: string): Promise<void> {
    const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:5173');
    const setupLink = `${frontendUrl}/reset-password?token=${setupToken}`;
    const logoUrl = this.configService.get('LOGO_URL', 'https://res.cloudinary.com/dcbsqeglq/image/upload/f_auto,q_auto/full-logo_i43nwd');

    const html = getWelcomeTemplate({ firstName, setupLink, logoUrl });

    await this.transporter.sendMail({
      from: this.configService.get('MAIL_FROM', '"Seeman Auto" <seeman.notifications@gmail.com>'),
      to,
      subject: 'Welcome to Seeman Auto — Set Your Password',
      html,
    });
  }
}

export default WelcomeMailer;
