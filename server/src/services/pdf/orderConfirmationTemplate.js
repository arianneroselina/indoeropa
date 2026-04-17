import { escapeHtml, formatDisplayDate, formatEUR, formatIDR, formatWeight } from "../utils.js";

const renderShipmentCards = (items = []) => {
    if (!Array.isArray(items) || items.length === 0) {
        return `
			<div class="empty-box">
				No shipment item details available.
			</div>
		`;
    }

    return items
        .map((item) => {
            const shipmentDate = formatDisplayDate(item.shipmentDate, {
                weekday: "short",
                day: "2-digit",
                month: "long",
                year: "numeric",
            });

            return `
				<div class="shipment-card">
					<div class="shipment-card-header">
						<div class="shipment-card-title">
							Shipment ${escapeHtml(item.lineNumber ?? "-")} — ${escapeHtml(item.description || "Shipment")}
						</div>
						<div class="shipment-card-amount">
							${formatEUR(item.amountEUR)}
						</div>
					</div>

					<div class="shipment-grid">
						<div class="shipment-field">
							<div class="field-label">Package Type</div>
							<div class="field-value">${escapeHtml(item.packageType || "-")}</div>
						</div>

						<div class="shipment-field">
							<div class="field-label">Quantity</div>
							<div class="field-value">${escapeHtml(item.quantityLabel || "-")}</div>
						</div>

						<div class="shipment-field">
							<div class="field-label">Weight</div>
							<div class="field-value">${formatWeight(item.weightKg)}</div>
						</div>

						<div class="shipment-field">
							<div class="field-label">Shipment Date</div>
							<div class="field-value">${escapeHtml(shipmentDate)}</div>
						</div>

						<div class="shipment-field">
							<div class="field-label">Route</div>
							<div class="field-value">${escapeHtml(item.fromCountry || "-")} → ${escapeHtml(item.toCountry || "-")}</div>
						</div>
					</div>

					${
                item?.priceBreakdown
                    ? `
						<div class="breakdown">
							<div class="breakdown-title">Price Breakdown</div>
							<div class="breakdown-line">
								<span>Total</span>
								<span>${item.priceBreakdown}</span>
							</div>
						</div>
					`
                    : ""
            }
				</div>
			`;
        })
        .join("");
};

export const renderOrderConfirmationHtml = (data) => {
    const submitDate = formatDisplayDate(data.submittedAt, {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });

    const shipmentCards = renderShipmentCards(data.items || []);

    return `
		<!doctype html>
		<html>
			<head>
				<meta charset="utf-8" />
				<link rel="preconnect" href="https://fonts.googleapis.com">
				<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
				<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Roboto+Condensed:wght@400;700&display=swap" rel="stylesheet">
				<title>Order Confirmation</title>
				<style>
					@page {
						size: A4;
						margin: 28px 34px;
					}

					* {
						box-sizing: border-box;
					}

					body {
						margin: 0;
						font-family: "Inter", Arial, sans-serif;
						color: #111827;
						font-size: 13px;
						line-height: 1.45;
						background: #ffffff;
					}

					.page {
						width: 100%;
					}

					.topbar {
						display: flex;
						justify-content: space-between;
						align-items: flex-start;
						gap: 24px;
						margin-bottom: 18px;
					}

					.brand-left {
						display: flex;
						align-items: flex-start;
						gap: 14px;
					}

					.logo {
						width: 64px;
						height: 64px;
						object-fit: contain;
						flex-shrink: 0;
					}

					.brand-copy {
						padding-top: 2px;
					}

					.title {
						margin: 0;
						font-family: "Roboto Condensed", Arial, sans-serif;
						font-size: 28px;
						line-height: 1;
						font-weight: 700;
						letter-spacing: 0.3px;
						text-transform: uppercase;
						color: #991b1b;
					}

					.subtitle {
						margin: 8px 0 0;
						font-size: 13px;
						color: #374151;
					}

					.meta-box {
						min-width: 220px;
						text-align: right;
						border-left: 4px solid #20487a;
						padding-left: 12px;
					}

					.meta-row {
						margin-bottom: 10px;
					}

					.meta-row:last-child {
						margin-bottom: 0;
					}

					.meta-label {
						font-family: "Roboto Condensed", Arial, sans-serif;
						font-size: 12px;
						text-transform: uppercase;
						letter-spacing: 0.4px;
						color: #20487a;
						margin-bottom: 3px;
					}

					.meta-value {
						font-size: 13px;
						font-weight: 600;
						color: #111827;
					}

					.status-banner {
						margin: 8px 0 20px;
						padding: 10px 14px;
						border-left: 5px solid #991b1b;
						background: #f9fafb;
					}

					.status-label {
						font-family: "Roboto Condensed", Arial, sans-serif;
						font-size: 12px;
						text-transform: uppercase;
						letter-spacing: 0.4px;
						color: #991b1b;
						margin-bottom: 4px;
					}

					.status-value {
						font-size: 15px;
						font-weight: 700;
						color: #111827;
					}

					.section {
						margin-top: 18px;
					}

					.section-title {
						font-family: "Roboto Condensed", Arial, sans-serif;
						font-size: 15px;
						font-weight: 700;
						text-transform: uppercase;
						letter-spacing: 0.4px;
						color: #20487a;
						margin: 0 0 10px;
						padding-bottom: 5px;
						border-bottom: 2px solid #e5e7eb;
					}

					.info-block {
						border: 1px solid #e5e7eb;
						border-radius: 10px;
						padding: 12px 14px;
						background: #fff;
					}

					.info-line {
						margin: 0 0 7px;
					}

					.info-line:last-child {
						margin-bottom: 0;
					}

					.label {
						font-weight: 700;
						color: #111827;
					}

					.shipments-wrap {
						display: flex;
						flex-direction: column;
						gap: 12px;
					}

					.shipment-card {
						border: 1px solid #dbe1e8;
						border-radius: 12px;
						padding: 14px;
						background: #fff;
					}

					.shipment-card-header {
						display: flex;
						justify-content: space-between;
						align-items: flex-start;
						gap: 16px;
						margin-bottom: 12px;
						padding-bottom: 8px;
						border-bottom: 1px solid #e5e7eb;
					}

					.shipment-card-title {
						font-family: "Roboto Condensed", Arial, sans-serif;
						font-size: 17px;
						font-weight: 700;
						color: #20487a;
					}

					.shipment-card-amount {
						font-size: 16px;
						font-weight: 800;
						color: #991b1b;
						white-space: nowrap;
					}

					.shipment-grid {
						display: grid;
						grid-template-columns: 1fr 1fr;
						gap: 10px 18px;
					}

					.shipment-field {
						padding: 8px 10px;
						background: #f9fafb;
						border-radius: 8px;
					}

					.field-label {
						font-size: 11px;
						text-transform: uppercase;
						letter-spacing: 0.35px;
						color: #6b7280;
						margin-bottom: 3px;
					}

					.field-value {
						font-size: 13px;
						font-weight: 600;
						color: #111827;
					}

					.breakdown {
						margin-top: 12px;
						padding-top: 10px;
						border-top: 1px dashed #d1d5db;
					}

					.breakdown-title {
						font-family: "Roboto Condensed", Arial, sans-serif;
						font-size: 13px;
						font-weight: 700;
						color: #20487a;
						margin-bottom: 6px;
					}

					.breakdown-line {
						display: flex;
						justify-content: space-between;
						gap: 16px;
						font-size: 12px;
						margin: 4px 0;
					}

					.empty-box {
						border: 1px dashed #cbd5e1;
						border-radius: 10px;
						padding: 16px;
						color: #6b7280;
					}

					.total-wrap {
						margin-top: 16px;
						display: flex;
						justify-content: flex-end;
					}

					.total-box {
						min-width: 280px;
						border-top: 3px solid #991b1b;
						padding-top: 10px;
					}

					.total-line {
						display: flex;
						justify-content: space-between;
						gap: 18px;
						margin: 6px 0;
						font-size: 14px;
					}

					.total-line.grand {
						font-size: 16px;
						font-weight: 800;
						color: #991b1b;
					}

					.note {
						margin-top: 24px;
						padding: 14px 16px;
						border-radius: 10px;
						background: #f9fafb;
						border-left: 5px solid #991b1b;
						font-size: 12px;
						color: #1f2937;
					}

					.signature {
						margin-top: 18px;
						font-size: 13px;
					}

					.signature-name {
						font-family: "Roboto Condensed", Arial, sans-serif;
						font-size: 16px;
						font-weight: 700;
						color: #20487a;
						margin-top: 4px;
					}

					.footer {
						margin-top: 28px;
						padding-top: 12px;
						border-top: 2px solid #20487a;
						font-size: 11px;
						color: #4b5563;
						display: flex;
						justify-content: space-between;
						gap: 18px;
						flex-wrap: wrap;
					}

					.footer strong {
						color: #20487a;
					}
				</style>
			</head>
			<body>
				<div class="page">
					<div class="topbar">
						<div class="brand-left">
							${
        data.logoDataUrl
            ? `<img src="${data.logoDataUrl}" alt="Indoeropa Logo" class="logo" />`
            : ""
    }
							<div class="brand-copy">
								<h1 class="title">Order Confirmation</h1>
							</div>
						</div>

						<div class="meta-box">
							<div class="meta-row">
								<div class="meta-label">Submit Date</div>
								<div class="meta-value">${escapeHtml(submitDate)}</div>
							</div>
							<div class="meta-row">
								<div class="meta-label">Order ID</div>
								<div class="meta-value">${escapeHtml(data.orderId || "-")}</div>
							</div>
						</div>
					</div>

					<div class="status-banner">
						<div class="status-label">Status</div>
						<div class="status-value">${escapeHtml(data.status || "Order request received")}</div>
					</div>

					<div class="section">
						<h2 class="section-title">Buyer Information</h2>
						<div class="info-block">
							<p class="info-line"><span class="label">Name:</span> ${escapeHtml(data.fullName || "-")}</p>
							<p class="info-line"><span class="label">Number:</span> ${escapeHtml(data.phone || "-")}</p>
							<p class="info-line"><span class="label">Email:</span> ${escapeHtml(data.email || "-")}</p>
							<p class="info-line"><span class="label">Address:</span> ${escapeHtml(data.billingAddress || "-")}</p>
						</div>
					</div>

					<div class="section">
						<h2 class="section-title">Service Information</h2>
						<div class="info-block">
							<p class="info-line"><span class="label">Email:</span> diontransport@hotmail.com</p>
							<p class="info-line"><span class="label">Phone:</span> +49 175 4513280</p>
							<p class="info-line"><span class="label">Instagram:</span> @indoeropa_com</p>
							<p class="info-line"><span class="label">Address:</span> Jl. Utama 2 No.14-15 Komp. Perumahan Dasana Indah, Bojong Nangka, Kecamatan Kelapa Dua, Kabupaten Tangerang, Banten 15810</p>
						</div>
					</div>

					<div class="section">
						<h2 class="section-title">Shipment Details</h2>
						<div class="shipments-wrap">
							${shipmentCards}
						</div>

						<div class="total-wrap">
							<div class="total-box">
								<div class="total-line grand">
									<span>Total Euro</span>
									<span>${formatEUR(data.totalAmountEUR)}</span>
								</div>
								<div class="total-line">
									<span>Total Rupiah</span>
									<span>${formatIDR(data.totalAmountIDR)}</span>
								</div>
								<div class="total-line">
									<span>Total Shipments</span>
									<span>${escapeHtml(data.itemsCount ?? "-")}</span>
								</div>
								<div class="total-line">
									<span>Payment Method</span>
									<span>${escapeHtml(data.paidViaLabel || "-")}</span>
								</div>
							</div>
						</div>
					</div>

					<div class="note">
						<strong>
							Thank you for your order. This document confirms that we have received your shipment request.
							Please note that the order is not fully confirmed until payment has been received and verified.
							If you have any questions, please contact our team using the service information above.
						</strong>
					</div>

					<div class="signature">
						<div>Best Regards,</div>
						<div class="signature-name">INDOEROPA</div>
					</div>

					<div class="footer">
						<div><strong>INDOEROPA</strong></div>
						<div>Email: diontransport@hotmail.com</div>
						<div>Phone: +49 175 4513280</div>
						<div>Instagram: @indoeropa_com</div>
					</div>
				</div>
			</body>
		</html>
	`;
};
