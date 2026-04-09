import { mailTransport } from "./mailTransport.js";
import { formatEur, formatIdr } from "../utils.js";

export const sendOrderConfirmationEmail = async ({
                                                     to,
                                                     orderId,
                                                     pdfBuffer,
                                                     customerName,
                                                     itemsCount,
                                                     totalAmountEUR,
                                                     totalAmountIDR,
                                                 }) => {
    await mailTransport.sendMail({
        from: process.env.SERVICE_MAIL,
        to,
        subject: `Your Order Confirmation #${orderId}`,
        text: `
Hello${customerName ? ` ${customerName}` : ""},

Thank you for your order.

Your order confirmation PDF is attached to this email.

Order details:
- Order ID: ${orderId}
- Total shipments: ${itemsCount}
${totalAmountEUR ? `- Total amount (EUR): ${formatEur(totalAmountEUR)}` : ""}
${totalAmountIDR ? `- Total amount (IDR): ${formatIdr(totalAmountIDR)}` : ""}

Next steps:
1. Please review the attached PDF carefully and keep this email for your records.
2. Our team will review your payment details.
3. We’ll confirm your shipment schedule as we process your order.
4. You’ll receive updates if we need additional information or when your order status changes.

If you have any questions, contact us at diontransport@hotmail.com.

Thank you for choosing us.
        `.trim(),
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Order Confirmation</title>
</head>
<body style="margin:0; padding:0; background-color:#e6edf5; font-family:Arial, Helvetica, sans-serif; color:#111111;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#e6edf5; margin:0; padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="max-width:640px; width:100%; background:#ffffff; border-radius:14px; overflow:hidden; box-shadow:0 4px 14px rgba(15, 33, 55, 0.12);">
          
          <tr>
            <td style="background:linear-gradient(135deg, #20487a, #1a3b64); padding:28px 32px; text-align:center;">
              <h1 style="margin:0; font-size:28px; line-height:1.2; color:#ffffff;">Order Confirmed</h1>
              <p style="margin:10px 0 0; font-size:15px; color:#e6edf5;">
                Thank you for your order. We’ve received it successfully.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 16px; font-size:16px; color:#111111;">
                Hello${customerName ? ` <strong style="color:#111111;">${customerName}</strong>` : ""},
              </p>

              <p style="margin:0 0 20px; font-size:15px; line-height:1.7; color:#222222;">
                Thank you for your order. Your order confirmation PDF is attached to this email.
                Please keep it for your records.
              </p>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse; margin:24px 0; background:#fafafa; border:1px solid #d9e2ec; border-radius:10px;">
                <tr>
                  <td colspan="2" style="padding:16px 20px; font-size:16px; font-weight:bold; color:#111111; border-bottom:1px solid #d9e2ec; background:#f3f6fa;">
                    Order Summary
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 20px; font-size:14px; color:#444444;">Order ID</td>
                  <td style="padding:12px 20px; font-size:14px; color:#111111; font-weight:bold;">${orderId}</td>
                </tr>
                ${
            itemsCount !== undefined && itemsCount !== null
                ? `
                <tr>
                  <td style="padding:12px 20px; font-size:14px; color:#444444; border-top:1px solid #d9e2ec;">Total Shipments</td>
                  <td style="padding:12px 20px; font-size:14px; color:#111111; border-top:1px solid #d9e2ec;">${itemsCount}</td>
                </tr>`
                : ""
        }
                ${
            totalAmountEUR
                ? `
                <tr>
                  <td style="padding:12px 20px; font-size:14px; color:#444444; border-top:1px solid #d9e2ec;">Total Euro</td>
                  <td style="padding:12px 20px; font-size:14px; color:#111111; font-weight:bold; border-top:1px solid #d9e2ec;">${formatEur(totalAmountEUR)}</td>
                </tr>`
                : ""
        }
                ${
            totalAmountIDR
                ? `
                <tr>
                  <td style="padding:12px 20px; font-size:14px; color:#444444; border-top:1px solid #d9e2ec;">Total Rupiah</td>
                  <td style="padding:12px 20px; font-size:14px; color:#111111; font-weight:bold; border-top:1px solid #d9e2ec;">${formatIdr(totalAmountIDR)}</td>
                </tr>`
                : ""
        }
              </table>

              <div style="margin:24px 0; padding:20px; background:#f8f9fb; border-left:4px solid #991b1b; border-radius:10px;">
                <h2 style="margin:0 0 12px; font-size:18px; color:#111111;">What happens next?</h2>
                <ol style="margin:0; padding-left:20px; color:#222222; font-size:14px; line-height:1.8;">
                  <li>Please review the attached PDF carefully and keep this email for your records.</li>
                  <li>Our team will review your payment details.</li>
                  <li>We’ll confirm your shipment schedule as we process your order.</li>
                  <li>You’ll receive updates if we need additional information or when your order status changes.</li>
                </ol>
              </div>

              <p style="margin:0 0 14px; font-size:14px; line-height:1.7; color:#222222;">
                If you notice anything incorrect in your order details, please contact us as soon as possible.
              </p>

              <p style="margin:0; font-size:14px; color:#222222;">
                Need help? Reach us at
                <a href="mailto:diontransport@hotmail.com" style="color:#991b1b; text-decoration:none; font-weight:bold;">diontransport@hotmail.com</a>.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:20px 32px; background:#fafafa; border-top:1px solid #d9e2ec; text-align:center;">
              <p style="margin:0; font-size:12px; color:#666666;">
                This is an automated confirmation email. Please keep it for your records.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `,
        attachments: [
            {
                filename: `INDOEROPA-order-confirmation-${orderId}.pdf`,
                content: pdfBuffer,
                contentType: "application/pdf",
            },
        ],
    });
};
