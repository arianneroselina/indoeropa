import { API_BASE } from "../utils/constants";

export const downloadOrderConfirmationPdf = async (payload) => {
	const response = await fetch(`${API_BASE}/api/order-confirmation/pdf`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(errorText || "Failed to generate PDF.");
	}

	const blob = await response.blob();
	const url = window.URL.createObjectURL(blob);

	const a = document.createElement("a");
	a.href = url;
	a.download = `order-confirmation-${payload.orderId}.pdf`;
	document.body.appendChild(a);
	a.click();
	a.remove();

	window.URL.revokeObjectURL(url);
};

export const sendOrderConfirmationEmail = async (payload) => {
	const response = await fetch(`${API_BASE}/api/order-confirmation/email`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(errorText || "Failed to send confirmation email.");
	}

	return response.json();
};
