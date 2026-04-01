
export function getPlainText(prop) {
    if (!prop) return "";

    if (prop.type === "title") {
        return prop.title?.map((t) => t.plain_text).join("") || "";
    }

    if (prop.type === "rich_text") {
        return prop.rich_text?.map((t) => t.plain_text).join("") || "";
    }

    return "";
}

export function getNumber(prop) {
    return prop?.number ?? null;
}

export function getCheckbox(prop, fallback = true) {
    if (!prop) return fallback;
    return prop.checkbox ?? fallback;
}

export function getSelectName(prop) {
    return prop?.select?.name || "";
}

export function getDateStart(prop) {
    return prop?.date?.start || null;
}

/**
 * Expected Countries properties:
 * - Number (number)
 * - Name (title)
 * - Code (rich_text)
 * - Active (checkbox)
 */
export function mapCountries(rows) {
    return rows
        .filter((row) => getCheckbox(row.properties["Active"], true))
        .map((row) => ({
            number: getNumber(row.properties["Number"]) ?? 9999,
            id: getPlainText(row.properties["Code"]),
            name: getPlainText(row.properties["Name"]),
        }))
        .sort((a, b) => a.number - b.number);
}

/**
 * Expected Package Types properties:
 * - Number (number)
 * - Label (title)
 * - ID (rich_text)
 * - Description (rich_text)
 * - Icon (choose from https://react-icons.github.io/react-icons/icons/fa/) (select)
 * - Pricing Type (select)
 * - Price (number)
 * - Price (half addons) (number)
 * - Price (pages < 11) (number)
 * - Price (pages < 51) (number)
 * - Price (pages < 101) (number)
 * - Active (checkbox)
 */
export function mapPackageTypes(rows) {
    return rows
        .filter((row) => getCheckbox(row.properties["Active"], true))
        .map((row) => {
            const p = row.properties;
            const pricingType = getSelectName(p["Pricing Type"]);

            let pricing;
            if (pricingType === "document") {
                pricing = {
                    type: "document",
                    price: {
                        1_10: getNumber(p["Price (pages < 11)"]) ?? 0,
                        11_50: getNumber(p["Price (pages < 51)"]) ?? 0,
                        51_100: getNumber(p["Price (pages < 101)"]) ?? 0,
                    },
                };
            } else {
                pricing = {
                    type: pricingType,
                    price: getNumber(p["Price"]) ?? 0,
                    priceHalfAddon: getNumber(p["Price (half addons)"]) ?? 0,
                };
            }

            const iconProp = "Icon (choose from https://react-icons.github.io/react-icons/icons/fa/)"
            return {
                number: getNumber(p["Number"]) ?? 9999,
                id: getPlainText(p["ID"]),
                label: getPlainText(p["Label"]),
                description: getPlainText(p["Description"]),
                iconKey: getSelectName(p[iconProp]) || getPlainText(p[iconProp]),
                pricing,
            };
        })
        .sort((a, b) => a.number - b.number);
}

/**
 * Expected Size Presets properties:
 * - Number (number)
 * - Label (title)
 * - ID (rich_text)
 * - Length (cm) (number)
 * - Width (cm) (number)
 * - Height (cm) (number)
 * - Active (checkbox)
 */
export function mapSizePresets(rows) {
    return rows
        .filter((row) => getCheckbox(row.properties["Active"], true))
        .map((row) => ({
            number: getNumber(row.properties["Number"]) ?? 9999,
            id: getPlainText(row.properties["ID"]),
            label: getPlainText(row.properties["Label"]),
            dims: {
                l: getNumber(row.properties["Length (cm)"]) ?? 0,
                w: getNumber(row.properties["Width (cm)"]) ?? 0,
                h: getNumber(row.properties["Height (cm)"]) ?? 0,
            },
        }))
        .sort((a, b) => a.number - b.number);
}

/**
 * Expected DHL Tiers properties:
 * - Number (number)
 * - Label (title)
 * - ID (rich_text)
 * - Max Kg (number)
 * - Price (number)
 * - Active (checkbox)
 */
export function mapDhlTiers(rows) {
    return rows
        .filter((row) => getCheckbox(row.properties["Active"], true))
        .map((row) => ({
            number: getNumber(row.properties["Number"]) ?? 9999,
            id: getPlainText(row.properties["ID"]),
            label: getPlainText(row.properties["Label"]),
            maxKg: getNumber(row.properties["Max Kg"]) ?? 0,
            price: getNumber(row.properties["Price"]) ?? 0,
        }))
        .sort((a, b) => a.number - b.number);
}

/**
 * Expected Route Dates properties:
 * - From (select)
 * - To (select)
 * - Date (date)
 * - Active (checkbox)
 */
export function mapRouteDates(rows) {
    const grouped = {};

    for (const row of rows) {
        if (!getCheckbox(row.properties["Active"], true)) continue;

        const from = getSelectName(row.properties["From"]);
        const to = getSelectName(row.properties["To"]);
        const dateProp = row.properties["Date"];
        const start = getDateStart(dateProp);
        const end = dateProp?.date?.end ?? null;

        if (!from || !to || !start) continue;

        const key = `${from}_${to}`;
        if (!grouped[key]) grouped[key] = [];

        grouped[key].push({
            start,
            end,
        });
    }

    Object.keys(grouped).forEach((key) =>
        grouped[key].sort((a, b) => a.start.localeCompare(b.start)),
    );

    return grouped;
}

/**
 * Expected Settings properties:
 * - Key (title)
 * - Value (number)
 */
export function mapSettings(rows) {
    const settings = {};

    for (const row of rows) {
        const key = getPlainText(row.properties["Key"]);
        const value = getNumber(row.properties["Value"]);

        if (key) {
            settings[key] = value;
        }
    }

    return settings;
}
