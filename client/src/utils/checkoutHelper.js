export const totalPriceWithCustoms = (item) => {
	const transportAmountEUR = Number(item.priceEUR) || 0;
	const customsAmountEUR =
		item.duty && item.invoiceRequired ? Number(item.customsFeeEUR) || 0 : 0;
	const key = item.key;

	const itemTotalEUR = transportAmountEUR + customsAmountEUR;

	const quantityLabel = getItemQuantityLabel(item);
	const baseBreakdown = `${quantityLabel} × ${transportAmountEUR.toFixed(2)}€`;

	const priceBreakdown =
		customsAmountEUR > 0
			? `${baseBreakdown} + customs ${customsAmountEUR.toFixed(2)}€ = ${itemTotalEUR.toFixed(2)}€`
			: baseBreakdown;

	return {
		key,
		transportAmountEUR,
		customsAmountEUR,
		itemTotalEUR,
		priceBreakdown,
	};
};

export const getTotalAmountEUR = (cartItems) => {
	return cartItems.reduce((sum, item) => {
		return sum + totalPriceWithCustoms(item).itemTotalEUR;
	}, 0);
};

export const getItemQuantity = (item) => {
	if (Number(item.billedWeightKg) > 0) {
		return { value: Number(item.billedWeightKg), unit: "kg" };
	}
	if (Number(item.hatQuantity) > 0) {
		return { value: Number(item.hatQuantity), unit: "pcs" };
	}
	if (Number(item.documentPages) > 0) {
		return { value: Number(item.documentPages), unit: "pages" };
	}
	return { value: 1, unit: "item" };
};

export const getItemQuantityLabel = (item) => {
	if (Number(item.billedWeightKg) > 0) {
		return `${Number(item.billedWeightKg)} kg`;
	}
	if (Number(item.hatQuantity) > 0) {
		return `${Number(item.hatQuantity)} pcs`;
	}
	if (Number(item.documentPages) > 0) {
		return `${Number(item.documentPages)} pages`;
	}
	return "1 item";
};
