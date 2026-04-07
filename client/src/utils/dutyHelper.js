export const DUTY_TYPES = new Set([
	"shoes",
	"bags",
	"standard",
	"pkg_1_vol",
	"pkg_1_super",
]);

/**
 * Returns only shipments that require invoice logic.
 * Output format:
 * [{ item, idx, key }]
 */
export const getRelevantDutyItems = (cartItems = []) => {
	return cartItems
		.map((item) => ({ item, key: item.key }))
		.filter(({ item }) =>
			DUTY_TYPES.has(String(item.packageTypeId ?? "").toLowerCase()),
		);
};

export const hasDutyStep = (cartItems = []) => {
	return getRelevantDutyItems(cartItems).length > 0;
};
