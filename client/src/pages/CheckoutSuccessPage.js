import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
	FaCheckCircle,
	FaArrowRight,
	FaEnvelope,
	FaReceipt,
	FaDownload,
} from "react-icons/fa";
import { CART_KEY, CHECKOUT_SUCCESS_KEY } from "../utils/constants";
import { formatDateToDDMMYYYY } from "../utils/formatDate";
import {
	downloadOrderConfirmationPdf,
	sendOrderConfirmationEmail,
} from "../api/orderConfirmationApi";

const CheckoutSuccessPage = () => {
	const navigate = useNavigate();
	const location = useLocation();

	// State to manage the progress of the email sending process
	const [sendingEmail, setSendingEmail] = useState(false);
	const [downloadingPdf, setDownloadingPdf] = useState(false);
	const [emailSent, setEmailSent] = useState(false);
	const [actionError, setActionError] = useState("");

	const fallbackState = useMemo(() => {
		try {
			const raw = sessionStorage.getItem(CHECKOUT_SUCCESS_KEY);
			return raw ? JSON.parse(raw) : null;
		} catch {
			return null;
		}
	}, []);

	const successData = location.state || fallbackState || {};
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
	} = successData;

	useEffect(() => {
		localStorage.removeItem(CART_KEY);
	}, []);

	const hasSummary =
		orderId ||
		fullName ||
		email ||
		phone ||
		billingAddress ||
		fromCountry ||
		toCountry ||
		shipmentDate ||
		totalAmountEUR != null ||
		totalAmountIDR != null ||
		typeof itemsCount === "number";

	const nextSteps = useMemo(
		() => [
			"Download or send the order confirmation via email.",
			"Our team will review your payment details.",
			"We’ll confirm your shipment schedule as we process your order.",
			"You’ll receive updates if we need additional information or when your order status changes.",
		],
		[],
	);

	const handleDownloadPdf = async () => {
		try {
			setDownloadingPdf(true);
			setActionError("");

			await downloadOrderConfirmationPdf(successData);
		} catch (err) {
			console.error(err);
			setActionError(err.message || "Failed to download PDF.");
		} finally {
			setDownloadingPdf(false);
		}
	};

	const handleSendEmail = async () => {
		try {
			setSendingEmail(true);
			setEmailSent(false);
			setActionError("");

			await sendOrderConfirmationEmail(successData);
			setEmailSent(true);
		} catch (err) {
			console.error(err);
			setActionError(err.message || "Failed to send confirmation email.");
		} finally {
			setSendingEmail(false);
		}
	};

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
												{formatDateToDDMMYYYY(
													shipmentDate,
												)}
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

							<div className="text-center">
								<p className="text-sm text-gray-600">
									Download your order confirmation as a PDF or
									send it to{" "}
									<span className="font-semibold text-gray-800">
										{email || "your email"}
									</span>
									.
								</p>

								<div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
									<button
										type="button"
										onClick={handleDownloadPdf}
										disabled={downloadingPdf}
										className="button-secondary inline-flex items-center justify-center"
									>
										<FaDownload className="mr-2 text-sm" />
										{downloadingPdf
											? "Downloading..."
											: "Download PDF"}
									</button>

									<button
										type="button"
										onClick={handleSendEmail}
										disabled={sendingEmail}
										className="button-primary inline-flex items-center justify-center"
									>
										<FaEnvelope className="mr-2 text-sm" />
										{sendingEmail
											? "Sending..."
											: "Send per email"}
									</button>
								</div>

								{emailSent && (
									<p className="mt-3 text-sm text-green-700">
										Confirmation email sent successfully.
									</p>
								)}

								{actionError && (
									<p className="mt-3 text-sm text-red-700">
										{actionError}
									</p>
								)}
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
