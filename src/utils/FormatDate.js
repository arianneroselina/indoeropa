// Format a date string into 'DD-MM-YYYY' format
export function formatDateToDDMMYYYY(dateString) {
    if (!dateString) return "";

    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
}

// Format a Date object into 'YYYY-MM-DD' string format
export function formatDateToISO(date) {
    return date.getFullYear() + '-'
        + String(date.getMonth() + 1).padStart(2, '0') + '-'
        + String(date.getDate()).padStart(2, '0');
}
