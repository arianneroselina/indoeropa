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

export const createOrGetOrderRouteDatabases = async ({ datePageId }) => {
	const res = await fetch(`${API_BASE}/api/notion/order-route-databases`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ datePageId }),
	});

	const data = await res.json().catch(() => ({}));

	if (!res.ok) {
		throw new Error(
			data?.message || data?.error || "Failed to create route databases.",
		);
	}

	return data;
};

export const createPengirimanLokal = async ({
	dataSourceId,
	orderId,
	fullName,
	phone,
	email,
	address,
}) => {
	const res = await fetch(`${API_BASE}/api/notion/pengiriman-lokal`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			dataSourceId,
			orderId,
			fullName,
			phone,
			email,
			address,
		}),
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
	dataSourceId,
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
			dataSourceId,
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
	dataSourceId,
	orderId,
	fullName,
	phone,
	email,
	billingAddress,
	packageType,
	totalEUR,
	priceBreakdown,
	quantity,
	paymentStatus,
	paymentDate,
	paymentProof,
}) => {
	const formData = new FormData();
	formData.append("dataSourceId", dataSourceId);
	formData.append("orderId", orderId);
	formData.append("fullName", fullName);
	formData.append("phone", phone);
	formData.append("email", email);
	formData.append("billingAddress", billingAddress);
	formData.append("packageType", packageType);
	formData.append("totalEUR", totalEUR);
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

export const createOrderHistory = async ({
	orderId,
	fullName,
	email,
	phone,
	billingAddress,
	totalAmountEUR,
	totalAmountIDR,
	paymentStatus,
	paymentProof,
	submittedAt,
	specialRequest,
	shipments,
}) => {
	const formData = new FormData();

	formData.append("orderId", orderId);
	formData.append("fullName", fullName);
	formData.append("email", email);
	formData.append("phone", phone);
	formData.append("billingAddress", billingAddress);
	formData.append("totalAmountEUR", totalAmountEUR);
	formData.append("totalAmountIDR", totalAmountIDR);
	formData.append("paymentStatus", paymentStatus || "");
	formData.append("submittedAt", submittedAt);
	formData.append("specialRequest", specialRequest || "");
	formData.append("shipments", JSON.stringify(shipments || []));

	if (paymentProof) {
		formData.append("paymentProof", paymentProof);
	}

	const res = await fetch(`${API_BASE}/api/notion/order-history`, {
		method: "POST",
		body: formData,
	});

	const data = await res.json().catch(() => ({}));

	if (!res.ok) {
		throw new Error(
			data?.message || data?.error || "Failed to save Order History.",
		);
	}

	return data;
};
