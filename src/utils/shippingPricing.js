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

export function calcPrice({ selectedPackageType, billedWeight, documentPages }) {
    if (!selectedPackageType) return { total: 0, breakdown: "" };

    const type = selectedPackageType.pricing.type;

    // STANDARD (15€/kg + 10€/0.5kg)
    if (type === "standard") {
        const fullKg = Math.floor(billedWeight);
        const hasHalf = billedWeight % 1 !== 0;

        const total = fullKg * 15 + (hasHalf ? 10 : 0);
        const breakdown = hasHalf ? `${fullKg} × 15€ + 1 × 10€` : `${fullKg} × 15€`;
        return { total, breakdown };
    }

    // DOCUMENT
    if (type === "document") {
        const pages = Number(documentPages);
        if (!pages) return { total: 0, breakdown: "" };

        if (pages <= 10) return { total: 10, breakdown: "1–10 pages" };
        if (pages <= 50) return { total: 20, breakdown: "11–50 pages" };
        if (pages <= 100) return { total: 50, breakdown: "50–100 pages" };
        return { total: 50, breakdown: "Max tier (100 pages)" };
    }

    if (!billedWeight) return { total: 0, breakdown: "" };

    // VOLUME / SUPER VOLUME (per full kg)
    if (type === "volume" || type === "super_volume") {
        const perKg = selectedPackageType.pricing.perKg;
        const total = billedWeight * perKg;
        return { total, breakdown: `${billedWeight.toFixed(1)} kg × ${perKg}€` };
    }

    // PER KG ADDON
    if (type === "perKgAddon") {
        const firstKgPrice = selectedPackageType.pricing.firstKg;

        const fullKg = Math.floor(billedWeight);
        const hasHalf = billedWeight % 1 !== 0;

        let total = 0;
        let breakdown = "";

        if (fullKg >= 1) {
            total += firstKgPrice;
            breakdown += `1 kg × ${firstKgPrice}€`;

            const remaining = billedWeight - 1;
            if (remaining > 0) {
                const extraFull = Math.floor(remaining);
                const extraHalf = remaining % 1 !== 0;

                total += extraFull * 15 + (extraHalf ? 10 : 0);

                if (extraFull > 0) breakdown += ` + ${extraFull} × 15€`;
                if (extraHalf) breakdown += ` + 1 × 10€`;
            }
        } else {
            total = firstKgPrice;
            breakdown = `Up to 1 kg × ${firstKgPrice}€`;
        }

        return { total, breakdown };
    }

    return { total: 0, breakdown: "" };
}
