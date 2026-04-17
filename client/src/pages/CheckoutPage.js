import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import { CART_KEY, CHECKOUT_SUCCESS_KEY } from "../utils/constants";
import { PAYMENT_STATUS_MAP } from "../utils/notionMappers";
import CheckoutForm from "../components/checkout/CheckoutForm";
import OrderSummary from "../components/checkout/OrderSummary";
import {
	totalPriceWithCustoms,
	getItemQuantity,
	getItemQuantityLabel,
	getTotalAmountEUR,
} from "../utils/checkoutHelper";
import {
	createOrGetOrderRoutePage,
	createPengirimanLokal,
	createPenerimaanBarang,
	createPembayaran,
	createOrGetOrderRouteDatabases,
	createOrderHistory,
} from "../api/checkoutApi";
import { useShippingData } from "../hooks/useShippingData";

const CheckoutPage = () => {
	const navigate = useNavigate();
	const location = useLocation();

	// =========================
	// Local state
	// =========================
	const [cartItems, setCartItems] = useState([]);

	// Buyer info
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");

	// Delivery info
	const [deliveryRecipientFirstName, setDeliveryRecipientFirstName] =
		useState("");
	const [deliveryRecipientLastName, setDeliveryRecipientLastName] =
		useState("");
	const [deliveryRecipientPhone, setDeliveryRecipientPhone] = useState("");
	const [deliveryStreet, setDeliveryStreet] = useState("");
	const [deliveryPostalCode, setDeliveryPostalCode] = useState("");
	const [deliveryCountry, setDeliveryCountry] = useState("");

	// Billing info
	const [billingSameAsDelivery, setBillingSameAsDelivery] = useState(true);
	const [billingFirstName, setBillingFirstName] = useState("");
	const [billingLastName, setBillingLastName] = useState("");
	const [billingPhone, setBillingPhone] = useState("");
	const [billingStreet, setBillingStreet] = useState("");
	const [billingPostalCode, setBillingPostalCode] = useState("");
	const [billingCountry, setBillingCountry] = useState("");

	const [paymentMethod, setPaymentMethod] = useState("");
	const [paymentProof, setPaymentProof] = useState(null);
	const [notes, setNotes] = useState("");
	const [termsAccepted, setTermsAccepted] = useState(false);

	const [submitting, setSubmitting] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	const { data } = useShippingData();
	const eurToIdrRate = data?.EUR_TO_IDR_RATE ?? 0;

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
	// Derived pricing
	// =========================
	const totalAmountEUR = useMemo(
		() => getTotalAmountEUR(cartItems),
		[cartItems],
	);

	const totalAmountIDR = useMemo(
		() => totalAmountEUR * eurToIdrRate,
		[totalAmountEUR, eurToIdrRate],
	);

	const hasDutyItems = cartItems.some((item) => item?.duty === true);
	const backTo = hasDutyItems ? "/invoices" : "/cart";
	const backLabel = hasDutyItems ? "Back to Invoices" : "Back to Cart";

	// Derived names for downstream API calls
	const buyerFullName = `${firstName} ${lastName}`.trim();
	const deliveryRecipientFullName =
		`${deliveryRecipientFirstName} ${deliveryRecipientLastName}`.trim();

	const billingFullName = billingSameAsDelivery
		? deliveryRecipientFullName
		: `${billingFirstName} ${billingLastName}`.trim();

	// =========================
	// Form submission
	// =========================
	const handleSubmit = async (e) => {
		e.preventDefault();

		if (submitting) return;

		setSubmitting(true);
		setErrorMessage("");

		try {
			const orderId = `ORD-${Date.now()}`;
			const submittedAt = new Date().toISOString();
			const today = submittedAt.slice(0, 10);

			const paymentStatus = PAYMENT_STATUS_MAP[paymentMethod] || "";
			if (!paymentStatus) {
				throw new Error("Invalid payment method.");
			}

			const deliveryAddress = [
				deliveryRecipientFullName,
				deliveryRecipientPhone,
				deliveryStreet,
				deliveryPostalCode,
				deliveryCountry,
			]
				.filter(Boolean)
				.join(", ");

			const billingAddress = billingSameAsDelivery
				? [
						deliveryRecipientFullName,
						deliveryStreet,
						deliveryPostalCode,
						deliveryCountry,
					]
						.filter(Boolean)
						.join(", ")
				: [
						billingFullName,
						billingStreet,
						billingPostalCode,
						billingCountry,
					]
						.filter(Boolean)
						.join(", ");

			setBillingPhone(
				billingSameAsDelivery ? deliveryRecipientPhone : billingPhone,
			);

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
				buyerPhone: phone,
				buyerEmail: email,
				deliveryRecipientFullName,
				deliveryRecipientPhone,
				deliveryAddress,
				billingFullName,
				billingPhone,
				billingAddress,
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

				const routePage = await createOrGetOrderRoutePage({
					fromCountry: shipment.fromCountry,
					toCountry: shipment.toCountry,
					shipmentDate: shipment.shipmentDate,
				});

				const routeDbs = await createOrGetOrderRouteDatabases({
					datePageId: routePage.datePageId,
				});

				const penerimaanBarangDataSourceId =
					routeDbs.databases.penerimaanBarang.dataSourceId;
				const pembayaranDataSourceId =
					routeDbs.databases.pembayaran.dataSourceId;
				const pengirimanLokalDataSourceId =
					routeDbs.databases.pengirimanLokal.dataSourceId;

				if (
					!penerimaanBarangDataSourceId ||
					!pembayaranDataSourceId ||
					!pengirimanLokalDataSourceId
				) {
					throw new Error(
						"Missing route-specific Notion data source IDs.",
					);
				}

				await createPengirimanLokal({
					dataSourceId: pengirimanLokalDataSourceId,
					orderId,
					deliveryRecipientFullName:
						deliveryRecipientFullName || buyerFullName,
					deliveryRecipientPhone: deliveryRecipientPhone || phone,
					deliveryAddress,
				});

				await createPenerimaanBarang({
					dataSourceId: penerimaanBarangDataSourceId,
					orderId,
					buyerFullName,
					buyerPhone: phone,
					buyerEmail: email,
					packageType,
					quantity: Number(quantity),
					request: notes,
				});

				await createPembayaran({
					dataSourceId: pembayaranDataSourceId,
					orderId,
					billingFullName: billingFullName || buyerFullName,
					billingPhone: billingPhone || phone,
					billingAddress,
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

			localStorage.removeItem(CART_KEY);
			setCartItems([]);

			const successPayload = {
				orderId,
				buyerFullName,
				email,
				phone,
				deliveryRecipientFullName,
				deliveryAddress,
				billingFullName,
				billingAddress,
				totalAmountEUR,
				totalAmountIDR,
				itemsCount: cartItems.length,
				paidViaLabel: paymentMethod?.toUpperCase() || "",
				hasPaymentProof: Boolean(paymentProof),
				submittedAt,
				status: "Order request received",
				items: shipments.map((shipment, index) => ({
					lineNumber: index + 1,
					description: shipment.packageType || "Shipment",
					packageType: shipment.packageType || "-",
					quantityLabel: getItemQuantityLabel(shipment.item),
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
						Checkout
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
								firstName={firstName}
								setFirstName={setFirstName}
								lastName={lastName}
								setLastName={setLastName}
								phone={phone}
								setPhone={setPhone}
								email={email}
								setEmail={setEmail}
								deliveryRecipientFirstName={
									deliveryRecipientFirstName
								}
								setDeliveryRecipientFirstName={
									setDeliveryRecipientFirstName
								}
								deliveryRecipientLastName={
									deliveryRecipientLastName
								}
								setDeliveryRecipientLastName={
									setDeliveryRecipientLastName
								}
								deliveryRecipientPhone={deliveryRecipientPhone}
								setDeliveryRecipientPhone={
									setDeliveryRecipientPhone
								}
								deliveryStreet={deliveryStreet}
								setDeliveryStreet={setDeliveryStreet}
								deliveryPostalCode={deliveryPostalCode}
								setDeliveryPostalCode={setDeliveryPostalCode}
								deliveryCountry={deliveryCountry}
								setDeliveryCountry={setDeliveryCountry}
								billingSameAsDelivery={billingSameAsDelivery}
								setBillingSameAsDelivery={
									setBillingSameAsDelivery
								}
								billingFirstName={billingFirstName}
								setBillingFirstName={setBillingFirstName}
								billingLastName={billingLastName}
								setBillingLastName={setBillingLastName}
								billingPhone={billingPhone}
								setBillingPhone={setBillingPhone}
								billingStreet={billingStreet}
								setBillingStreet={setBillingStreet}
								billingPostalCode={billingPostalCode}
								setBillingPostalCode={setBillingPostalCode}
								billingCountry={billingCountry}
								setBillingCountry={setBillingCountry}
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
									eurToIdrRate={eurToIdrRate}
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
