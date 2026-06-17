import {
	FaBoxOpen,
	FaTv,
	FaCouch,
	FaShoppingBag,
	FaHatCowboy,
	FaShoePrints,
	FaTableTennis,
	FaFileAlt,
	FaQuestionCircle,
} from "react-icons/fa";

export const PACKAGE_TYPE_ICONS = {
	FaBoxOpen,
	FaTv,
	FaCouch,
	FaShoppingBag,
	FaHatCowboy,
	FaShoePrints,
	FaTableTennis,
	FaFileAlt,
	FaQuestionCircle,
};

export const API_BASE =
	process.env.REACT_APP_API_BASE_URL ||
	(process.env.NODE_ENV === "development" ? "http://localhost:3001" : "");

export const CART_KEY = "shipping_cart_items";
export const CHECKOUT_CART_KEY = "checkout_items";
export const CHECKOUT_SUCCESS_KEY = "last_checkout_success";
export const ORDER_ID_KEY = "checkout_order_id";

export const PAYMENT_DETAILS = {
	paypal: {
		title: "PayPal",
		rows: [
			["PayPal Email", "DionTransportPembayaran@gmail.com"],
			["Username", "@DTPembayaran"],
		],
		note: "Please send the payment as Friends & Family if applicable, then upload the payment proof below.",
	},
	/*iban: {
        title: "IBAN Bank Transfer",
        rows: [
            ["Account Holder", "Your Name / Business Name"],
            ["IBAN", "DE00 0000 0000 0000 0000 00"],
            ["BIC", "BANKDEFFXXX"],
            ["Reference", "Your full name"],
        ],
        note: "Please include your full name as the transfer reference.",
    },
    n26: {
        title: "N26",
        rows: [
            ["Account Holder", "Your Name"],
            ["IBAN", "DE00 0000 0000 0000 0000 00"],
            ["Reference", "Your full name"],
        ],
        note: "Please upload a screenshot or PDF confirmation after payment.",
    },
    bca: {
        title: "Bank BCA (Rupiah)",
        rows: [
            ["Account Holder", "Your Name"],
            ["Account Number", "0000000000"],
            ["Bank", "BCA"],
        ],
        note: "Please upload the transfer proof after payment.",
    },
    revolut: {
        title: "Revolut",
        rows: [
            ["Recipient", "Your Name"],
            ["Revolut Tag", "@yourtag"],
            ["Phone / Email", "+49 xxx / your@email.com"],
        ],
        note: "Please upload a screenshot or PDF confirmation after payment.",
    },*/
	jenius: {
		title: "Bank Jenius/SMBC (Rupiah)",
		rows: [
			["Account Holder", "Andika Putra"],
			["Account Number", "90160105717"],
		],
		note: "Please upload the transfer proof after payment.",
	},
};

export const DHL_LOGO = "/dhl.png";
