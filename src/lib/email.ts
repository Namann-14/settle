import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail(options: EmailOptions) {
  if (!resend) {
    throw new Error("Email service not configured - missing RESEND_API_KEY");
  }

  const { to, subject, html, from = "Settle <noreply@resend.dev>" } = options;

  try {
    const result = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });

    if (result.error) {
      console.error("Email sending failed:", result.error);
      throw new Error(`Failed to send email: ${result.error.message || 'Unknown error'}`);
    }

    console.log("✅ Email sent successfully:", result.data?.id);
    return result.data;
  } catch (error) {
    console.error("Email service error:", error);
    throw error;
  }
}

export function createInvitationEmailHtml(params: {
  inviterName: string;
  groupName: string;
  invitationUrl: string;
  expiresAt: Date;
}) {
  const { inviterName, groupName, invitationUrl, expiresAt } = params;
  
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fafafa;">
      <div style="background-color: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border: 1px solid #e5e7eb;">
        
        <!-- Logo Section -->
        <div style="text-align: center; margin-bottom: 32px; padding-bottom: 16px; border-bottom: 1px solid #f1f3f4;">
          <h1 style="color: #3ecf8e; margin: 0 0 4px 0; font-size: 24px; font-weight: bold; letter-spacing: -0.5px;">
            Settle
          </h1>
          <p style="color: #6b7280; margin: 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
            Expense Splitting Made Simple
          </p>
        </div>
        
        <!-- Main Content -->
        <div style="text-align: center; margin-bottom: 32px;">
          <h2 style="color: #1c1c1c; margin: 0 0 24px 0; font-size: 28px; font-weight: bold; background: linear-gradient(135deg, #3ecf8e, #10b981); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
            You're invited to join a group!
          </h2>
        </div>
        
        <p style="color: #1c1c1c; font-size: 16px; line-height: 26px; margin-bottom: 24px;">
          <strong>${inviterName}</strong> has invited you to join the group 
          <strong>"${groupName}"</strong> on Settle to help manage and split expenses together.
        </p>
        
        <!-- Feature Highlight Box -->
        <div style="background-color: #f8f9fa; border: 1px solid #e5e7eb; border-left: 4px solid #3ecf8e; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <div style="color: #1c1c1c; font-size: 14px; line-height: 24px;">
            🎯 Track shared expenses<br/>
            💰 Split costs fairly<br/>
            📊 See who owes what<br/>
            ⚡ Settle up easily
          </div>
        </div>
        
        <!-- CTA Button -->
        <div style="text-align: center; margin: 32px 0;">
          <a href="${invitationUrl}" 
             style="display: inline-block; background-color: #3ecf8e; color: white; padding: 14px 32px; 
                    text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 16px;
                    box-shadow: 0 4px 14px 0 rgba(62, 207, 142, 0.25);">
            Accept Invitation
          </a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; line-height: 22px; margin-bottom: 32px; text-align: center;">
          This invitation will expire on <strong>${expiresAt.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</strong>. If you don't want to join this group, you can safely ignore this email.
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">
        
        <div style="color: #6b7280; font-size: 12px; line-height: 18px;">
          <p style="margin-bottom: 8px;">
            If you're having trouble clicking the button, copy and paste this URL into your browser:
          </p>
          <p style="color: #3ecf8e; word-break: break-all; margin-bottom: 16px;">
            ${invitationUrl}
          </p>
          <p style="margin: 0;">
            This invitation was sent by Settle, your expense splitting companion.
          </p>
        </div>
      </div>
    </div>
  `;
}
