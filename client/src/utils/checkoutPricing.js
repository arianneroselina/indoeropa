export const buildCustomsFeeByKey = (relevantDutyItems, invoiceByItem) => {
  const map = {};

  for (const { key } of relevantDutyItems) {
    const entry = invoiceByItem?.[key];

    if (entry?.over125 !== "yes") {
      map[key] = 0;
      continue;
    }

    const original = Number(entry.originalValueEur);
    map[key] = Number.isFinite(original) && original > 0 ? original * 0.025 : 0;
  }

  return map;
};

export const getItemPricing = (item, relevantDutyItems, customsFeeByKey) => {
  const qty = Number(item.quantity) || 1;
  const unitTransport = Number(item.priceEur) || 0;

  const dutyInfo = relevantDutyItems.find((r) => r.item === item);
  const key = dutyInfo?.key;

  const unitCustoms = key ? customsFeeByKey[key] || 0 : 0;
  const unitTotal = unitTransport + unitCustoms;

  return {
    key,
    qty,
    unitTransport,
    unitCustoms,
    unitTotal,
    transportSubtotal: unitTransport * qty,
    customsSubtotal: unitCustoms * qty,
    subtotal: unitTotal * qty,
  };
};

export const getTotalAmountEUR = (
  cartItems,
  relevantDutyItems,
  customsFeeByKey,
) => {
  return cartItems.reduce((sum, item) => {
    return (
      sum + getItemPricing(item, relevantDutyItems, customsFeeByKey).subtotal
    );
  }, 0);
};
