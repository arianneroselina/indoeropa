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

export const createPenerimaanBarang = async ({
	dataSourceId,
	shipmentId,
	buyerFullName,
	buyerEmail,
	buyerPhone,
	packageType,
	quantity,
	request,
}) => {
	const res = await fetch(`${API_BASE}/api/notion/penerimaan-barang`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			dataSourceId,
			shipmentId,
			buyerFullName,
			buyerEmail,
			buyerPhone,
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
	shipmentId,
	buyerFullName,
	buyerEmail,
	buyerPhone,
	buyerAddress,
	packageType,
	totalEUR,
	priceBreakdown,
	quantity,
	paymentStatus,
	paymentDate,
	paymentProof,
	invoiceProof,
}) => {
	const formData = new FormData();

	formData.append("dataSourceId", dataSourceId);
	formData.append("shipmentId", shipmentId);
	formData.append("buyerFullName", buyerFullName);
	formData.append("buyerEmail", buyerEmail);
	formData.append("buyerPhone", buyerPhone);
	formData.append("buyerAddress", buyerAddress);
	formData.append("packageType", packageType);
	formData.append("totalEUR", totalEUR);
	formData.append("priceBreakdown", priceBreakdown);
	formData.append("quantity", quantity);
	formData.append("paymentStatus", paymentStatus);
	formData.append("paymentDate", paymentDate);

	if (paymentProof) {
		formData.append("paymentProof", paymentProof);
	}

	if (invoiceProof) {
		formData.append("invoiceProof", invoiceProof);
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

export const createPengirimanLokal = async ({
	dataSourceId,
	shipmentId,
	deliveryFullName,
	deliveryEmail,
	deliveryPhone,
	deliveryAddress,
}) => {
	const res = await fetch(`${API_BASE}/api/notion/pengiriman-lokal`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			dataSourceId,
			shipmentId,
			deliveryFullName,
			deliveryEmail,
			deliveryPhone,
			deliveryAddress,
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

export const createOrderHistory = async ({
	orderId,
	buyerFullName,
	buyerEmail,
	buyerPhone,
	buyerAddress,
	deliveryFullName,
	deliveryEmail,
	deliveryPhone,
	deliveryAddress,
	dhlAddon,
	dhlAddonPriceEUR,
	totalAmountEUR,
	totalAmountIDR,
	paymentStatus,
	paymentProof,
	submittedAt,
	specialRequest,
	shipments,
	invoiceProofFiles,
}) => {
	const formData = new FormData();

	formData.append("orderId", orderId);
	formData.append("buyerFullName", buyerFullName);
	formData.append("buyerEmail", buyerEmail);
	formData.append("buyerPhone", buyerPhone);
	formData.append("buyerAddress", buyerAddress);
	formData.append("deliveryFullName", deliveryFullName);
	formData.append("deliveryEmail", deliveryEmail);
	formData.append("deliveryPhone", deliveryPhone);
	formData.append("deliveryAddress", deliveryAddress);
	formData.append("dhlAddon", dhlAddon);
	formData.append("dhlAddonPriceEUR", dhlAddonPriceEUR);
	formData.append("totalAmountEUR", totalAmountEUR);
	formData.append("totalAmountIDR", totalAmountIDR);
	formData.append("paymentStatus", paymentStatus || "");
	formData.append("submittedAt", submittedAt);
	formData.append("specialRequest", specialRequest || "");
	formData.append("shipments", JSON.stringify(shipments || []));

	if (paymentProof) {
		formData.append("paymentProof", paymentProof);
	}

	(shipments || []).forEach((shipment) => {
		const file = invoiceProofFiles?.[shipment.itemKey];
		if (file) {
			formData.append(`invoiceProof:${shipment.itemKey}`, file);
		}
	});

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
