import { Resend } from "resend";
import { escapeHtml } from "../utils.js";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendContactEmail = async ({
                                           name,
                                           email,
                                           phone,
                                           subject,
                                           message,
                                       }) => {
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safePhone = escapeHtml(phone || "-");
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message);

    await resend.emails.send({
        from: process.env.MAIL_FROM,
        to: process.env.SERVICE_MAIL,
        replyTo: email,
        subject: `[Contact Form] ${subject}`,
        text: `
New contact form submission

Name: ${name}
Email: ${email}
Phone: ${phone || "-"}
Subject: ${subject}

Message:
${message}
        `.trim(),
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Contact Form Submission</title>
</head>
<body style="margin:0; padding:24px; background-color:#f5f5f5; font-family:Arial, Helvetica, sans-serif; color:#111111;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="max-width:640px; width:100%; background:#ffffff; border-radius:12px; overflow:hidden; border:1px solid #e5e7eb;">
          <tr>
            <td style="background:#20487a; padding:24px 28px; text-align:center;">
              <h1 style="margin:0; font-size:24px; color:#ffffff;">New Contact Message</h1>
              <p style="margin:8px 0 0; font-size:14px; color:#e6edf5;">
                A new message was submitted through your website contact form.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:28px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse; background:#fafafa; border:1px solid #e5e7eb; border-radius:10px;">
                <tr>
                  <td style="padding:12px 16px; font-size:14px; color:#444444; width:140px;">Name</td>
                  <td style="padding:12px 16px; font-size:14px; color:#111111; font-weight:bold;">${safeName}</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px; font-size:14px; color:#444444; border-top:1px solid #e5e7eb;">Email</td>
                  <td style="padding:12px 16px; font-size:14px; color:#111111; border-top:1px solid #e5e7eb;">
                    <a href="mailto:${safeEmail}" style="color:#991b1b; text-decoration:none; font-weight:bold;">${safeEmail}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 16px; font-size:14px; color:#444444; border-top:1px solid #e5e7eb;">Phone</td>
                  <td style="padding:12px 16px; font-size:14px; color:#111111; border-top:1px solid #e5e7eb;">${safePhone}</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px; font-size:14px; color:#444444; border-top:1px solid #e5e7eb;">Subject</td>
                  <td style="padding:12px 16px; font-size:14px; color:#111111; border-top:1px solid #e5e7eb;">${safeSubject}</td>
                </tr>
              </table>

              <div style="margin-top:24px;">
                <h2 style="margin:0 0 10px; font-size:18px; color:#111111;">Message</h2>
                <div style="padding:16px; background:#fafafa; border:1px solid #e5e7eb; border-radius:10px; font-size:14px; line-height:1.7; color:#222222; white-space:pre-wrap;">${safeMessage}</div>
              </div>

              <div style="margin-top:24px; text-align:center;">
                <a
                  href="mailto:${safeEmail}?subject=${encodeURIComponent(`Re: ${subject}`)}"
                  style="display:inline-block; padding:12px 20px; background-color:#20487a; color:#ffffff; text-decoration:none; font-size:14px; font-weight:bold; border-radius:8px;"
                >
                  Reply to Sender
                </a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `,
    });
};
