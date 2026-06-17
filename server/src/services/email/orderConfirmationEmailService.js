import { Resend } from "resend";
import {
	escapeHtml,
	formatEmailDate,
	formatEUR,
	formatIDR,
} from "../../utils/formatters.js";

const resend = new Resend(process.env.RESEND_API_KEY);

const renderSmallLine = (value) => `
	<div style="margin-top:4px; font-size:13px; line-height:1.45; color:#555555;">
		${escapeHtml(value || "-")}
	</div>
`;

const renderEmailContactColumn = (title, lines = []) => `
	<td valign="top" width="50%" style="padding:0 10px;">
		<div style="font-size:11px; font-weight:bold; text-transform:uppercase; letter-spacing:0.5px; color:#777777;">
			${escapeHtml(title)}
		</div>
		${lines.map(renderSmallLine).join("")}
	</td>
`;

const renderEmailShipmentItems = (items = []) => {
	if (!Array.isArray(items) || items.length === 0) {
		return `
			<tr>
				<td style="padding:12px 0; font-size:13px; color:#777777;">
					No shipment item details available.
				</td>
			</tr>
		`;
	}

	return items
		.map((item, index) => {
			const itemDetails = [
				escapeHtml(item.packageType || "-"),
				item.quantityLabel ? escapeHtml(item.quantityLabel) : null,
			]
				.filter(Boolean)
				.join(" · ");

			return `
				<tr>
					<td style="padding:12px 0; border-top:1px solid #e5e7eb;">
						<table role="presentation" width="100%" cellspacing="0" cellpadding="0">
							<tr>
								<td valign="top">
									<div style="font-size:14px; font-weight:bold; color:#111111;">
										Shipment ${escapeHtml(item.lineNumber || index + 1)}
									</div>

									<div style="margin-top:5px; font-size:12px; color:#555555;">
										${escapeHtml(item.fromCountry || "-")} → ${escapeHtml(item.toCountry || "-")}
										<span style="display:inline-block; margin-left:6px; padding:2px 7px; border-radius:999px; background:#fff7ed; color:#b45309; font-weight:bold; border:1px solid #fed7aa;">
											${escapeHtml(formatEmailDate(item.shipmentDate))}
										</span>
									</div>

									<div style="margin-top:5px; font-size:12px; color:#555555;">
                                        ${itemDetails}
                                    </div>

									${
										item.priceBreakdown
											? `
												<div style="margin-top:6px; font-size:11px; color:#777777;">
													Price details: ${escapeHtml(item.priceBreakdown)}
												</div>
											`
											: ""
									}
								</td>

								<td valign="top" align="right" style="font-size:14px; font-weight:bold; color:#111111; white-space:nowrap;">
									${formatEUR(item.amountEUR)}
								</td>
							</tr>
						</table>
					</td>
				</tr>
			`;
		})
		.join("");
};

/**
 * @param {SuccessPayload} successPayload
 * @returns {string}
 */
const renderEmailOrderSummary = (successPayload) => {
	const items = successPayload.items || [];
	const itemTotal = items.length || successPayload.itemsCount || 0;

	const dhlAddonPriceEUR = Number(successPayload.dhlAddon?.priceEUR || 0);
	const bubbleWrapPriceEUR = Number(successPayload.bubbleWrapPriceEUR || 0);
	const totalAmountEUR = Number(successPayload.totalAmountEUR || 0);

	const shipmentSubtotalEUR = Math.max(
		totalAmountEUR - dhlAddonPriceEUR - bubbleWrapPriceEUR,
		0,
	);

	const indoLocalDeliveryIsCOD =
		String(successPayload.indoLocalDelivery || "")
			.trim()
			.toLowerCase() === "cod";

	return `
		<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse; margin:24px 0; background:#fafafa; border:1px solid #d9e2ec; border-radius:12px;">
			<tr>
				<td style="padding:16px 20px; font-size:16px; font-weight:bold; color:#111111; border-bottom:1px solid #d9e2ec; background:#f3f6fa;">
					Order Summary
				</td>
			</tr>

			<tr>
				<td style="padding:18px 10px;">
					<table role="presentation" width="100%" cellspacing="0" cellpadding="0">
						<tr>
							${renderEmailContactColumn("Buyer / Billing Information", [
								successPayload.buyerFullName,
								successPayload.buyerEmail,
								successPayload.buyerPhone,
								successPayload.buyerAddress,
							])}

							${renderEmailContactColumn("Delivery Information", [
								successPayload.deliveryFullName,
								successPayload.deliveryEmail,
								successPayload.deliveryPhone,
								successPayload.deliveryAddress,
							])}
						</tr>
					</table>
				</td>
			</tr>

			<tr>
				<td style="padding:0 20px 16px;">
					<div style="border-top:1px solid #e5e7eb; padding-top:14px;">
						<table role="presentation" width="100%" cellspacing="0" cellpadding="0">
							<tr>
								<td style="font-size:14px; font-weight:bold; color:#111111;">
									Shipments
								</td>
								<td align="right" style="font-size:12px; color:#777777;">
									${itemTotal} item${Number(itemTotal) === 1 ? "" : "s"}
								</td>
							</tr>
							${renderEmailShipmentItems(items)}
						</table>
					</div>
				</td>
			</tr>

			<tr>
				<td style="padding:0 20px 20px;">
					<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top:1px solid #e5e7eb; padding-top:12px;">
                        <tr>
                            <td colspan="2" style="padding:0 0 8px; font-size:14px; font-weight:bold; color:#20487a; text-transform:uppercase; letter-spacing:0.4px;">
                                Payment Summary
                            </td>
                        </tr>
                    
                        <tr>
                            <td style="padding:4px 24px 4px 0; font-size:13px; color:#555555;">
                                Shipment Subtotal
                            </td>
                            <td align="right" style="padding:4px 0; font-size:13px; font-weight:bold; color:#111111; white-space:nowrap;">
                                ${formatEUR(shipmentSubtotalEUR)}
                            </td>
                        </tr>
                    
                        ${
							successPayload.dhlAddon
								? `
                                    <tr>
                                        <td style="padding:4px 24px 4px 0; font-size:13px; color:#555555;">
                                            ${escapeHtml(successPayload.dhlAddon.label)}
                                        </td>
                                        <td align="right" style="padding:4px 0; font-size:13px; font-weight:bold; color:#111111; white-space:nowrap;">
                                            ${formatEUR(dhlAddonPriceEUR)}
                                        </td>
                                    </tr>
                                `
								: ""
						}
                        
                        ${
							successPayload.indoLocalDelivery
								? `
            <tr>
                <td style="padding:4px 24px 2px 0; font-size:13px; color:#555555;">
                    Indonesia local delivery
                    <div style="margin-top:2px; font-size:12px; color:#777777;">
                        ${escapeHtml(successPayload.indoLocalDelivery)}
                        ${indoLocalDeliveryIsCOD ? "" : " · includes Bubble Wrap"}
                    </div>
                </td>

                <td align="right" style="padding:4px 0 2px; font-size:13px; font-weight:bold; color:#111111; white-space:nowrap;">
                    ${formatEUR(bubbleWrapPriceEUR || 0)}
                    <div style="margin-top:2px; font-size:11px; font-weight:normal; color:#777777;">
                        ${indoLocalDeliveryIsCOD ? "" : "delivery paid later"}
                    </div>
                </td>
            </tr>
        `
								: ""
						}
                    
                        <tr>
                            <td colspan="2" style="padding:8px 0 4px;">
                                <div style="height:1px; background:#e5e7eb;"></div>
                            </td>
                        </tr>
                    
                        <tr>
                            <td style="padding:6px 24px 2px 0; font-size:15px; font-weight:bold; color:#991b1b;">
                                Total EUR
                            </td>
                            <td align="right" style="padding:6px 0 2px; font-size:15px; font-weight:bold; color:#991b1b; white-space:nowrap;">
                                ${formatEUR(successPayload.totalAmountEUR)}
                            </td>
                        </tr>
                    
                        <tr>
                            <td style="padding:6px 24px 2px 0; font-size:12px; color:#777777;">
                                Total IDR
                            </td>
                            <td align="right" style="padding:6px 0 2px; font-size:12px; font-weight:bold; color:#555555; white-space:nowrap;">
                                ${formatIDR(successPayload.totalAmountIDR)}
                            </td>
                        </tr>
                        
                        <tr>
                            <td style="padding:2px 24px 10px 0; font-size:12px; color:#777777;">
                                Exchange rate
                            </td>
                            <td align="right" style="padding:2px 0 10px; font-size:12px; font-weight:bold; color:#555555; white-space:nowrap;">
                                ${escapeHtml(`1 EUR = ${formatIDR(successPayload.eurToIdrRate)}`)}
                            </td>
                        </tr>
                    
                        <tr>
                            <td colspan="2" style="padding:8px 0 4px; border-top:1px dashed #d1d5db;"></td>
                        </tr>
                    
                        <tr>
                            <td style="padding:3px 24px 3px 0; font-size:12px; color:#777777;">
                                Total Shipment(s)
                            </td>
                            <td align="right" style="padding:3px 0; font-size:12px; font-weight:bold; color:#555555;">
                                ${itemTotal}
                            </td>
                        </tr>
                    
                        <tr>
                            <td style="padding:3px 24px 3px 0; font-size:12px; color:#777777;">
                                Payment Method
                            </td>
                            <td align="right" style="padding:3px 0; font-size:12px; font-weight:bold; color:#555555;">
                                ${escapeHtml(successPayload.paidViaLabel || "-")}
                            </td>
                        </tr>
                    
                        <tr>
                            <td style="padding:3px 24px 3px 0; font-size:12px; color:#777777;">
                                Payment Proof
                            </td>
                            <td align="right" style="padding:3px 0; font-size:12px; font-weight:bold; color:#555555;">
                                ${successPayload.hasPaymentProof ? "Uploaded" : "Not uploaded"}
                            </td>
                        </tr>
                    </table>
				</td>
			</tr>
		</table>
	`;
};

/**
 * @param {Object} params
 * @param {string} params.to
 * @param {Buffer} params.pdfBuffer
 * @param {SuccessPayload} params.successPayload
 * @returns {Promise<void>}
 */
export const sendOrderConfirmationEmail = async ({
	to,
	pdfBuffer,
	successPayload,
}) => {
	const {
		orderId,
		buyerFullName,
		itemsCount,
		dhlAddon,
		indoLocalDelivery,
		bubbleWrapPriceEUR,
		totalAmountEUR,
		totalAmountIDR,
	} = successPayload;

	const safeCustomerName = escapeHtml(buyerFullName || "");
	const safeOrderId = escapeHtml(orderId || "");

	const pdfBase64 = Buffer.from(pdfBuffer).toString("base64");

	const indoLocalDeliveryIsCOD =
		String(indoLocalDelivery || "")
			.trim()
			.toLowerCase() === "cod";

	await resend.emails.send({
		from: process.env.MAIL_FROM,
		to,
		bcc: process.env.SERVICE_MAIL,
		replyTo: process.env.SERVICE_MAIL,
		subject: `Your Order Confirmation #${orderId}`,
		text: `
Hello${buyerFullName ? ` ${buyerFullName}` : ""},

Thank you for your order.

Your order confirmation PDF is attached to this email.

Order details:
- Order ID: ${orderId}
- Total shipments: ${itemsCount}
${
	dhlAddon
		? `- Local delivery: ${dhlAddon.label || "-"} (${formatEUR(dhlAddon.priceEUR || 0)})`
		: ""
}
${
	indoLocalDelivery
		? indoLocalDeliveryIsCOD
			? `- Indonesia local delivery: ${indoLocalDelivery}`
			: `- Indonesia local delivery: ${indoLocalDelivery} incl. Bubble Wrap (${formatEUR(bubbleWrapPriceEUR || 0)}; delivery payment later)`
		: ""
}
${totalAmountEUR ? `- Total amount (EUR): ${formatEUR(totalAmountEUR)}` : ""}
${totalAmountIDR ? `- Total amount (IDR): ${formatIDR(totalAmountIDR)}` : ""}

Next steps:
1. Please review the attached PDF carefully and keep this email for your records.
2. Our team will review your payment details.
3. We’ll confirm your shipment schedule as we process your order.
4. We’ll send the warehouse address and delivery instructions via WhatsApp.

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
						<td style="background:#20487a; padding:28px 32px; text-align:center;">
							<h1 style="margin:0; font-size:28px; line-height:1.2; color:#ffffff;">Order Confirmed</h1>
							<p style="margin:10px 0 0; font-size:15px; color:#e6edf5;">
								Thank you for your order. We’ve received it successfully.
							</p>
						</td>
					</tr>

					<tr>
						<td style="padding:32px;">
							<p style="margin:0 0 16px; font-size:16px; color:#111111;">
								Hello${buyerFullName ? ` <strong style="color:#111111;">${safeCustomerName}</strong>` : ""},
							</p>

							<p style="margin:0 0 20px; font-size:15px; line-height:1.7; color:#222222;">
								Thank you for your order. Your order confirmation PDF is attached to this email.
								Please keep it for your records.
							</p>

							<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse; margin:24px 0; background:#fafafa; border:1px solid #d9e2ec; border-radius:10px;">
								<tr>
									<td style="padding:16px 20px; font-size:16px; font-weight:bold; color:#111111; border-bottom:1px solid #d9e2ec; background:#f3f6fa;">
										Order Information
									</td>
								</tr>

								<tr>
									<td style="padding:12px 20px; font-size:14px; color:#444444;">
										<strong>Order ID:</strong> ${safeOrderId}
									</td>
								</tr>
							</table>

							${renderEmailOrderSummary(successPayload)}

							<div style="margin:24px 0; padding:20px; background:#f8f9fb; border-left:4px solid #991b1b; border-radius:10px;">
								<h2 style="margin:0 0 12px; font-size:18px; color:#111111;">What happens next?</h2>
								<ol style="margin:0; padding-left:20px; color:#222222; font-size:14px; line-height:1.8;">
									<li>Please review the attached PDF carefully and keep this email for your records.</li>
									<li>Our team will review your payment details.</li>
									<li>We’ll confirm your shipment schedule as we process your order.</li>
									<li>We’ll send the warehouse address and delivery instructions via WhatsApp.</li>
								</ol>
							</div>

							<p style="margin:0; font-size:14px; color:#222222;">
								Need help? Reach us at
								<a href="mailto:diontransport@hotmail.com" style="color:#991b1b; text-decoration:none; font-weight:bold;">
									diontransport@hotmail.com
								</a>
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
				content: pdfBase64,
				contentType: "application/pdf",
			},
		],
	});
};
