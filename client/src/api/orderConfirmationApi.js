import { API_BASE } from "../utils/constants";

const getErrorMessage = async (response, fallbackMessage) => {
	const errorText = await response.text();
	return errorText || fallbackMessage;
};

/**
 * @param {SuccessPayload} payload
 * @returns {Promise<void>}
 */
export const downloadOrderConfirmationPdf = async (payload) => {
	const response = await fetch(`${API_BASE}/api/order-confirmation/pdf`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	});

	if (!response.ok) {
		throw new Error(
			await getErrorMessage(response, "Failed to generate PDF."),
		);
	}

	const blob = await response.blob();
	const url = window.URL.createObjectURL(blob);

	const fileOrderId = payload.orderId || "order";

	const a = document.createElement("a");
	a.href = url;
	a.download = `INDOEROPA-order-confirmation-${fileOrderId}.pdf`;

	document.body.appendChild(a);
	a.click();
	a.remove();

	window.URL.revokeObjectURL(url);
};

/**
 * @param {SuccessPayload} payload
 * @returns {Promise<unknown>}
 */
export const sendOrderConfirmationEmail = async (payload) => {
	const response = await fetch(`${API_BASE}/api/order-confirmation/email`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	});

	if (!response.ok) {
		throw new Error(
			await getErrorMessage(
				response,
				"Failed to send confirmation email.",
			),
		);
	}

	return response.json();
};
