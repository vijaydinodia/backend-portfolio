import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();

const ADMIN_NOTIFICATION_EMAIL = 'vijaydinodia548@gmail.com';

const escapeHtml = (value = '') =>
  String(value).replace(/[&<>"']/g, (char) => {
    const entities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };

    return entities[char];
  });

const cleanHeaderText = (value = '') => String(value).replace(/[\r\n]+/g, ' ').trim();

const getMailConfig = () => {
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_USER || ADMIN_NOTIFICATION_EMAIL;
  const toEmail =
    process.env.ADMIN_NOTIFICATION_EMAIL ||
    process.env.CONTACT_TO_EMAIL ||
    process.env.SENDGRID_TO_EMAIL ||
    ADMIN_NOTIFICATION_EMAIL;

  if (!apiKey || !fromEmail) {
    return null;
  }

  return { apiKey, fromEmail, toEmail };
};

const formatReceivedAt = (value) => {
  if (!value) return 'Just now';

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  }).format(new Date(value));
};

const sendContactEmail = async (contactMessage, options = {}) => {
  const mailConfig = getMailConfig();

  if (!mailConfig) {
    console.warn('SendGrid email skipped: configure SENDGRID_API_KEY and SENDGRID_FROM_EMAIL.');
    return false;
  }

  const { name, email, subject, message, createdAt, _id } = contactMessage;
  const senderName = cleanHeaderText(name) || 'Portfolio Visitor';
  const cleanSubject = cleanHeaderText(subject) || 'Portfolio message';
  const receivedAt = formatReceivedAt(createdAt);
  const adminMessageUrl = options.adminMessageUrl || '';

  const safeName = escapeHtml(senderName);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(cleanSubject);
  const safeMessage = escapeHtml(message);
  const safeReceivedAt = escapeHtml(receivedAt);
  const safeAdminMessageUrl = escapeHtml(adminMessageUrl);
  const safeMessageId = escapeHtml(_id || '');

  try {
    sgMail.setApiKey(mailConfig.apiKey);

    const [response] = await sgMail.send({
      to: mailConfig.toEmail,
      from: {
        email: mailConfig.fromEmail,
        name: 'Vijay Portfolio',
      },
      replyTo: {
        email,
        name: senderName,
      },
      subject: `${senderName} sent you a message`,
      text: `${senderName} sent you a message from your portfolio.

From: ${name}
Email: ${email}
Subject: ${subject}
Received: ${receivedAt}
Message ID: ${_id || 'N/A'}

Message:
${message}

Open in admin:
${adminMessageUrl || 'Admin link unavailable'}
`,
      html: `
        <div style="margin:0; padding:0; background:#f3f4f6;">
          <div style="display:none; max-height:0; overflow:hidden; opacity:0;">
            ${safeName} sent you a portfolio message about ${safeSubject}.
          </div>

          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 32px 16px;">
            <div style="background:#ffffff; border:1px solid #e5e7eb; border-radius:14px; overflow:hidden; box-shadow:0 10px 30px rgba(15,23,42,0.08);">
              <div style="background:#111827; padding:28px 30px;">
                <p style="margin:0 0 8px 0; color:#93c5fd; font-size:12px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase;">Portfolio Contact</p>
                <h1 style="margin:0; color:#ffffff; font-size:24px; line-height:1.3;">${safeName} sent you a message</h1>
                <p style="margin:10px 0 0 0; color:#d1d5db; font-size:14px;">Received ${safeReceivedAt}</p>
              </div>

              <div style="padding:28px 30px;">
                <div style="background:#f9fafb; border:1px solid #e5e7eb; border-radius:10px; padding:18px; margin-bottom:22px;">
                  <p style="margin:0 0 10px 0; color:#374151; font-size:15px;"><strong>From:</strong> ${safeName}</p>
                  <p style="margin:0 0 10px 0; color:#374151; font-size:15px;"><strong>Email:</strong> <a href="mailto:${safeEmail}" style="color:#2563eb; text-decoration:none;">${safeEmail}</a></p>
                  <p style="margin:0; color:#374151; font-size:15px;"><strong>Subject:</strong> ${safeSubject}</p>
                </div>

                <div style="border-left:4px solid #2563eb; background:#ffffff; padding:2px 0 2px 16px; margin-bottom:24px;">
                  <h2 style="margin:0 0 10px 0; color:#111827; font-size:16px;">Message</h2>
                  <p style="margin:0; color:#1f2937; font-size:15px; line-height:1.7; white-space:pre-wrap;">${safeMessage}</p>
                </div>

                ${
                  adminMessageUrl
                    ? `<div style="text-align:center; margin:30px 0 8px;">
                        <a href="${safeAdminMessageUrl}" style="display:inline-block; background:#2563eb; color:#ffffff; text-decoration:none; font-weight:700; font-size:14px; padding:13px 22px; border-radius:999px;">Open Message in Admin</a>
                      </div>
                      <p style="margin:12px 0 0 0; color:#6b7280; font-size:12px; text-align:center;">This secure link opens the Messages tab. Login is still required if you are not signed in.</p>`
                    : ''
                }
              </div>

              <div style="background:#f9fafb; border-top:1px solid #e5e7eb; padding:16px 30px; text-align:center;">
                <p style="margin:0; color:#9ca3af; font-size:12px;">Message ID: ${safeMessageId}</p>
              </div>
            </div>
          </div>
        </div>
      `,
    });

    console.log('SendGrid message sent: %s', response?.headers?.['x-message-id'] || response?.statusCode);
    return true;
  } catch (error) {
    console.error('Error sending SendGrid email:', error);
    return false;
  }
};

export default sendContactEmail;
