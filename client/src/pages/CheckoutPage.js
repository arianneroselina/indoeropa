import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
	// createPengirimanLokal,
	createPenerimaanBarang,
	createPembayaran,
	createOrGetOrderRouteDatabases,
	createOrderHistory,
} from "../api/checkoutApi";
import { useShippingData } from "../hooks/useShippingData";
import { useLocation } from "react-router-dom";

const CheckoutPage = () => {
	const navigate = useNavigate();

	// =========================
	// Local state
	// =========================
	const [cartItems, setCartItems] = useState([]);

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

	const location = useLocation();
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
	const totalAmountEUR = useMemo(() => {
		return getTotalAmountEUR(cartItems);
	}, [cartItems]);

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

		try {
			const orderId = `ORD-${Date.now()}`;
			const submittedAt = new Date().toISOString();
			const today = submittedAt.slice(0, 10);

			const paymentStatus = PAYMENT_STATUS_MAP[paymentMethod] || "";
			if (!paymentStatus) {
				throw new Error("Invalid payment method.");
			}

			const billingAddress = [street, postalCode, country]
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
				fullName,
				email,
				phone,
				billingAddress,
				totalAmountEUR,
				totalAmountIDR,
				paymentStatus: paymentStatus || "",
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

				// TODO: this needs to be handled differently for each route
				/*await createPengirimanLokal({
                    dataSourceId: pengirimanLokalDataSourceId,
                    orderId,
                    fullName,
                    phone,
                    email,
                    address: billingAddress,
                });*/

				await createPenerimaanBarang({
					dataSourceId: penerimaanBarangDataSourceId,
					orderId,
					fullName,
					phone,
					email,
					packageType,
					quantity: Number(quantity),
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
					totalEUR: totalEUR,
					priceBreakdown,
					quantity: Number(quantity),
					paymentStatus,
					paymentDate: today,
					paymentProof,
				});
			}

			localStorage.removeItem(CART_KEY);
			setCartItems([]);

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
