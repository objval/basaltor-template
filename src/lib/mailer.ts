import nodemailer from "nodemailer";

import { APP_NAME } from "@/lib/app-config";
import { getServerEnv } from "@/lib/env";

let transport: nodemailer.Transporter | null = null;

function getTransport() {
  if (!transport) {
    const env = getServerEnv();
    transport = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      ignoreTLS: env.SMTP_IGNORE_TLS,
    });
  }

  return transport;
}

export async function sendTransactionalEmail(options: {
  to: string;
  subject: string;
  headline: string;
  body: string;
  actionLabel?: string;
  actionUrl?: string;
}) {
  const env = getServerEnv();
  if (env.DISABLE_TRANSACTIONAL_EMAILS) {
    return;
  }

  const transporter = getTransport();

  const actionMarkup = options.actionLabel && options.actionUrl
    ? `<a href="${options.actionUrl}" style="display: inline-block; border: 1px solid #111; padding: 12px 16px; color: #111; text-decoration: none; text-transform: uppercase; letter-spacing: 0.14em; font-size: 12px;">${options.actionLabel}</a>`
    : "";

  const html = `
    <div style="font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace; max-width: 640px; margin: 0 auto; border: 1px solid #111; padding: 24px; background: #fff; color: #111;">
      <p style="letter-spacing: 0.24em; font-size: 12px; text-transform: uppercase; margin: 0 0 16px;">${APP_NAME}</p>
      <h1 style="font-size: 24px; margin: 0 0 12px;">${options.headline}</h1>
      <p style="line-height: 1.7; margin: 0 0 24px;">${options.body}</p>
      ${actionMarkup}
      <p style="font-size: 12px; color: #555; margin-top: 24px;">Mailpit inbox: ${env.MAILPIT_UI_URL}</p>
    </div>
  `;

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to: options.to,
    subject: options.subject,
    html,
  });
}

export async function sendAuthEmail(options: {
  to: string;
  subject: string;
  headline: string;
  body: string;
  actionLabel: string;
  actionUrl: string;
}) {
  return sendTransactionalEmail(options);
}

export async function sendGuestOrderEmail(options: {
  to: string;
  subject: string;
  headline: string;
  body: string;
  actionUrl: string;
  actionLabel?: string;
}) {
  return sendTransactionalEmail({
    ...options,
    actionLabel: options.actionLabel ?? "Open order",
  });
}

export async function sendOtpEmail(options: {
  to: string;
  otp: string;
  type: string;
}) {
  const labels: Record<string, { subject: string; headline: string }> = {
    "sign-in": { subject: "Your sign-in code", headline: "Sign-in code" },
    "email-verification": { subject: "Verify your email", headline: "Verification code" },
    "forget-password": { subject: "Reset your password", headline: "Password reset code" },
    "change-email": { subject: "Confirm email change", headline: "Email change code" },
  };

  const label = labels[options.type] ?? { subject: "Your verification code", headline: "Verification code" };

  const env = getServerEnv();
  if (env.DISABLE_TRANSACTIONAL_EMAILS) {
    return;
  }

  const transporter = getTransport();

  const html = `
    <div style="font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace; max-width: 640px; margin: 0 auto; border: 1px solid #111; padding: 24px; background: #fff; color: #111;">
      <p style="letter-spacing: 0.24em; font-size: 12px; text-transform: uppercase; margin: 0 0 16px;">${APP_NAME}</p>
      <h1 style="font-size: 24px; margin: 0 0 12px;">${label.headline}</h1>
      <p style="line-height: 1.7; margin: 0 0 16px;">Use this code to ${options.type === "sign-in" ? "sign in" : options.type === "email-verification" ? "verify your email" : "reset your password"}:</p>
      <div style="font-size: 32px; letter-spacing: 0.5em; font-weight: bold; text-align: center; padding: 16px 0; border: 1px solid #111; margin: 0 0 16px;">${options.otp}</div>
      <p style="font-size: 13px; color: #555; margin: 0;">This code expires in 5 minutes. If you did not request this, you can safely ignore this email.</p>
    </div>
  `;

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to: options.to,
    subject: label.subject,
    html,
  });
}
