import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import { CART_KEY, INVOICES_KEY } from "../utils/constants";
import { hasDutyStep, getRelevantDutyItems } from "../utils/dutyHelper";
import { PAYMENT_STATUS_MAP } from "../utils/notionMapping";
import CheckoutForm from "../components/checkout/CheckoutForm";
import OrderSummary from "../components/checkout/OrderSummary";
import {
	buildCustomsFeeByKey,
	calculatePriceWithCustoms,
	getItemQuantity,
	getTotalAmountEUR,
} from "../utils/checkoutHelper";
import {
	// createPengirimanLokal,
	createPenerimaanBarang,
	createPembayaran,
} from "../api/checkoutApi";
import { useShippingData } from "../hooks/useShippingData";

const CheckoutPage = () => {
	const navigate = useNavigate();

	// =========================
	// Local state
	// =========================
	const [cartItems, setCartItems] = useState([]);
	const [invoiceByItem, setInvoiceByItem] = useState({});

	// Billing address
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [street, setStreet] = useState("");
	const [postalCode, setPostalCode] = useState("");
	const [country, setCountry] = useState("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");

	const [paymentMethod, setPaymentMethod] = useState("");
	const [paymentProof, setPaymentProof] = useState(null);
	const [notes, setNotes] = useState("");
	const [termsAccepted, setTermsAccepted] = useState(false);

	const [submitting, setSubmitting] = useState(false);

	const { data } = useShippingData();
	const eurToIdrRate = data?.EUR_TO_IDR_RATE ?? 0;

	// =========================
	// Load persisted checkout data
	// =========================
	useEffect(() => {
		try {
			const savedCartItems = localStorage.getItem(CART_KEY);
			if (savedCartItems) setCartItems(JSON.parse(savedCartItems));

			const savedInvoices = localStorage.getItem(INVOICES_KEY);
			if (savedInvoices) setInvoiceByItem(JSON.parse(savedInvoices));
		} catch (err) {
			console.error("Failed to parse local storage checkout data", err);
			localStorage.removeItem(CART_KEY);
			localStorage.removeItem(INVOICES_KEY);
		}
	}, []);

	// =========================
	// Derived pricing
	// =========================
	const relevantDutyItems = useMemo(() => {
		return getRelevantDutyItems(cartItems);
	}, [cartItems]);

	const customsFeeByKey = useMemo(() => {
		return buildCustomsFeeByKey(relevantDutyItems, invoiceByItem);
	}, [relevantDutyItems, invoiceByItem]);

	const totalAmountEUR = useMemo(() => {
		return getTotalAmountEUR(cartItems, customsFeeByKey);
	}, [cartItems, customsFeeByKey]);

	const totalAmountIDR = useMemo(() => {
		return totalAmountEUR * eurToIdrRate;
	}, [totalAmountEUR, eurToIdrRate]);

	const backTo = hasDutyStep(cartItems) ? "/invoices" : "/cart";
	const backLabel = hasDutyStep(cartItems)
		? "Back to Invoices"
		: "Back to Cart";

	// Derived full name for downstream API calls
	const fullName = `${firstName} ${lastName}`.trim();

	// =========================
	// Form submission
	// =========================
	const orderId = `ORD-${Date.now()}`;

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (submitting) return;
		setSubmitting(true);

		try {
			const today = new Date().toISOString().slice(0, 10);
			const paymentStatus = PAYMENT_STATUS_MAP[paymentMethod] || "";

            if (!paymentStatus) {
                throw new Error("Invalid payment method.");
            }

            // Compose billing address string for the local delivery record
			const billingAddress = [street, postalCode, country]
				.filter(Boolean)
				.join(", ");

			// TODO: this needs to be handled differently for each route
			/*await createPengirimanLokal({
			    orderId,
				fullName,
                phone,
                email,
				address: billingAddress,
			});*/

			for (const item of cartItems) {
				const packageType = item.packageTypeLabel ?? "-";
				const { itemTotalEur, priceBreakdown } =
					calculatePriceWithCustoms(item, customsFeeByKey);

				await createPenerimaanBarang({
					orderId,
					fullName,
					phone,
					email,
					packageType,
					quantity: getItemQuantity(item),
					request: notes,
				});

				await createPembayaran({
					orderId,
					fullName,
					phone,
					email,
					billingAddress,
					packageType,
					totalEur: itemTotalEur,
					priceBreakdown: priceBreakdown,
					quantity: getItemQuantity(item),
					paymentStatus,
					paymentDate: today,
					paymentProof,
				});
			}

			localStorage.removeItem(CART_KEY);
			localStorage.removeItem(INVOICES_KEY);
			setCartItems([]);
			setInvoiceByItem({});

			navigate("/checkout/success", {
				state: {
					fullName,
					totalAmountEUR,
					totalAmountIDR,
					itemsCount: cartItems.length,
					paidViaLabel: paymentMethod?.toUpperCase() || "",
				},
			});
		} catch (err) {
			console.error(err);
			alert(err.message || "Checkout failed.");
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
								// Billing address
								firstName={firstName}
								setFirstName={setFirstName}
								lastName={lastName}
								setLastName={setLastName}
								street={street}
								setStreet={setStreet}
								postalCode={postalCode}
								setPostalCode={setPostalCode}
								country={country}
								setCountry={setCountry}
								email={email}
								setEmail={setEmail}
								phone={phone}
								setPhone={setPhone}
								// Payment
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
									relevantDutyItems={relevantDutyItems}
									customsFeeByKey={customsFeeByKey}
									totalAmountEUR={totalAmountEUR}
									totalAmountIDR={totalAmountIDR}
									eurToIdrRate={eurToIdrRate}
								/>
							</aside>
						</div>
					)}
				</div>
			</div>
		</section>
	);
};

export default CheckoutPage;
