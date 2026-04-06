import nodemailer from 'nodemailer';
import { config } from '../config.js';
import { logger } from '../logger.js';
import type { Message } from '../types.js';

let transporter: nodemailer.Transporter | null = null;

export class MessageCopyServiceError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.name = 'MessageCopyServiceError';
    this.statusCode = statusCode;
  }
}

function validateEmailCopyConfig() {
  const hasTransport =
    Boolean(config.emailCopy.smtpUrl) || Boolean(config.emailCopy.smtpHost);

  if (!hasTransport) {
    throw new MessageCopyServiceError(
      'Message copy email is not configured.',
      503,
    );
  }

  if (!config.emailCopy.fromAddress) {
    throw new MessageCopyServiceError(
      'Message copy email sender address is not configured.',
      503,
    );
  }
}

function getTransport() {
  if (transporter) {
    return transporter;
  }

  validateEmailCopyConfig();

  transporter = config.emailCopy.smtpUrl
    ? nodemailer.createTransport(config.emailCopy.smtpUrl)
    : nodemailer.createTransport({
        host: config.emailCopy.smtpHost,
        port: config.emailCopy.smtpPort,
        secure: config.emailCopy.smtpSecure,
        auth: config.emailCopy.smtpUser
          ? {
              user: config.emailCopy.smtpUser,
              pass: config.emailCopy.smtpPass,
            }
          : undefined,
      });

  return transporter;
}

function dedupeRecipientNames(messages: Message[]) {
  return Array.from(
    new Set(messages.map((message) => message.recipientName || message.bioguideId)),
  );
}

function buildSubject(messages: Message[]) {
  const baseSubject = messages[0]?.subject?.trim() || 'Your message';
  return `Copy of your democracy.io message: ${baseSubject}`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatMessageBodyHtml(value: string) {
  return escapeHtml(value).replaceAll('\n', '<br />');
}

function buildText(messages: Message[]) {
  const recipientNames = dedupeRecipientNames(messages);
  const sender = messages[0]?.sender;

  const lines = [
    'Here is the copy of the message you requested from democracy.io.',
    'Please do not reply to this email.',
    '',
    'Sent to:',
    ...recipientNames.map((name) => `- ${name}`),
    '',
    sender
      ? `Submitted by: ${sender.firstName} ${sender.lastName} <${sender.email}>`
      : '',
    '',
    ...messages.flatMap((message, index) => {
      const sectionHeader = message.recipientName || `Recipient ${index + 1}`;
      return [
        `${sectionHeader}`,
        `Subject: ${message.subject}`,
        '',
        message.message,
        '',
      ];
    }),
  ].filter(Boolean);

  return lines.join('\n');
}

function buildSectionHtml(message: Message, index: number) {
  const sectionHeader = escapeHtml(
    message.recipientName || `Recipient ${index + 1}`,
  );
  const subject = escapeHtml(message.subject);
  const body = formatMessageBodyHtml(message.message);

  return `
    <tr>
      <td style="padding: 0 0 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse: collapse; background: #ffffff; border-radius: 5px; border: 1px solid #e6e6e6;">
          <tr>
            <td style="height: 5px; background: #f85628; font-size: 0; line-height: 0;">&nbsp;</td>
            <td style="height: 5px; width: 34%; background: #F93469; font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding: 24px 24px 16px;">
              <div style="font-family: Arial, sans-serif; font-size: 12px; line-height: 18px; letter-spacing: 0.15em; text-transform: uppercase; color: #777777; margin-bottom: 6px;">Message to</div>
              <div style="font-family: Georgia, 'Times New Roman', serif; font-size: 28px; line-height: 34px; color: #444444; margin-bottom: 18px;">${sectionHeader}</div>
              <div style="font-family: Arial, sans-serif; font-size: 12px; line-height: 18px; letter-spacing: 0.15em; text-transform: uppercase; color: #777777; margin-bottom: 6px;">Subject</div>
              <div style="font-family: Arial, sans-serif; font-size: 18px; line-height: 27px; font-weight: 600; color: #444444; margin-bottom: 22px;">${subject}</div>
              <div style="font-family: Arial, sans-serif; font-size: 18px; line-height: 31px; color: #444444; white-space: normal;">${body}</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;
}

function buildHtml(messages: Message[]) {
  const sender = messages[0]?.sender;
  const recipientNames = dedupeRecipientNames(messages)
    .map((name) =>
      `<span style="display: inline-block; margin: 0 8px 8px 0; padding: 7px 10px; border-radius: 999px; background: #FFEFEF; color: #f85628; font-family: Arial, sans-serif; font-size: 13px; line-height: 18px; font-weight: 600;">${escapeHtml(name)}</span>`,
    )
    .join('');
  const submittedBy = sender
    ? `${escapeHtml(sender.firstName)} ${escapeHtml(sender.lastName)} &lt;${escapeHtml(sender.email)}&gt;`
    : '';
  const previewText = escapeHtml(
    `Your democracy.io message copy for ${dedupeRecipientNames(messages).join(', ')}`,
  );
  const sections = messages
    .map((message, index) => buildSectionHtml(message, index))
    .join('');

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(buildSubject(messages))}</title>
  </head>
  <body style="margin: 0; padding: 0; background: #eeeeee;">
    <div style="display: none; max-height: 0; overflow: hidden; opacity: 0; mso-hide: all;">
      ${previewText}
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse: collapse; background: #eeeeee;">
      <tr>
        <td align="center" style="padding: 32px 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse: collapse; max-width: 720px;">
            <tr>
              <td style="padding: 0 0 20px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse: collapse; background: #ffffff; border-radius: 5px;">
                  <tr>
                    <td style="height: 5px; background: #FF8900; font-size: 0; line-height: 0;">&nbsp;</td>
                    <td style="height: 5px; width: 34%; background: #F93469; font-size: 0; line-height: 0;">&nbsp;</td>
                  </tr>
                  <tr>
                    <td style="padding: 28px 28px 24px;">
                      <div style="font-family: Arial, sans-serif; font-size: 12px; line-height: 18px; letter-spacing: 0.15em; text-transform: uppercase; color: #777777; margin-bottom: 10px;">democracy.io</div>
                      <div style="font-family: Georgia, 'Times New Roman', serif; font-size: 40px; line-height: 44px; color: #444444; margin-bottom: 12px;">Your message copy</div>
                      <div style="font-family: Arial, sans-serif; font-size: 18px; line-height: 28px; color: #444444;">Here is the copy of the message you requested from democracy.io.</div>
                      <div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 22px; color: #777777; margin-top: 10px;">Please do not reply to this email.</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding: 0 0 20px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse: collapse; background: #ffffff; border-radius: 5px; border: 1px solid #e6e6e6;">
                  <tr>
                    <td style="height: 5px; background: #f85628; font-size: 0; line-height: 0;">&nbsp;</td>
                    <td style="height: 5px; width: 34%; background: #F93469; font-size: 0; line-height: 0;">&nbsp;</td>
                  </tr>
                  <tr>
                    <td style="padding: 24px;">
                      <div style="font-family: Arial, sans-serif; font-size: 12px; line-height: 18px; letter-spacing: 0.15em; text-transform: uppercase; color: #777777; margin-bottom: 10px;">Sent to</div>
                      <div style="margin-bottom: 18px;">${recipientNames}</div>
                      <div style="font-family: Arial, sans-serif; font-size: 12px; line-height: 18px; letter-spacing: 0.15em; text-transform: uppercase; color: #777777; margin-bottom: 6px;">Submitted by</div>
                      <div style="font-family: Arial, sans-serif; font-size: 16px; line-height: 24px; color: #444444;">${submittedBy}</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            ${sections}
            <tr>
              <td style="padding: 4px 12px 0;">
                <div style="font-family: Arial, sans-serif; font-size: 12px; line-height: 18px; color: #777777; text-align: center;">
                  This is a copy of the message submitted through democracy.io. Please do not reply to this email.
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function getRecipientEmail(messages: Message[]) {
  const senderEmails = Array.from(
    new Set(messages.map((message) => message.sender.email.trim()).filter(Boolean)),
  );

  if (senderEmails.length !== 1) {
    throw new MessageCopyServiceError(
      'Message copy requests must contain exactly one sender email address.',
      400,
    );
  }

  return senderEmails[0];
}

export async function sendMessageCopy(messages: Message[]) {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new MessageCopyServiceError(
      'At least one message is required to send an email copy.',
      400,
    );
  }

  const to = getRecipientEmail(messages);
  const from = config.emailCopy.fromName
    ? `"${config.emailCopy.fromName}" <${config.emailCopy.fromAddress}>`
    : config.emailCopy.fromAddress;

  await getTransport().sendMail({
    to,
    from,
    subject: buildSubject(messages),
    text: buildText(messages),
    html: buildHtml(messages),
  });

  logger.info(
    `[Email Copy] Sent message copy to ${to} for ${messages.length} congressional message(s)`,
  );
}
