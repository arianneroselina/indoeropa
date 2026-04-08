import React, { useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
	FaCheckCircle,
	FaArrowRight,
	FaEnvelope,
	FaPhone,
	FaMapMarkerAlt,
	FaReceipt,
} from "react-icons/fa";
import {
	CART_KEY,
	CHECKOUT_SUCCESS_KEY,
	INVOICES_KEY,
} from "../utils/constants";
import {formatDateToDDMMYYYY} from "../utils/formatDate";

const CheckoutSuccessPage = () => {
	const navigate = useNavigate();
	const location = useLocation();

	const fallbackState = (() => {
		try {
			return JSON.parse(
				sessionStorage.getItem(CHECKOUT_SUCCESS_KEY) || "null",
			);
		} catch {
			return null;
		}
	})();

	const {
		orderId = "",
		fullName = "",
		email = "",
		phone = "",
		billingAddress = "",
		fromCountry = "",
		toCountry = "",
		shipmentDate = "",
		totalAmountEUR = null,
		totalAmountIDR = null,
		itemsCount = null,
		paidViaLabel = "",
		hasPaymentProof = false,
	} = location.state || fallbackState || {};

	useEffect(() => {
		localStorage.removeItem(CART_KEY);
		localStorage.removeItem(INVOICES_KEY);
	}, []);

	const hasSummary =
		orderId ||
		fullName ||
		email ||
		phone ||
		fromCountry ||
		toCountry ||
		shipmentDate ||
		totalAmountEUR != null ||
		totalAmountIDR != null ||
		typeof itemsCount === "number";

	const nextSteps = useMemo(
		() => [
			"We'll send you the order confirmation via email.",
			"Your payment details will be reviewed.",
			"We’ll confirm the shipment schedule.",
			"We’ll contact you if any extra information is needed.",
		],
		[],
	);

	return (
		<section className="py-24 bg-gray-100">
			<div className="max-w-screen-4xl mx-auto px-4">
				<div className="max-w-screen-md mx-auto bg-white rounded-2xl shadow-md p-8">
					<div className="flex flex-col items-center text-center">
						<FaCheckCircle className="text-green-800 text-6xl" />
						<h1 className="text-3xl font-semibold text-gray-900 mt-4">
							Checkout successful
						</h1>
						<p className="subtext text-gray-600 mt-2 max-w-2xl">
							We received your shipment request and saved your
							order successfully.
						</p>

						{orderId ? (
							<div className="mt-5 inline-flex items-center rounded-full bg-green-50 border border-green-200 px-4 py-2">
								<FaReceipt className="text-green-800 mr-2" />
								<span className="text-sm font-semibold text-green-900">
									Order reference: {orderId}
								</span>
							</div>
						) : null}
					</div>

					{hasSummary ? (
						<div className="mt-8 grid grid-cols-1 gap-6">
							<div className="rounded-2xl border bg-gray-50 p-5">
								<h2 className="text-lg font-semibold text-gray-900">
									Order summary
								</h2>

								<div className="mt-4 space-y-3">
									{fullName && (
										<div className="flex items-center justify-between gap-4">
											<span className="text-sm text-gray-600">
												Name
											</span>
											<span className="text-sm subtext text-gray-900 text-right">
												{fullName}
											</span>
										</div>
									)}

									{typeof itemsCount === "number" && (
										<div className="flex items-center justify-between gap-4">
											<span className="text-sm text-gray-600">
												Shipments
											</span>
											<span className="text-sm subtext text-gray-900">
												{itemsCount}
											</span>
										</div>
									)}

									{fromCountry && toCountry && (
										<div className="flex items-center justify-between gap-4">
											<span className="text-sm text-gray-600">
												Route
											</span>
											<span className="text-sm subtext text-gray-900 text-right">
												{fromCountry} → {toCountry}
											</span>
										</div>
									)}

									{shipmentDate && (
										<div className="flex items-center justify-between gap-4">
											<span className="text-sm text-gray-600">
												Shipment date
											</span>
											<span className="text-sm subtext text-gray-900 text-right">
												{formatDateToDDMMYYYY(shipmentDate)}
											</span>
										</div>
									)}

									{totalAmountEUR != null && (
										<div className="flex items-center justify-between gap-4">
											<span className="text-sm text-gray-600">
												Total (EUR)
											</span>
											<span className="text-sm subtext text-gray-900">
												€
												{Number(totalAmountEUR).toFixed(
													2,
												)}
											</span>
										</div>
									)}

									{totalAmountIDR != null && (
										<div className="flex items-center justify-between gap-4">
											<span className="text-sm text-gray-600">
												Total (IDR)
											</span>
											<span className="text-sm subtext text-gray-900 text-right">
												IDR{" "}
												{Number(
													totalAmountIDR,
												).toLocaleString()}
											</span>
										</div>
									)}

									{paidViaLabel && (
										<div className="flex items-center justify-between gap-4">
											<span className="text-sm text-gray-600">
												Payment method
											</span>
											<span className="text-sm subtext text-gray-900 text-right">
												{paidViaLabel}
											</span>
										</div>
									)}

									<div className="flex items-center justify-between gap-4">
										<span className="text-sm text-gray-600">
											Payment proof
										</span>
										<span className="text-sm subtext text-gray-900 text-right">
											{hasPaymentProof
												? "Uploaded"
												: "Not uploaded"}
										</span>
									</div>
								</div>
							</div>

							<div className="rounded-2xl border p-5">
								<h2 className="text-lg font-semibold text-gray-900">
									Contact details
								</h2>

								<div className="mt-4 space-y-3 text-sm subtext text-gray-700">
									{email ? (
										<div className="flex items-start gap-3">
											<FaEnvelope className="mt-1 text-gray-500" />
											<span>{email}</span>
										</div>
									) : null}

									{phone ? (
										<div className="flex items-start gap-3">
											<FaPhone className="mt-1 text-gray-500" />
											<span>{phone}</span>
										</div>
									) : null}

									{billingAddress ? (
										<div className="flex items-start gap-3">
											<FaMapMarkerAlt className="mt-1 text-gray-500" />
											<span>{billingAddress}</span>
										</div>
									) : null}
								</div>
							</div>

							<div className="rounded-2xl border p-5">
								<h2 className="text-lg font-semibold text-gray-900">
									What happens next
								</h2>

								<div className="mt-4 space-y-3">
									{nextSteps.map((step, index) => (
										<div
											key={index}
											className="flex items-start gap-3"
										>
											<div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-900 text-xs font-semibold text-white">
												{index + 1}
											</div>
											<p className="text-sm subtext text-gray-700">
												{step}
											</p>
										</div>
									))}
								</div>

								<p className="mt-4 text-sm text-gray-500">
									Please keep your order reference in case you
									need support.
								</p>
							</div>
						</div>
					) : (
						<div className="mt-8 rounded-2xl border border-yellow-200 bg-yellow-50 p-5 text-sm text-yellow-800">
							Your order was completed, but the confirmation
							details are no longer available on this page. This
							can happen after refreshing the page.
						</div>
					)}

					<div className="mt-8 w-full flex flex-col sm:flex-row items-center justify-center gap-3">
						<Link
							to="/shipment"
							className="button-primary font-semibold inline-flex items-center justify-center"
						>
							Create another shipment
							<FaArrowRight className="ml-2 text-sm" />
						</Link>

						<button
							type="button"
							onClick={() => navigate("/")}
							className="button-secondary inline-flex items-center justify-center"
						>
							Back to home
						</button>
					</div>
				</div>
			</div>
		</section>
	);
};

export default CheckoutSuccessPage;
