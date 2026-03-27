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

function buildText(messages: Message[]) {
  const recipientNames = dedupeRecipientNames(messages);
  const sender = messages[0]?.sender;

  const lines = [
    'Here is the copy of the message you requested from democracy.io.',
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
  });

  logger.info(
    `[Email Copy] Sent message copy to ${to} for ${messages.length} congressional message(s)`,
  );
}
