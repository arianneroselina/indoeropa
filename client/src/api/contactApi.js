import { API_BASE } from "../utils/constants";

export const sendContactMessage = async (payload) => {
	const response = await fetch(`${API_BASE}/api/contact`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	});

	const data = await response.json().catch(() => null);

	if (!response.ok) {
		throw new Error(data?.error || "Failed to send contact message.");
	}

	return data;
};
