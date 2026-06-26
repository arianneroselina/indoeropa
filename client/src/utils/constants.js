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
