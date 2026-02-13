export const DUTY_TYPES = new Set([
    "shoes",
    "bags",
    "standard",
    "pkg_1_vol",
    "pkg_1_super"
]);

export const getItemKey = (item, idx) =>
    String(item.signature ?? `${item.packageTypeId ?? "type"}-${idx}`);

/**
 * Returns only shipments that require invoice logic.
 * Output format:
 * [{ item, idx, key }]
 */
export const getRelevantDutyItems = (cartItems = []) => {
    return cartItems
        .map((item, idx) => ({ item, idx, key: getItemKey(item, idx) }))
        .filter(({ item }) =>
            DUTY_TYPES.has(String(item.packageTypeId ?? "").toLowerCase())
        );
};

export const hasDutyStep = (cartItems = []) => {
    return getRelevantDutyItems(cartItems).length > 0;
};
