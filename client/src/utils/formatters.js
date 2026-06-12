// Format a date string into 'DD-MM-YYYY' format
export function formatDateToDDMMYYYY(dateString) {
	if (!dateString) return "";

	const date = new Date(dateString);
	return date.toLocaleDateString("en-GB");
}

// Format a Date object into 'YYYY-MM-DD' string format
export function formatDateToISO(date) {
	return (
		date.getFullYear() +
		"-" +
		String(date.getMonth() + 1).padStart(2, "0") +
		"-" +
		String(date.getDate()).padStart(2, "0")
	);
}

export function formatOptionalDate(value) {
	if (!value || value === "-") return "-";

	try {
		return formatDateToDDMMYYYY(value);
	} catch {
		return value;
	}
}

export function formatOptionalEUR(value) {
	const numberValue = Number(value);
	return Number.isFinite(numberValue) ? `€${numberValue.toFixed(2)}` : "-";
}

export function formatOptionalIDR(value) {
	const numberValue = Number(value);
	return Number.isFinite(numberValue)
		? `Rp${numberValue.toLocaleString()}`
		: "-";
}

export const formatQuantityLabel = (item) => {
	if (item === null || item === undefined) return "1 item";
	if (Number(item.documentPages) > 0) {
		return `${Number(item.documentPages)} pages`;
	}
	if (Number(item.hatQuantity) > 0) {
		return `${Number(item.hatQuantity)} pcs`;
	}
	if (Number(item.billedWeightKg) > 0) {
		return `${Number(item.billedWeightKg)} kg`;
	}
	return "1 item";
};
