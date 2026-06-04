import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
	FaCheckCircle,
	FaArrowRight,
	FaReceipt,
	FaDownload,
} from "react-icons/fa";
import { CART_KEY, CHECKOUT_SUCCESS_KEY } from "../utils/constants";
import { formatDateToDDMMYYYY } from "../utils/formatDate";
import {
	downloadOrderConfirmationPdf,
	sendOrderConfirmationEmail,
} from "../api/orderConfirmationApi";
import { EMPTY_SUCCESS_PAYLOAD } from "../types/checkout";

const CheckoutSuccessPage = () => {
	const navigate = useNavigate();
	const location = useLocation();

	const [sendingEmail, setSendingEmail] = useState(false);
	const [downloadingPdf, setDownloadingPdf] = useState(false);
	const [emailSent, setEmailSent] = useState(false);
	const [actionError, setActionError] = useState("");

	const hasAutoSentEmailRef = useRef(false);

	const fallbackState = useMemo(() => {
		try {
			const raw = sessionStorage.getItem(CHECKOUT_SUCCESS_KEY);
			return raw ? JSON.parse(raw) : null;
		} catch {
			return null;
		}
	}, []);

	const successPayload = useMemo(() => {
		return location.state || fallbackState || EMPTY_SUCCESS_PAYLOAD;
	}, [location.state, fallbackState]);

	useEffect(() => {
		localStorage.removeItem(CART_KEY);
	}, []);

	const hasSummary =
		successPayload.orderId ||
		successPayload.buyerFullName ||
		successPayload.buyerEmail ||
		successPayload.buyerPhone ||
		successPayload.buyerAddress ||
		successPayload.deliveryFullName ||
		successPayload.deliveryAddress ||
		successPayload.deliveryEmail ||
		successPayload.deliveryPhone ||
		successPayload.totalAmountEUR != null ||
		successPayload.totalAmountIDR != null ||
		successPayload.items.length > 0;

	const nextSteps = useMemo(
		() => [
			"You'll receive your order confirmation per email in a few minutes.",
			"Our team will review your payment details.",
			"We’ll confirm your shipment schedule as we process your order.",
			"We’ll send the warehouse address and delivery instructions via WhatsApp.",
		],
		[],
	);

	const handleDownloadPdf = async () => {
		try {
			setDownloadingPdf(true);
			setActionError("");

			await downloadOrderConfirmationPdf(successPayload);
		} catch (err) {
			console.error(err);
			setActionError(err.message || "Failed to download PDF.");
		} finally {
			setDownloadingPdf(false);
		}
	};

	const handleSendConfirmationEmail = useCallback(
		async ({ manual = false } = {}) => {
			if (!successPayload.buyerEmail) {
				setActionError(
					"Missing buyer email. Cannot send confirmation email.",
				);
				return;
			}

			const emailSentKey = successPayload.orderId
				? `order-confirmation-email-sent-${successPayload.orderId}`
				: "order-confirmation-email-sent-current";

			try {
				setSendingEmail(true);
				setEmailSent(false);
				setActionError("");

				await sendOrderConfirmationEmail(successPayload);

				sessionStorage.setItem(emailSentKey, "true");
				setEmailSent(true);

				if (manual) {
					setActionError("");
				}
			} catch (err) {
				console.error(err);
				setActionError(
					err.message || "Failed to send confirmation email.",
				);
			} finally {
				setSendingEmail(false);
			}
		},
		[successPayload],
	);

	useEffect(() => {
		if (
			!hasSummary ||
			!successPayload.buyerEmail ||
			hasAutoSentEmailRef.current
		) {
			return;
		}

		const emailSentKey = successPayload.orderId
			? `order-confirmation-email-sent-${successPayload.orderId}`
			: "order-confirmation-email-sent-current";

		if (sessionStorage.getItem(emailSentKey) === "true") {
			setEmailSent(true);
			return;
		}

		hasAutoSentEmailRef.current = true;

		handleSendConfirmationEmail();
	}, [hasSummary, successPayload, handleSendConfirmationEmail]);

	const formatOptionalDate = (value) => {
		if (!value || value === "-") return "-";

		try {
			return formatDateToDDMMYYYY(value);
		} catch {
			return value;
		}
	};

	const formatOptionalEUR = (value) => {
		const numberValue = Number(value);

		if (!Number.isFinite(numberValue)) return "-";

		return `€${numberValue.toFixed(2)}`;
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

						{successPayload.orderId ? (
							<div className="mt-5 inline-flex items-center rounded-full bg-green-50 border border-green-200 px-4 py-2">
								<FaReceipt className="text-green-800 mr-2" />
								<span className="text-sm font-semibold text-green-900">
									Order reference: {successPayload.orderId}
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

								<div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
									<div>
										<h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
											Buyer / Billing Information
										</h3>
										<div className="mt-2 space-y-1 text-sm">
											<p className="subtext font-semibold text-gray-900">
												{successPayload.buyerFullName ||
													"-"}
											</p>
											<p className="subtext text-gray-600">
												{successPayload.buyerEmail ||
													"-"}
											</p>
											<p className="subtext text-gray-600">
												{successPayload.buyerPhone ||
													"-"}
											</p>
											<p className="subtext text-gray-600">
												{successPayload.buyerAddress ||
													"-"}
											</p>
										</div>
									</div>

									<div>
										<h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
											Delivery Information
										</h3>
										<div className="mt-2 space-y-1 text-sm">
											<p className="subtext font-semibold text-gray-900">
												{successPayload.deliveryFullName ||
													"-"}
											</p>
											<p className="subtext text-gray-600">
												{successPayload.deliveryEmail ||
													"-"}
											</p>
											<p className="subtext text-gray-600">
												{successPayload.deliveryPhone ||
													"-"}
											</p>
											<p className="subtext text-gray-600">
												{successPayload.deliveryAddress ||
													"-"}
											</p>
										</div>
									</div>
								</div>

								{successPayload.items.length > 0 && (
									<div className="mt-5 border-t pt-4">
										<div className="mb-3 flex items-center justify-between gap-4">
											<h3 className="text-sm font-semibold text-gray-900">
												Shipments
											</h3>
											<span className="text-xs text-gray-500">
												{successPayload.items.length}{" "}
												item
												{successPayload.items.length ===
												1
													? ""
													: "s"}
											</span>
										</div>

										<div className="divide-y rounded-xl border bg-white">
											{successPayload.items.map(
												(item, index) => (
													<div
														key={`${item.lineNumber || index}-${item.shipmentDate || ""}`}
														className="p-3"
													>
														<div className="flex items-start justify-between gap-4">
															<div>
																<p className="text-sm font-semibold text-gray-900">
																	Shipment{" "}
																	{item.lineNumber ||
																		index +
																			1}
																</p>
																<p className="subtext flex flex-wrap items-center gap-1 mt-2 text-xs text-gray-600">
																	<span>
																		{item.fromCountry ||
																			"-"}{" "}
																		→{" "}
																		{item.toCountry ||
																			"-"}
																	</span>

																	<span className="text-gray-400">
																		·
																	</span>

																	<span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 font-semibold text-amber-700 ring-1 ring-amber-200">
																		{formatOptionalDate(
																			item.shipmentDate,
																		)}
																	</span>
																</p>
																<p className="subtext text-xs mt-2 text-gray-600">
																	{item.packageType ||
																		"-"}
																	{item.billedWeightKg !=
																	null
																		? ` · ${Number(item.billedWeightKg).toFixed(1)} kg`
																		: ""}
																</p>
															</div>

															<div className="text-right text-sm font-semibold text-gray-900">
																{formatOptionalEUR(
																	item.amountEUR,
																)}
															</div>
														</div>

														{item.priceBreakdown && (
															<details className="mt-2">
																<summary className="cursor-pointer text-xs font-medium text-gray-500">
																	Price
																	details
																</summary>
																<p className="subtext mt-1 text-xs text-gray-600">
																	{
																		item.priceBreakdown
																	}
																</p>
															</details>
														)}
													</div>
												),
											)}
										</div>
									</div>
								)}

								<div className="mt-5 border-t pt-4">
									<div className="grid grid-cols-1 gap-y-2 text-sm sm:grid-cols-2 sm:gap-x-10 lg:gap-x-16">
										<div className="flex justify-between gap-4">
											<span className="text-gray-600">
												Total EUR
											</span>
											<span className="subtext font-semibold text-gray-900">
												{successPayload.totalAmountEUR !=
												null
													? `€${Number(successPayload.totalAmountEUR).toFixed(2)}`
													: "-"}
											</span>
										</div>

										<div className="flex justify-between gap-4">
											<span className="text-gray-600">
												Total IDR
											</span>
											<span className="subtext font-semibold text-gray-900">
												{successPayload.totalAmountIDR !=
												null
													? `IDR ${Number(successPayload.totalAmountIDR).toLocaleString()}`
													: "-"}
											</span>
										</div>

										<div className="flex justify-between gap-4">
											<span className="text-gray-600">
												Payment method
											</span>
											<span className="subtext font-semibold text-gray-900">
												{successPayload.paidViaLabel ||
													"-"}
											</span>
										</div>
									</div>
								</div>
							</div>

							<div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
								{sendingEmail && (
									<p className="mt-3 text-sm text-gray-600">
										Sending confirmation email to{" "}
										<span className="font-semibold text-gray-800">
											{successPayload.buyerEmail ||
												"your email"}
										</span>
										...
									</p>
								)}

								{emailSent && (
									<p className="mt-3 text-sm text-green-700">
										Confirmation email sent to{" "}
										<span className="font-semibold text-gray-800">
											{successPayload.buyerEmail ||
												"your email"}
										</span>
										.
									</p>
								)}

								{actionError && (
									<p className="mt-2 text-xs text-red-700">
										{actionError}
									</p>
								)}

								<div className="mt-3 flex flex-col items-center justify-center gap-2 sm:flex-row">
									<button
										type="button"
										onClick={handleDownloadPdf}
										disabled={downloadingPdf}
										className="button-secondary inline-flex items-center justify-center px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
									>
										<FaDownload className="mr-2 text-xs" />
										{downloadingPdf
											? "Downloading..."
											: "Download PDF"}
									</button>

									<button
										type="button"
										onClick={() =>
											handleSendConfirmationEmail({
												manual: true,
											})
										}
										disabled={
											sendingEmail ||
											!successPayload.buyerEmail
										}
										className="button-primary inline-flex items-center justify-center px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
									>
										{sendingEmail
											? "Sending..."
											: "Resend email"}
									</button>
								</div>

								<p className="subtext mt-3 text-xs text-gray-500">
									Didn&apos;t receive the email? Check your
									spam folder or resend it.
								</p>
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
