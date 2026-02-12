export function snapToHalf(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return 0;
    return Math.round(n * 2) / 2;
}

export function roundUpToHalf(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return 0;
    return Math.ceil(n * 2) / 2;
}

export function roundUpToKg(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return 0;
    return Math.ceil(n);
}

export function getBilledWeight(rawWeight, isVolumeLike) {
    if (!rawWeight) return 0;
    return isVolumeLike ? roundUpToKg(rawWeight) : roundUpToHalf(rawWeight);
}

const perKg = 15;
const halfKg = 10;

export function calcPrice({ selectedPackageType, billedWeight, documentPages, hatQuantity }) {
    if (!selectedPackageType) return { total: 0, breakdown: "" };

    const type = selectedPackageType.pricing.type;

    // STANDARD (15€/kg + 10€/0.5kg)
    if (type === "standard") {
        const fullKg = Math.floor(billedWeight);
        const hasHalf = billedWeight % 1 !== 0;

        const total = fullKg * perKg + (hasHalf ? halfKg : 0);
        const breakdown = hasHalf ? `${fullKg} × ${perKg}€ + 1 × ${halfKg}€` : `${fullKg} × ${perKg}€`;
        return { total, breakdown };
    }

    // DOCUMENT
    if (type === "document") {
        const pages = Number(documentPages);
        if (!pages) return { total: 0, breakdown: "" };

        const pricing = selectedPackageType.pricing.price;
        if (pages <= 10) return { total: pricing[1_10], breakdown: "1-10 pages" };
        if (pages <= 50) return { total: pricing[11_50], breakdown: "11-50 pages" };
        if (pages <= 100) return { total: pricing[51_100], breakdown: "50-100 pages" };
        return { total: 0, breakdown: "Max 100 pages" };
    }

    // PER PIECE
    if (type === "perPiece") {
        const quantity = Number(hatQuantity || 1);
        if (!quantity) return { total: 0, breakdown: "" };

        const pricePerPiece = selectedPackageType.pricing.price;
        const total = quantity * pricePerPiece;
        return {
            total,
            breakdown: `${quantity} × ${pricePerPiece}€`,
        };
    }

    if (!billedWeight) return { total: 0, breakdown: "" };

    // VOLUME / SUPER VOLUME (per full kg)
    if (type === "perKg") {
        const perKg = selectedPackageType.pricing.price;
        const total = billedWeight * perKg;
        return { total, breakdown: `${billedWeight.toFixed(1)} kg × ${perKg}€` };
    }

    // PER KG ADDON
    if (type === "perKgAddon") {
        const perKg = selectedPackageType.pricing.price;

        const fullKg = Math.floor(billedWeight);
        const hasHalf = billedWeight % 1 !== 0;

        let total = fullKg * perKg;
        let breakdown = "";

        if (fullKg > 0) {
            breakdown += `${fullKg} × ${perKg}€`;
        }

        if (hasHalf) {
            total += 10;
            breakdown += fullKg > 0 ? ` + 1 × ${halfKg}€` : `1 ×  ${halfKg}€`;
        }

        return { total, breakdown };
    }

    return { total: 0, breakdown: "" };
}
