const sgMail = require('@sendgrid/mail');

// Set SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (to, subject, html, text = null) => {
  try {
    console.log(`Attempting to send email to: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Using SendGrid API key: ${process.env.SENDGRID_API_KEY ? 'Set' : 'Not set'}`);
    console.log(`From email: ${process.env.SENDGRID_SENDER}`);

    const msg = {
      to: to,
      from: process.env.SENDGRID_SENDER,
      subject: subject,
      html: html,
      text: text || html.replace(/<[^>]*>/g, '') // Strip HTML for text version
    };

    const result = await sgMail.send(msg);
    console.log('Email sent successfully:', result[0].statusCode);
    return { success: true, messageId: result[0].headers['x-message-id'] };
  } catch (error) {
    console.error('SendGrid Error:', error);
    if (error.response) {
      console.error('Error body:', error.response.body);
    }
    return { success: false, error: error.message };
  }
};

const sendVerificationEmail = async (email, name, verificationToken) => {
  const subject = 'Verify Your Email - Secure File Share';
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verification</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #007bff; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f8f9fa; }
        .button { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Secure File Share!</h1>
        </div>
        <div class="content">
          <h2>Hello ${name}!</h2>
          <p>Thank you for registering with Secure File Share. To complete your registration, please verify your email address by clicking the button below:</p>
          <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
          </div>
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 4px;">${verificationUrl}</p>
          <p><strong>This verification link will expire in 24 hours.</strong></p>
          <p>If you didn't create an account with us, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>© 2025 Secure File Share. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail(email, subject, html);
};

const sendPasswordResetEmail = async (email, name, resetToken) => {
  const subject = 'Reset Your Password - Secure File Share';
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc3545; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f8f9fa; }
        .button { display: inline-block; padding: 12px 24px; background: #dc3545; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <h2>Hello ${name}!</h2>
          <p>You have requested to reset your password for your Secure File Share account. Click the button below to reset your password:</p>
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </div>
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 4px;">${resetUrl}</p>
          <p><strong>This reset link will expire in 1 hour.</strong></p>
          <p>If you didn't request this password reset, please ignore this email and your password will remain unchanged.</p>
        </div>
        <div class="footer">
          <p>© 2025 Secure File Share. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail(email, subject, html);
};

const sendFileShareNotification = async (email, name, fileName, sharedBy) => {
  const subject = 'File Shared With You - Secure File Share';
  const loginUrl = `${process.env.FRONTEND_URL}/login`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>File Shared</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #28a745; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f8f9fa; }
        .button { display: inline-block; padding: 12px 24px; background: #28a745; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>File Shared With You!</h1>
        </div>
        <div class="content">
          <h2>Hello ${name}!</h2>
          <p><strong>${sharedBy}</strong> has shared a file with you on Secure File Share:</p>
          <div style="background: #e9ecef; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <h3 style="margin: 0; color: #007bff;">📁 ${fileName}</h3>
          </div>
          <p>Log in to your account to access this file:</p>
          <div style="text-align: center;">
            <a href="${loginUrl}" class="button">Access File</a>
          </div>
          <p>If you don't have an account, you can register at: <a href="${process.env.FRONTEND_URL}/register">${process.env.FRONTEND_URL}/register</a></p>
        </div>
        <div class="footer">
          <p>© 2025 Secure File Share. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail(email, subject, html);
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendFileShareNotification
};
