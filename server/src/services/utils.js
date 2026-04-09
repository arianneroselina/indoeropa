export const escapeHtml = (value = "") =>
    String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

export const formatEur = (value) =>
    typeof value === "number" && Number.isFinite(value)
        ? `€${value.toFixed(2)}`
        : "€0.00";

export const formatIdr = (value) =>
    typeof value === "number" && Number.isFinite(value)
        ? `Rp${Math.round(value).toLocaleString("id-ID")}`
        : "Rp0";

export const formatDisplayDate = (value, options) => {
    if (!value) return "-";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);

    return date.toLocaleDateString("en-GB", options);
};

export const formatWeight = (value) => {
    if (value === null || value === undefined || value === "") return "-";
    const num = Number(value);
    if (!Number.isFinite(num)) return escapeHtml(value);
    return `${num} kg`;
};
