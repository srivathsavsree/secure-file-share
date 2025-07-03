const sgMail = require('@sendgrid/mail');
require('dotenv').config();

// Set SendGrid API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Send an email using SendGrid
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} text - Plain text content
 * @param {string} html - HTML content (optional)
 */
const sendEmail = async (to, subject, text, html = null) => {
  try {
    const msg = {
      to,
      from: process.env.SENDGRID_SENDER, // Verified sender email
      subject,
      text,
      ...(html && { html })
    };

    await sgMail.send(msg);
    console.log(`Email sent successfully to ${to}`);
    return { success: true };
  } catch (error) {
    console.error('SendGrid email error:', error);
    if (error.response) {
      console.error('SendGrid error details:', error.response.body);
    }
    throw new Error('Failed to send email');
  }
};

/**
 * Send password reset email
 * @param {string} email - User's email
 * @param {string} resetUrl - Password reset URL
 */
const sendPasswordResetEmail = async (email, resetUrl) => {
  const subject = 'Password Reset Request - Secure File Share';
  const text = `
You requested a password reset for your Secure File Share account.

Click the link below to reset your password:
${resetUrl}

This link will expire in 1 hour.

If you did not request this password reset, please ignore this email.

Best regards,
Secure File Share Team
  `;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1976d2;">Password Reset Request</h2>
      <p>You requested a password reset for your Secure File Share account.</p>
      <p>Click the button below to reset your password:</p>
      <a href="${resetUrl}" style="background-color: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 16px 0;">Reset Password</a>
      <p><strong>This link will expire in 1 hour.</strong></p>
      <p>If you did not request this password reset, please ignore this email.</p>
      <hr style="margin: 20px 0;">
      <p style="color: #666; font-size: 14px;">Best regards,<br>Secure File Share Team</p>
    </div>
  `;

  return sendEmail(email, subject, text, html);
};

/**
 * Send file sharing notification email with QR code
 * @param {string} recipientEmail - Recipient's email
 * @param {string} senderName - Sender's name
 * @param {string} fileName - Name of the file
 * @param {string} downloadUrl - Download URL
 * @param {string} decryptionKey - Decryption key
 * @param {string} qrCodeDataUrl - QR code as data URL (optional)
 */
const sendFileShareEmail = async (recipientEmail, senderName, fileName, downloadUrl, decryptionKey, qrCodeDataUrl = null) => {
  const subject = `${senderName} shared a file with you - Secure File Share`;
  
  const text = `
${senderName} has shared a secure file with you: "${fileName}"

Download Link: ${downloadUrl}
Decryption Key: ${decryptionKey}

IMPORTANT:
- This file will expire in 24 hours
- You have a maximum of 3 download attempts
- Keep the decryption key safe - you'll need it to open the file

To download:
1. Click the download link above
2. Enter the decryption key when prompted
3. Save the decrypted file

Best regards,
Secure File Share Team
  `;

  let html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1976d2;">New Secure File Shared</h2>
      <p><strong>${senderName}</strong> has shared a secure file with you:</p>
      <div style="background-color: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <h3 style="margin: 0; color: #333;">📁 ${fileName}</h3>
      </div>
      
      <div style="margin: 20px 0;">
        <a href="${downloadUrl}" style="background-color: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Download File</a>
      </div>
      
      <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 16px; border-radius: 8px; margin: 20px 0;">
        <h4 style="margin-top: 0; color: #856404;">🔑 Decryption Key:</h4>
        <code style="background-color: #f8f9fa; padding: 8px; border-radius: 4px; font-family: monospace; word-break: break-all;">${decryptionKey}</code>
      </div>
  `;

  if (qrCodeDataUrl) {
    html += `
      <div style="text-align: center; margin: 20px 0;">
        <h4>📱 Quick Download (Scan QR Code)</h4>
        <img src="${qrCodeDataUrl}" alt="QR Code for quick download" style="max-width: 200px;">
        <p style="font-size: 14px; color: #666;">Scan with your phone to download directly</p>
      </div>
    `;
  }

  html += `
      <div style="background-color: #d1ecf1; border: 1px solid #bee5eb; padding: 16px; border-radius: 8px; margin: 20px 0;">
        <h4 style="margin-top: 0; color: #0c5460;">⚠️ Important Security Information:</h4>
        <ul style="margin: 0; padding-left: 20px; color: #0c5460;">
          <li>This file will expire in <strong>24 hours</strong></li>
          <li>You have a maximum of <strong>3 download attempts</strong></li>
          <li>Keep the decryption key safe - you'll need it to open the file</li>
          <li>This email is sent from a secure system</li>
        </ul>
      </div>
      
      <hr style="margin: 20px 0;">
      <p style="color: #666; font-size: 14px;">Best regards,<br>Secure File Share Team</p>
    </div>
  `;

  return sendEmail(recipientEmail, subject, text, html);
};

module.exports = {
  sendEmail,
  sendPasswordResetEmail,
  sendFileShareEmail
};
