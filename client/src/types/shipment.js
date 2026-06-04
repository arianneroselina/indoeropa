/**
 * @typedef {Object} ShippingCartItem
 * @property {string} key
 * @property {"shipping"} type
 * @property {string} fromCountry
 * @property {string} toCountry
 * @property {string} shipmentDate
 * @property {number} weightKg
 * @property {number} billedWeightKg
 * @property {{ l: number, w: number, h: number }} dimensionsCm
 * @property {string} packageTypeId
 * @property {string} packageTypeLabel
 * @property {number} priceEUR
 * @property {string} priceBreakdown
 * @property {number | undefined} documentPages
 * @property {number | undefined} hatQuantity

 * @property {boolean} duty
 * @property {boolean | undefined} invoiceRequired
 * @property {number | undefined} originalValueEUR
 * @property {number | undefined} customsFeeEUR

 * @property {string} createdAt
 * @property {string} [signature]
 */

export {};
