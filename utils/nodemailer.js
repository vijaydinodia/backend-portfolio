import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Configure the transport using the new EMAIL_USER and EMAIL_PASS variables
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendContactEmail = async (name, email, subject, message) => {
  try {
    const mailOptions = {
      from: `"${name} (Portfolio)" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to yourself
      replyTo: email,
      subject: `Portfolio Contact: ${subject}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border-radius: 12px; background-color: #ffffff; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #111827; margin: 0; font-size: 24px;">New Contact Message</h2>
            <p style="color: #6b7280; margin-top: 5px; font-size: 14px;">You have received a new message from your portfolio.</p>
          </div>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0 0 12px 0; color: #374151; font-size: 15px;"><strong>From:</strong> ${name}</p>
            <p style="margin: 0 0 12px 0; color: #374151; font-size: 15px;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a></p>
            <p style="margin: 0; color: #374151; font-size: 15px;"><strong>Subject:</strong> ${subject}</p>
          </div>

          <div style="padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #ffffff;">
            <h3 style="margin: 0 0 10px 0; color: #4b5563; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Message</h3>
            <p style="color: #1f2937; line-height: 1.6; margin: 0; white-space: pre-wrap; font-size: 15px;">${message}</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">This email was automatically generated from your Portfolio Contact Form.</p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

export default sendContactEmail;
