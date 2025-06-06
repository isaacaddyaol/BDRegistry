import { Resend } from 'resend';

// Make email service optional
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendVerificationEmail(email: string, token: string) {
  if (!resend) {
    console.log('Email service not configured - skipping verification email');
    return;
  }

  try {
    await resend.emails.send({
      from: 'noreply@registry.gov.gh',
      to: email,
      subject: 'Verify your email',
      html: `Click <a href="${process.env.APP_URL}/verify?token=${token}">here</a> to verify your email`
    });
  } catch (error) {
    console.error('Failed to send verification email:', error);
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  if (!resend) {
    console.log('Email service not configured - skipping password reset email');
    return;
  }

  try {
    await resend.emails.send({
      from: 'noreply@registry.gov.gh',
      to: email,
      subject: 'Reset your password',
      html: `Click <a href="${process.env.APP_URL}/reset-password?token=${token}">here</a> to reset your password`
    });
  } catch (error) {
    console.error('Failed to send password reset email:', error);
  }
} 