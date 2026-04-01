import { API_BASE } from "../utils/constants";

export const createPengirimanLokal = async ({ fullName, address }) => {
	const res = await fetch(`${API_BASE}/api/notion/pengiriman-lokal`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ fullName, address }),
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
	fullName,
	packageType,
	qtyPerUnit,
	request,
}) => {
	const res = await fetch(`${API_BASE}/api/notion/penerimaan-barang`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ fullName, packageType, qtyPerUnit, request }),
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
	fullName,
	packageType,
	pricePerUnitEur,
	qtyPerUnit,
	paymentStatus,
	paymentDate,
	paymentProof,
}) => {
	const formData = new FormData();
	formData.append("fullName", fullName);
	formData.append("packageType", packageType);
	formData.append("pricePerUnitEur", pricePerUnitEur);
	formData.append("qtyPerUnit", qtyPerUnit);
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
