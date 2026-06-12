export const escapeHtml = (value = "") =>
	String(value)
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");

export const formatEUR = (value) =>
	typeof value === "number" && Number.isFinite(value)
		? `€${value.toFixed(2)}`
		: "€0.00";

export const formatIDR = (value) =>
	typeof value === "number" && Number.isFinite(value)
		? `Rp${Math.round(value).toLocaleString("id-ID")}`
		: "Rp0";

export const formatDisplayDate = (value, options) => {
	if (!value) return "-";

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return String(value);

	return date.toLocaleDateString("en-GB", options);
};

export const formatEmailDate = (value) => {
	if (!value || value === "-") return "-";

	try {
		return formatDisplayDate(value, {
			day: "2-digit",
			month: "long",
			year: "numeric",
		});
	} catch {
		return value;
	}
};

export const formatPdfDate = (value, options) => {
	if (!value || value === "-") return "-";

	try {
		return formatDisplayDate(value, options);
	} catch {
		return value;
	}
};

export function formatRouteDate(dateStr) {
	if (!dateStr) return "";
	const [year, month, day] = String(dateStr).split("-");
	if (!year || !month || !day) return String(dateStr);
	return `${day}-${month}-${year}`;
}

export function buildRouteName({ fromCountry, toCountry }) {
	return `${fromCountry}_${toCountry}`;
}
