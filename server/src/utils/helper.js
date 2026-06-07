
export function formatRouteDate(dateStr) {
    if (!dateStr) return "";
    const [year, month, day] = String(dateStr).split("-");
    if (!year || !month || !day) return String(dateStr);
    return `${day}-${month}-${year}`;
}

export function buildRouteName({ fromCountry, toCountry }) {
    return `${fromCountry}_${toCountry}`;
}
