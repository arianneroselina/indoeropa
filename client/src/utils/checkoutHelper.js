import { formatOptionalEUR } from "./formatters";

export const totalPriceWithCustoms = (item) => {
	const transportAmountEUR = Number(item.priceEUR) || 0;
	const customsAmountEUR =
		item.duty && item.invoiceRequired ? Number(item.customsFeeEUR) || 0 : 0;

	const itemTotalEUR = transportAmountEUR + customsAmountEUR;

	const baseBreakdown =
		item.priceBreakdown ||
		`Shipping ${formatOptionalEUR(transportAmountEUR)}`;

	const priceBreakdown =
		customsAmountEUR > 0
			? `${baseBreakdown} + customs ${formatOptionalEUR(customsAmountEUR)}`
			: baseBreakdown;

	return {
		transportAmountEUR,
		customsAmountEUR,
		itemTotalEUR,
		priceBreakdown,
	};
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

const BOX_WEIGHT_BY_LABEL_KG = {
	2: 0.3,
	5: 0.4,
	10: 0.55,
	20: 0.7,
};

const getBoxWeightForTier = (tier) => {
	const maxKg = Number(tier.maxKg);
	return BOX_WEIGHT_BY_LABEL_KG[maxKg] ?? 0;
};

// TODO: add more logic for package without weights (e.g. documents, bags, etc.)
export const getRecommendedDhlAddon = (totalWeightKg, dhlTiers) => {
	// treat non-finite or non-positive weights as 1 kg
	const normalizedWeightKg =
		Number.isFinite(totalWeightKg) && totalWeightKg > 0 ? totalWeightKg : 1;

	const codTier = dhlTiers?.find((tier) => tier.id === "cod");

	const dhlOnlyTiers = [...(dhlTiers || [])]
		.filter((tier) => tier.id !== "cod")
		.filter((tier) => Number.isFinite(Number(tier.maxKg)))
		.sort((a, b) => Number(a.maxKg) - Number(b.maxKg));

	const recommendedTier = dhlOnlyTiers.find((tier) => {
		const maxKg = Number(tier.maxKg);
		const boxWeightKg = getBoxWeightForTier(tier);
		const totalWithBoxKg = normalizedWeightKg + boxWeightKg;

		return totalWithBoxKg <= maxKg;
	});

	return (
		recommendedTier?.id ||
		dhlOnlyTiers[dhlOnlyTiers.length - 1]?.id ||
		codTier?.id ||
		""
	);
};

export const COD_DHL_ADDON_ID = "cod";

export const INDONESIA_LOCAL_DELIVERY_OPTIONS = [
	"Gojek / Grab / Online Taxi",
	"JNE",
	"COD",
];

export const BUBBLE_WRAP_PRICE_EUR = 1;
