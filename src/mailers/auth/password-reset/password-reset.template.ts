export interface PasswordResetTemplateData {
  firstName: string;
  resetLink: string;
  logoUrl?: string;
}

export function getPasswordResetTemplate(data: PasswordResetTemplateData): string {
  const { firstName, resetLink, logoUrl } = data;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset - Seeman Auto</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Poppins', Arial, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header with Logo -->
          <tr>
            <td align="center" style="padding: 30px 40px 20px 30px; border-bottom: 1px solid #e5e7eb;">
              ${
                logoUrl
                  ? `<img src="${logoUrl}" alt="Seeman Auto" style="height: 50px; width: auto;">`
                  : `<h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #1e3a5f;">Seeman</h1>`
              }
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; font-size: 22px; font-weight: 600; color: #1e3a5f;">
                Password Reset Request
              </h2>

              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #374151;">
                Hi ${firstName},
              </p>

              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #374151;">
                We received a request to reset your password for your Seeman account.
                Click the button below to create a new password:
              </p>

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${resetLink}"
                       style="display: inline-block; padding: 14px 32px; background-color: #4f46e5; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; border-radius: 6px;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 8px 0; font-size: 13px; line-height: 1.6; color: #6b7280;">
                Or copy and paste this link into your browser:
              </p>

              <p style="margin: 0 0 24px 0; font-size: 13px; line-height: 1.6; color: #4f46e5; word-break: break-all;">
                ${resetLink}
              </p>

              <!-- Warning -->
              <div style="padding: 16px; background-color: #fef2f2; border-radius: 6px; border-left: 4px solid #ef4444;">
                <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #991b1b;">
                  <strong>This link will expire in 30 minutes.</strong><br>
                  If you didn't request a password reset, please ignore this email or contact support if you have concerns.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #6b7280; text-align: center;">
                &copy; ${new Date().getFullYear()} Seeman Seeman Auto & Agro Ind. Ltd.. All rights reserved.
              </p>
              <p style="margin: 8px 0 0 0; font-size: 12px; line-height: 1.5; color: #9ca3af; text-align: center;">
                This is an automated message. Please do not reply to this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}