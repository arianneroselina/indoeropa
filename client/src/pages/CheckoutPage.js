import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import {
	CART_KEY,
	CHECKOUT_SUCCESS_KEY,
	ORDER_ID_KEY,
} from "../utils/constants";
import { PAYMENT_STATUS_MAP } from "../utils/notionMappers";
import CheckoutForm from "../components/checkout/CheckoutForm";
import OrderSummary from "../components/checkout/OrderSummary";
import {
	totalPriceWithCustoms,
	getItemQuantity,
	getRecommendedDhlAddon,
} from "../utils/checkoutHelper";
import {
	createOrGetOrderRouteDatabase,
	createPengirimanLokal,
	createPenerimaanBarang,
	createPembayaran,
	createOrderHistory,
} from "../api/checkoutApi";
import { formatQuantityLabel } from "../utils/formatters";
import { useShippingData } from "../hooks/useShippingData";

const CheckoutPage = () => {
	const navigate = useNavigate();
	const location = useLocation();

	// =========================
	// Local state
	// =========================
	const [cartItems, setCartItems] = useState([]);

	// Buyer info
	const [buyerFirstName, setBuyerFirstName] = useState("");
	const [buyerLastName, setBuyerLastName] = useState("");
	const [buyerEmail, setBuyerEmail] = useState("");
	const [buyerPhone, setBuyerPhone] = useState("");
	const [buyerStreet, setBuyerStreet] = useState("");
	const [buyerPostalCode, setBuyerPostalCode] = useState("");
	const [buyerCity, setBuyerCity] = useState("");
	const [buyerCountry, setBuyerCountry] = useState("");

	// Delivery info
	const [sameAsBuyerInfo, setSameAsBuyerInfo] = useState(false);
	const [deliveryFirstName, setDeliveryFirstName] = useState("");
	const [deliveryLastName, setDeliveryLastName] = useState("");
	const [deliveryEmail, setDeliveryEmail] = useState("");
	const [deliveryPhone, setDeliveryPhone] = useState("");
	const [deliveryStreet, setDeliveryStreet] = useState("");
	const [deliveryPostalCode, setDeliveryPostalCode] = useState("");
	const [deliveryCity, setDeliveryCity] = useState("");
	const [deliveryCountry, setDeliveryCountry] = useState("");

	const [dhlAddon, setDhlAddon] = useState("");
	const [paymentMethod, setPaymentMethod] = useState("");
	const [paymentProof, setPaymentProof] = useState(null);
	const [notes, setNotes] = useState("");
	const [termsAccepted, setTermsAccepted] = useState(false);

	const [submitting, setSubmitting] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	const { data } = useShippingData();
	const eurToIdrRate = useMemo(() => data?.EUR_TO_IDR_RATE ?? 0, [data]);
	const dhlTiers = useMemo(() => data?.DHL_TIERS ?? [], [data]);

	const invoiceProofFiles = location.state?.invoiceProofFiles || {};

	// =========================
	// Load persisted checkout data
	// =========================
	useEffect(() => {
		try {
			const savedCartItems = localStorage.getItem(CART_KEY);
			if (savedCartItems) setCartItems(JSON.parse(savedCartItems));
		} catch (err) {
			console.error("Failed to parse local storage checkout data", err);
			localStorage.removeItem(CART_KEY);
		}
	}, []);

	// =========================
	// Buyer same as Delivery
	// =========================
	useEffect(() => {
		if (!sameAsBuyerInfo) return;

		setDeliveryFirstName(buyerFirstName);
		setDeliveryLastName(buyerLastName);
		setDeliveryEmail(buyerEmail);
		setDeliveryPhone(buyerPhone);
		setDeliveryStreet(buyerStreet);
		setDeliveryPostalCode(buyerPostalCode);
		setDeliveryCity(buyerCity);
		setDeliveryCountry(buyerCountry);
	}, [
		sameAsBuyerInfo,
		buyerFirstName,
		buyerLastName,
		buyerEmail,
		buyerPhone,
		buyerStreet,
		buyerPostalCode,
		buyerCity,
		buyerCountry,
	]);

	// =========================
	// Order ID
	// =========================
	const getOrCreateOrderId = () => {
		const existing = sessionStorage.getItem(ORDER_ID_KEY);
		if (existing) return existing;

		const newOrderId = `ORD-${Date.now()}`;
		sessionStorage.setItem(ORDER_ID_KEY, newOrderId);
		return newOrderId;
	};

	// =========================
	// Germany DHL Addon
	// =========================
	const COD_DHL_ADDON_ID = "cod";

	const dhlAddonEnabled = cartItems[0]?.toCountry === "DE";

	const totalBilledWeightKg = useMemo(() => {
		return cartItems.reduce(
			(sum, item) => sum + Number(item?.billedWeightKg || 0),
			0,
		);
	}, [cartItems]);

	const recommendedDhlAddonId = useMemo(() => {
		if (!dhlAddonEnabled || !dhlTiers.length) return "";

		return getRecommendedDhlAddon(totalBilledWeightKg, dhlTiers);
	}, [dhlAddonEnabled, totalBilledWeightKg, dhlTiers]);

	const availableDhlAddons = useMemo(() => {
		if (!dhlAddonEnabled || !recommendedDhlAddonId) return [];

		const allowedIds =
			recommendedDhlAddonId === COD_DHL_ADDON_ID
				? [COD_DHL_ADDON_ID]
				: [recommendedDhlAddonId, COD_DHL_ADDON_ID];

		return allowedIds
			.map((id) => dhlTiers.find((option) => option.id === id))
			.filter(Boolean);
	}, [dhlAddonEnabled, dhlTiers, recommendedDhlAddonId]);

	const dhlAddonObject = useMemo(() => {
		if (!dhlAddonEnabled) return null;

		return (
			availableDhlAddons.find((option) => option.id === dhlAddon) || null
		);
	}, [dhlAddonEnabled, availableDhlAddons, dhlAddon]);

	const dhlAddonPriceEUR = Number(dhlAddonObject?.price || 0);

	useEffect(() => {
		if (!dhlAddonEnabled || !recommendedDhlAddonId) {
			setDhlAddon("");
			return;
		}

		setDhlAddon(recommendedDhlAddonId);
	}, [dhlAddonEnabled, recommendedDhlAddonId]);

	// =========================
	// Derived pricing
	// =========================
	const totalAmountEUR = useMemo(() => {
		return (
			cartItems.reduce(
				(sum, item) => sum + totalPriceWithCustoms(item).itemTotalEUR,
				0,
			) + dhlAddonPriceEUR
		);
	}, [cartItems, dhlAddonPriceEUR]);

	const totalAmountIDR = useMemo(
		() => totalAmountEUR * eurToIdrRate,
		[totalAmountEUR, eurToIdrRate],
	);

	const hasDutyItems = cartItems.some((item) => item?.duty === true);
	const backTo = hasDutyItems ? "/invoices" : "/cart";
	const backLabel = hasDutyItems ? "Back to Invoices" : "Back to Cart";

	// Derived names for downstream API calls
	const buyerFullName = `${buyerFirstName} ${buyerLastName}`.trim();
	const deliveryFullName = `${deliveryFirstName} ${deliveryLastName}`.trim();

	// =========================
	// Form submission
	// =========================
	const handleSubmit = async (e) => {
		e.preventDefault();

		if (submitting) return;

		setSubmitting(true);
		setErrorMessage("");

		try {
			const orderId = getOrCreateOrderId();
			const submittedAt = new Date().toISOString();
			const today = submittedAt.slice(0, 10);

			const paymentStatus = PAYMENT_STATUS_MAP[paymentMethod] || "";
			if (!paymentStatus) {
				throw new Error("Invalid payment method.");
			}

			const deliveryAddress = [
				deliveryStreet,
				deliveryPostalCode,
				deliveryCity,
				deliveryCountry,
			]
				.filter(Boolean)
				.join(", ");

			const buyerAddress = [
				buyerStreet,
				buyerPostalCode,
				buyerCity,
				buyerCountry,
			]
				.filter(Boolean)
				.join(", ");

			const shipments = cartItems.map((item, index) => {
				if (
					!item.fromCountry ||
					!item.toCountry ||
					!item.shipmentDate
				) {
					throw new Error("Missing route information for checkout.");
				}

				const itemQuantity = getItemQuantity(item);
				const quantity = String(itemQuantity.value ?? "");
				const unit = String(itemQuantity.unit ?? "");

				const { itemTotalEUR, priceBreakdown } =
					totalPriceWithCustoms(item);

				return {
					shipmentId: `${orderId}-S${index + 1}`,
					itemKey: item.key,
					fromCountry: item.fromCountry,
					toCountry: item.toCountry,
					shipmentDate: item.shipmentDate,
					packageType: item.packageTypeLabel ?? "-",
					quantity,
					unit,
					priceEUR: item.priceEUR,
					dutyPriceEUR: item.duty
						? Number(item.customsFeeEUR || 0)
						: 0,
					invoiceRequired: item.invoiceRequired === true,
					totalEUR: itemTotalEUR,
					priceBreakdown,
					item,
				};
			});

			// one order and all shipments
			await createOrderHistory({
				orderId,
				buyerFullName,
				buyerEmail,
				buyerPhone,
				buyerAddress,
				deliveryFullName,
				deliveryEmail,
				deliveryPhone,
				deliveryAddress,
				dhlAddon: dhlAddonObject?.id,
				dhlAddonPriceEUR,
				totalAmountEUR,
				totalAmountIDR,
				paymentStatus,
				paymentProof,
				submittedAt,
				specialRequest: notes,
				shipments: shipments.map(
					({ priceBreakdown, item, ...shipmentPayload }) =>
						shipmentPayload,
				),
				invoiceProofFiles,
			});

			// route-specific records
			for (const shipment of shipments) {
				const { packageType, quantity, totalEUR, priceBreakdown } =
					shipment;

				const routeDb = await createOrGetOrderRouteDatabase({
					fromCountry: shipment.fromCountry,
					toCountry: shipment.toCountry,
					shipmentDate: shipment.shipmentDate,
				});

				const routeDataSourceId = routeDb.dataSourceId;

				if (!routeDataSourceId) {
					throw new Error(
						"Missing route-specific Notion data source ID.",
					);
				}

				await createPengirimanLokal({
					dataSourceId: routeDataSourceId,
					shipmentId: shipment.shipmentId,
					deliveryFullName,
					deliveryEmail,
					deliveryPhone,
					deliveryAddress,
					dhlAddon: dhlAddonObject?.id,
				});

				await createPenerimaanBarang({
					dataSourceId: routeDataSourceId,
					shipmentId: shipment.shipmentId,
					buyerFullName,
					buyerEmail,
					buyerPhone,
					packageType,
					quantity: Number(quantity),
					request: notes,
				});

				await createPembayaran({
					dataSourceId: routeDataSourceId,
					shipmentId: shipment.shipmentId,
					buyerFullName,
					buyerEmail,
					buyerPhone,
					buyerAddress,
					packageType,
					totalEUR,
					priceBreakdown,
					quantity: Number(quantity),
					paymentStatus,
					paymentDate: today,
					paymentProof,
					invoiceProof: invoiceProofFiles?.[shipment.itemKey] || null,
				});
			}

			sessionStorage.removeItem(ORDER_ID_KEY);
			localStorage.removeItem(CART_KEY);
			setCartItems([]);

			/** @type {SuccessPayload} */
			const successPayload = {
				orderId,
				buyerFullName,
				buyerEmail,
				buyerPhone,
				buyerAddress,
				deliveryFullName,
				deliveryAddress,
				deliveryEmail,
				deliveryPhone,
				totalAmountEUR,
				totalAmountIDR,
				eurToIdrRate,
				itemsCount: cartItems.length,
				paidViaLabel: paymentMethod?.toUpperCase() || "",
				hasPaymentProof: Boolean(paymentProof),
				submittedAt,
				status: "Order request received",
				dhlAddon:
					dhlAddonEnabled && dhlAddonObject
						? {
								label: dhlAddonObject.label || "",
								priceEUR: dhlAddonPriceEUR,
							}
						: null,
				items: shipments.map((shipment, index) => ({
					lineNumber: index + 1,
					description: shipment.packageType || "Shipment",
					packageType: shipment.packageType || "-",
					quantityLabel: formatQuantityLabel(shipment.item),
					weightKg: shipment.item.weightKg ?? null,
					billedWeightKg: shipment.item.billedWeightKg ?? null,
					fromCountry: shipment.fromCountry || "-",
					toCountry: shipment.toCountry || "-",
					shipmentDate: shipment.shipmentDate || "-",
					duty: Boolean(shipment.item.duty),
					amountEUR: shipment.totalEUR,
					priceBreakdown: shipment.priceBreakdown,
				})),
			};

			sessionStorage.setItem(
				CHECKOUT_SUCCESS_KEY,
				JSON.stringify(successPayload),
			);

			navigate("/checkout/success", {
				state: successPayload,
			});
		} catch (err) {
			console.error(err);
			setErrorMessage("Checkout failed: " + err.message);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<section className="py-24 bg-gray-100">
			<div className="max-w-screen-xl mx-auto px-4">
				<div className="mb-6 flex items-center justify-between">
					<Link
						to={backTo}
						className="text-primary flex items-center gap-2"
					>
						<FaArrowRight className="transform rotate-180" />
						<span>{backLabel}</span>
					</Link>

					<h2 className="text-center text-4xl font-semibold">
						CHECKOUT
					</h2>
				</div>

				<div className="rounded-lg bg-white p-8 shadow-md">
					{cartItems.length === 0 ? (
						<div className="text-center text-lg text-gray-600">
							Your cart is empty.{" "}
							<Link
								to="/shipment"
								className="font-semibold text-secondary"
							>
								Schedule a shipment
							</Link>{" "}
							to begin.
						</div>
					) : (
						<div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
							<CheckoutForm
								handleSubmit={handleSubmit}
								buyerFirstName={buyerFirstName}
								setBuyerFirstName={setBuyerFirstName}
								buyerLastName={buyerLastName}
								setBuyerLastName={setBuyerLastName}
								buyerEmail={buyerEmail}
								setBuyerEmail={setBuyerEmail}
								buyerPhone={buyerPhone}
								setBuyerPhone={setBuyerPhone}
								buyerStreet={buyerStreet}
								setBuyerStreet={setBuyerStreet}
								buyerPostalCode={buyerPostalCode}
								setBuyerPostalCode={setBuyerPostalCode}
								buyerCity={buyerCity}
								setBuyerCity={setBuyerCity}
								buyerCountry={buyerCountry}
								setBuyerCountry={setBuyerCountry}
								sameAsBuyerInfo={sameAsBuyerInfo}
								setSameAsBuyerInfo={setSameAsBuyerInfo}
								deliveryFirstName={deliveryFirstName}
								setDeliveryFirstName={setDeliveryFirstName}
								deliveryLastName={deliveryLastName}
								setDeliveryLastName={setDeliveryLastName}
								deliveryEmail={deliveryEmail}
								setDeliveryEmail={setDeliveryEmail}
								deliveryPhone={deliveryPhone}
								setDeliveryPhone={setDeliveryPhone}
								deliveryStreet={deliveryStreet}
								setDeliveryStreet={setDeliveryStreet}
								deliveryPostalCode={deliveryPostalCode}
								setDeliveryPostalCode={setDeliveryPostalCode}
								deliveryCity={deliveryCity}
								setDeliveryCity={setDeliveryCity}
								deliveryCountry={deliveryCountry}
								setDeliveryCountry={setDeliveryCountry}
								dhlAddonEnabled={dhlAddonEnabled}
								availableDhlAddons={availableDhlAddons}
								dhlAddon={dhlAddon}
								setDhlAddon={setDhlAddon}
								paymentMethod={paymentMethod}
								setPaymentMethod={setPaymentMethod}
								setPaymentProof={setPaymentProof}
								notes={notes}
								setNotes={setNotes}
								termsAccepted={termsAccepted}
								setTermsAccepted={setTermsAccepted}
								submitting={submitting}
							/>

							<aside className="h-fit lg:sticky lg:top-24">
								<OrderSummary
									cartItems={cartItems}
									totalAmountEUR={totalAmountEUR}
									totalAmountIDR={totalAmountIDR}
									dhlAddonEnabled={dhlAddonEnabled}
									dhlAddonObject={dhlAddonObject}
									dhlAddonPriceEUR={dhlAddonPriceEUR}
								/>
							</aside>

							{errorMessage ? (
								<div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
									{errorMessage}
								</div>
							) : null}
						</div>
					)}
				</div>
			</div>
		</section>
	);
};

export default CheckoutPage;
