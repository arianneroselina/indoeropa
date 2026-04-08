import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import {
	CART_KEY,
	INVOICES_KEY,
	CHECKOUT_SUCCESS_KEY,
} from "../utils/constants";
import { PAYMENT_STATUS_MAP } from "../utils/notionMapping";
import CheckoutForm from "../components/checkout/CheckoutForm";
import OrderSummary from "../components/checkout/OrderSummary";
import {
	buildCustomsFeeByKey,
	calculatePriceWithCustoms,
	getItemQuantity,
	getItemQuantityLabel,
	getTotalAmountEUR,
} from "../utils/checkoutHelper";
import {
	createOrGetOrderRoutePage,
	// createPengirimanLokal,
	createPenerimaanBarang,
	createPembayaran,
	createOrGetOrderRouteDatabases,
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
	const [errorMessage, setErrorMessage] = useState("");

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
		return cartItems
			.filter((item) => item?.duty === true)
			.map((item, index) => ({
				item,
				key:
					item.key ??
					`${item.fromCountry || "from"}-${item.toCountry || "to"}-${item.shipmentDate || "date"}-${index}`,
			}));
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

	const hasDutyItems = cartItems.some((item) => item?.duty === true);
	const backTo = hasDutyItems ? "/invoices" : "/cart";
	const backLabel = hasDutyItems ? "Back to Invoices" : "Back to Cart";

	// Derived full name for downstream API calls
	const fullName = `${firstName} ${lastName}`.trim();

	// =========================
	// Form submission
	// =========================
	const handleSubmit = async (e) => {
		e.preventDefault();

		if (submitting) return;
		setSubmitting(true);
		setErrorMessage("");

		const orderId = `ORD-${Date.now()}`;

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

			const firstItem = cartItems[0];
			if (
				!firstItem?.fromCountry ||
				!firstItem?.toCountry ||
				!firstItem?.shipmentDate
			) {
				throw new Error("Missing route information for checkout.");
			}

			// create a new route page if it doesn't exist yet
			const routePage = await createOrGetOrderRoutePage({
				fromCountry: firstItem.fromCountry,
				toCountry: firstItem.toCountry,
				shipmentDate: firstItem.shipmentDate,
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

			// TODO: this needs to be handled differently for each route
			/*await createPengirimanLokal({
                dataSourceId: pengirimanLokalDataSourceId,
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
					dataSourceId: penerimaanBarangDataSourceId,
					orderId,
					fullName,
					phone,
					email,
					packageType,
					quantity: getItemQuantity(item),
					request: notes,
				});

				await createPembayaran({
					dataSourceId: pembayaranDataSourceId,
					orderId,
					fullName,
					phone,
					email,
					billingAddress,
					packageType,
					totalEur: itemTotalEur,
					priceBreakdown,
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

			const successPayload = {
				orderId,
				fullName,
				email,
				phone,
				billingAddress,
				totalAmountEUR,
				totalAmountIDR,
				itemsCount: cartItems.length,
				paidViaLabel: paymentMethod?.toUpperCase() || "",
				hasPaymentProof: Boolean(paymentProof),
				submittedAt: new Date().toISOString(),
				status: "Order request received",
				items: cartItems.map((item, index) => {
					const { itemTotalEur, priceBreakdown } =
						calculatePriceWithCustoms(item, customsFeeByKey);

					return {
						lineNumber: index + 1,
						description: item.packageTypeLabel || "Shipment",
						packageType: item.packageTypeLabel || "-",
						quantityLabel: getItemQuantityLabel(item),
						weightKg: item.weightKg ?? null,
						billedWeightKg: item.billedWeightKg ?? null,
						fromCountry: item.fromCountry || "-",
						toCountry: item.toCountry || "-",
						shipmentDate: item.shipmentDate || "-",
						duty: Boolean(item.duty),
						amountEur: itemTotalEur,
						priceBreakdown,
					};
				}),
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
