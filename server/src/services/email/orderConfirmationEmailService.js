import { mailTransport } from "./mailTransport.js";

export const sendOrderConfirmationEmail = async ({
                                                     to,
                                                     orderId,
                                                     pdfBuffer,
                                                 }) => {
    await mailTransport.sendMail({
        from: process.env.MAIL_FROM,
        to,
        subject: `Order Confirmation ${orderId}`,
        text: `Thank you for your order. Your order confirmation PDF is attached.`,
        html: `
			<p>Thank you for your order.</p>
			<p>Your order confirmation PDF is attached to this email.</p>
			<p><strong>Order ID:</strong> ${orderId}</p>
		`,
        attachments: [
            {
                filename: `order-confirmation-${orderId}.pdf`,
                content: pdfBuffer,
                contentType: "application/pdf",
            },
        ],
    });
};
