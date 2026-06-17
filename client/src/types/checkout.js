/**
 * @typedef {Object} SuccessPayloadItem
 * @property {number} lineNumber
 * @property {string} description
 * @property {string} packageType
 * @property {string} quantityLabel
 * @property {number|null} weightKg
 * @property {number|null} billedWeightKg
 * @property {string} fromCountry
 * @property {string} toCountry
 * @property {string} shipmentDate
 * @property {boolean} duty
 * @property {number} amountEUR
 * @property {string} priceBreakdown
 */

/**
 * @typedef {Object} SuccessPayload
 * @property {string} orderId
 * @property {string} buyerFullName
 * @property {string} buyerEmail
 * @property {string} buyerPhone
 * @property {string} buyerAddress
 * @property {string} deliveryFullName
 * @property {string} deliveryAddress
 * @property {string} deliveryEmail
 * @property {string} deliveryPhone
 * @property {number} totalAmountEUR
 * @property {number} totalAmountIDR
 * @property {number} eurToIdrRate
 * @property {number} itemsCount
 * @property {string} paidViaLabel
 * @property {boolean} hasPaymentProof
 * @property {string} submittedAt
 * @property {string} status
 * @property {Object} dhlAddon
 * @property {string} indoLocalDelivery
 * @property {number} bubbleWrapPriceEUR
 * @property {SuccessPayloadItem[]} items
 */

/** @type {SuccessPayload} */
const EMPTY_SUCCESS_PAYLOAD = {
	orderId: "",
	buyerFullName: "",
	buyerEmail: "",
	buyerPhone: "",
	buyerAddress: "",
	deliveryFullName: "",
	deliveryAddress: "",
	deliveryEmail: "",
	deliveryPhone: "",

	totalAmountEUR: 0,
	totalAmountIDR: 0,
	itemsCount: 0,
	paidViaLabel: "",
	hasPaymentProof: false,
	submittedAt: "",
	status: "",
	dhlAddon: null,
	items: [],
};

export { EMPTY_SUCCESS_PAYLOAD };
