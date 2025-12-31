import nodemailer from 'nodemailer';
import { CONTACT_EMAIL, SITE_NAME } from './constants';

// Configure email transporter
// For production, use a service like SendGrid, Resend, or AWS SES
// For now, using Gmail SMTP (user needs to configure app password)
const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER || CONTACT_EMAIL,
        pass: process.env.SMTP_PASSWORD || '', // App password required
    },
});

export interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
    try {
        // Skip email if no SMTP password configured (development mode)
        if (!process.env.SMTP_PASSWORD) {
            console.log('⚠️ Email not sent (SMTP not configured):', options.subject);
            return true; // Return success to not break the flow
        }

        await transporter.sendMail({
            from: `"${SITE_NAME}" <${CONTACT_EMAIL}>`,
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html,
        });

        console.log('✅ Email sent successfully to:', options.to);
        return true;
    } catch (error) {
        console.error('❌ Email sending failed:', error);
        return false;
    }
}

export async function sendContactNotification(data: {
    name: string;
    email: string;
    subject: string;
    message: string;
    ip_address?: string;
}): Promise<boolean> {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2563EB 0%, #1E40AF 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
        .field { margin-bottom: 20px; }
        .label { font-weight: bold; color: #1f2937; margin-bottom: 5px; }
        .value { background: white; padding: 10px; border-radius: 4px; border: 1px solid #d1d5db; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0;">🔔 New Contact Form Submission</h2>
        </div>
        <div class="content">
          <div class="field">
            <div class="label">Name:</div>
            <div class="value">${data.name}</div>
          </div>
          <div class="field">
            <div class="label">Email:</div>
            <div class="value"><a href="mailto:${data.email}">${data.email}</a></div>
          </div>
          <div class="field">
            <div class="label">Subject:</div>
            <div class="value">${data.subject}</div>
          </div>
          <div class="field">
            <div class="label">Message:</div>
            <div class="value">${data.message.replace(/\n/g, '<br>')}</div>
          </div>
          ${data.ip_address ? `
          <div class="field">
            <div class="label">IP Address:</div>
            <div class="value">${data.ip_address}</div>
          </div>
          ` : ''}
          <div class="footer">
            <p>Received at ${new Date().toLocaleString()}</p>
            <p>${SITE_NAME} Contact System</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

    return sendEmail({
        to: CONTACT_EMAIL,
        subject: `[${SITE_NAME}] New Contact: ${data.subject}`,
        html,
        text: `New contact form submission from ${data.name} (${data.email})\n\nSubject: ${data.subject}\n\nMessage:\n${data.message}`,
    });
}

export async function sendConfirmationEmail(data: {
    name: string;
    email: string;
    subject: string;
}): Promise<boolean> {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2563EB 0%, #1E40AF 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
        .button { display: inline-block; background: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">✅ Message Received!</h1>
        </div>
        <div class="content">
          <p>Hi ${data.name},</p>
          <p>Thank you for contacting <strong>${SITE_NAME}</strong>. We have received your message regarding "<strong>${data.subject}</strong>" and will get back to you as soon as possible.</p>
          <p>Our typical response time is within 24-48 hours during business days.</p>
          <p>In the meantime, feel free to explore our PDF tools:</p>
          <div style="text-align: center;">
            <a href="https://quickpdftools.in" class="button">Visit ${SITE_NAME}</a>
          </div>
          <p>If you have any urgent concerns, please don't hesitate to reach out again.</p>
          <p>Best regards,<br><strong>${SITE_NAME} Team</strong></p>
          <div class="footer">
            <p>This is an automated confirmation email. Please do not reply directly to this message.</p>
            <p>&copy; ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

    return sendEmail({
        to: data.email,
        subject: `Thank you for contacting ${SITE_NAME}`,
        html,
        text: `Hi ${data.name},\n\nThank you for contacting ${SITE_NAME}. We have received your message regarding "${data.subject}" and will get back to you as soon as possible.\n\nBest regards,\n${SITE_NAME} Team`,
    });
}
