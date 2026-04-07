import { API_BASE } from "../utils/constants";

export const createOrGetOrderRoutePage = async ({
	fromCountry,
	toCountry,
	shipmentDate,
}) => {
	const res = await fetch(`${API_BASE}/api/notion/order-route-page`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			fromCountry,
			toCountry,
			shipmentDate,
		}),
	});

	const data = await res.json().catch(() => ({}));

	if (!res.ok) {
		throw new Error(
			data?.message || data?.error || "Failed to create/find route page.",
		);
	}

	return data;
};

export const createPengirimanLokal = async ({
	orderId,
	fullName,
	phone,
	email,
	address,
}) => {
	const res = await fetch(`${API_BASE}/api/notion/pengiriman-lokal`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ orderId, fullName, phone, email, address }),
	});

	const data = await res.json().catch(() => ({}));

	if (!res.ok) {
		throw new Error(
			data?.message || data?.error || "Failed to save Pengiriman Lokal.",
		);
	}

	return data;
};

export const createPenerimaanBarang = async ({
	orderId,
	fullName,
	phone,
	email,
	packageType,
	quantity,
	request,
}) => {
	const res = await fetch(`${API_BASE}/api/notion/penerimaan-barang`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			orderId,
			fullName,
			phone,
			email,
			packageType,
			quantity,
			request,
		}),
	});

	const data = await res.json().catch(() => ({}));

	if (!res.ok) {
		throw new Error(
			data?.message || data?.error || "Failed to save Penerimaan Barang.",
		);
	}

	return data;
};

export const createPembayaran = async ({
	orderId,
	fullName,
	phone,
	email,
	billingAddress,
	packageType,
	totalEur,
	priceBreakdown,
	quantity,
	paymentStatus,
	paymentDate,
	paymentProof,
}) => {
	const formData = new FormData();
	formData.append("orderId", orderId);
	formData.append("fullName", fullName);
	formData.append("phone", phone);
	formData.append("email", email);
	formData.append("billingAddress", billingAddress);
	formData.append("packageType", packageType);
	formData.append("totalEur", totalEur);
	formData.append("priceBreakdown", priceBreakdown);
	formData.append("quantity", quantity);
	formData.append("paymentStatus", paymentStatus);
	formData.append("paymentDate", paymentDate);

	if (paymentProof) {
		formData.append("paymentProof", paymentProof);
	}

	const res = await fetch(`${API_BASE}/api/notion/pembayaran`, {
		method: "POST",
		body: formData,
	});

	const data = await res.json().catch(() => ({}));

	if (!res.ok) {
		throw new Error(
			data?.message || data?.error || "Failed to save Pembayaran.",
		);
	}

	return data;
};
