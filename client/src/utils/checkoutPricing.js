export const buildCustomsFeeByKey = (relevantDutyItems, invoiceByItem) => {
	const map = {};

	for (const { key } of relevantDutyItems) {
		const entry = invoiceByItem?.[key];

		if (!entry?.invoiceRequired) {
			map[key] = 0;
			continue;
		}

		const original = Number(entry.originalValueEur);
		map[key] =
			Number.isFinite(original) && original > 0 ? original * 0.025 : 0;
	}

	return map;
};

export const calculatePriceWithCustoms = (item, customsFeeByKey) => {
	const transportAmountEur = Number(item.priceEur) || 0;
	const key = item.key;

	const customsAmountEur = key ? customsFeeByKey[key] || 0 : 0;
	const itemTotalEur = transportAmountEur + customsAmountEur;

	const quantityLabel =
		item.billedWeightKg > 0
			? `${item.billedWeightKg} kg`
			: item.hatQuantity > 0
				? `${item.hatQuantity} pcs`
				: item.documentPages > 0
					? `${item.documentPages} pages`
					: "1 item";

	const baseBreakdown = `${quantityLabel} × ${transportAmountEur.toFixed(2)}€`;

	const priceBreakdown =
		customsAmountEur > 0
			? `${baseBreakdown} + customs ${customsAmountEur.toFixed(2)}€ = ${itemTotalEur.toFixed(2)}€`
			: baseBreakdown;

	return {
		key,
		transportAmountEur,
		customsAmountEur,
		itemTotalEur,
		priceBreakdown,
	};
};

export const getTotalAmountEUR = (cartItems, customsFeeByKey) => {
	return cartItems.reduce((sum, item) => {
		return (
			sum + calculatePriceWithCustoms(item, customsFeeByKey).itemTotalEur
		);
	}, 0);
};
