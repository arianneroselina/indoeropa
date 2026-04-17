import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowRight, FaInfoCircle } from "react-icons/fa";
import { CART_KEY } from "../utils/constants";
import { ShipmentMeta } from "../components/shipping/ShipmentMeta";

const limit = 125;
const customsFee = 0.025; // 2.5%

/**
 * @param {number | undefined} value
 */
const calculateCustomsFee = (value) =>
	Number.isFinite(value) && value > limit
		? Number((value * customsFee).toFixed(2))
		: undefined;

const InvoiceUploadsPage = () => {
	const navigate = useNavigate();
	const [cartItems, setCartItems] = useState([]);

	// session-only upload state (NOT persisted)
	// TODO: upload to Notion
	const [proofUploaded, setProofUploaded] = useState({});
	const [errorMessage, setErrorMessage] = useState("");

	useEffect(() => {
		const savedCartItems = localStorage.getItem(CART_KEY);
		if (!savedCartItems) return;

		const parsed = JSON.parse(savedCartItems);

		// keep only shipment-owned invoice/customs fields on the cart item itself
		const cleaned = parsed.map((item) => ({
			...item,
			invoiceRequired:
				item?.invoiceRequired === true
					? true
					: item?.invoiceRequired === false
						? false
						: undefined,
			originalValueEUR:
				item?.originalValueEUR !== undefined &&
				item?.originalValueEUR !== null &&
				item?.originalValueEUR !== ""
					? Number(item.originalValueEUR)
					: undefined,
			customsFeeEUR:
				item?.customsFeeEUR !== undefined &&
				item?.customsFeeEUR !== null
					? Number(item.customsFeeEUR)
					: undefined,
		}));

		setCartItems(cleaned);
		localStorage.setItem(CART_KEY, JSON.stringify(cleaned));
	}, []);

	const relevant = useMemo(
		() => cartItems.filter((item) => item?.duty === true),
		[cartItems],
	);

	useEffect(() => {
		if (cartItems.length > 0 && relevant.length === 0) {
			navigate("/checkout", { replace: true });
		}
	}, [cartItems.length, relevant.length, navigate]);

	/**
	 * @param {string} itemKey
	 * @param {(item: any) => any} updater
	 */
	const updateCartItem = (itemKey, updater) => {
		setCartItems((prev) => {
			const next = prev.map((item) =>
				item.key === itemKey ? updater(item) : item,
			);

			localStorage.setItem(CART_KEY, JSON.stringify(next));
			return next;
		});
	};

	/**
	 * @param {string} itemKey
	 * @param {boolean | undefined} invoiceRequired
	 */
	const updateInvoiceRequirement = (itemKey, invoiceRequired) => {
		updateCartItem(itemKey, (item) => {
			if (invoiceRequired !== true) {
				return {
					...item,
					invoiceRequired,
					originalValueEUR: undefined,
					customsFeeEUR: undefined,
				};
			}

			const originalValueEUR = item.originalValueEUR;
			const customsFeeEUR = calculateCustomsFee(originalValueEUR);

			return {
				...item,
				invoiceRequired: true,
				originalValueEUR,
				customsFeeEUR,
			};
		});
	};

	/**
	 * @param {string} itemKey
	 * @param {string | undefined} rawValue
	 */
	const updateOriginalValueEUR = (itemKey, rawValue) => {
		updateCartItem(itemKey, (item) => {
			const originalValueEUR =
				rawValue === undefined || rawValue === ""
					? undefined
					: Number(rawValue);

			return {
				...item,
				originalValueEUR,
				customsFeeEUR: calculateCustomsFee(originalValueEUR),
			};
		});
	};

	const setProofFile = (itemKey, file) => {
		setProofUploaded((prev) => ({ ...prev, [itemKey]: !!file }));
	};

	const isInvoiceComplete = relevant.every((item) => {
		if (item.invoiceRequired === undefined) return false;
		if (item.invoiceRequired === false) return true;

		const valueEUR = Number(item.originalValueEUR);

		if (!Number.isFinite(valueEUR) || valueEUR <= limit) return false;
		if (!proofUploaded[item.key]) return false;

		return true;
	});

	const handleContinue = (e) => {
		e.preventDefault();
		setErrorMessage("");

		for (const item of relevant) {
			if (item.invoiceRequired === undefined) {
				setErrorMessage(
					`Please choose whether the original item value is above €${limit} for each relevant shipment.`,
				);
				return;
			}

			if (item.invoiceRequired) {
				const valueEUR = Number(item.originalValueEUR);

				if (!Number.isFinite(valueEUR) || valueEUR <= limit) {
					setErrorMessage(
						`Original item value must be bigger than €${limit} when selecting 'Yes'.`,
					);
					return;
				}

				if (!proofUploaded[item.key]) {
					setErrorMessage(
						`Please upload an invoice/receipt for every shipment marked as over €${limit}.`,
					);
					return;
				}
			}
		}

		navigate("/checkout");
	};

	return (
		<section className="py-24 bg-gray-100">
			<div className="max-w-screen-xl mx-auto px-4">
				<div className="flex justify-between items-center mb-6">
					<Link
						to="/cart"
						className="text-primary flex items-center gap-2"
					>
						<FaArrowRight className="transform rotate-180" />
						<span>Back to Cart</span>
					</Link>

					<h2 className="text-4xl font-semibold text-center">
						Invoices Upload
					</h2>
				</div>

				<div className="bg-white p-8 rounded-lg shadow-md">
					<div className="subtext mb-6 rounded-xl border bg-amber-50 px-4 py-3">
						<p className="text-sm text-gray-700">
							For the items listed below with an{" "}
							<span className="font-semibold">
								original value above €{limit}
							</span>
							, an invoice or receipt is required.
							<br />
							<span className="inline-flex items-center gap-2 relative group">
								<span className="font-semibold">
									A 2.5% customs handling fee will be added
								</span>
								<FaInfoCircle className="text-gray-400 hover:text-gray-600 transition cursor-help" />
								<span
									className="
										pointer-events-none absolute left-0 top-full mt-2 w-72
										rounded-lg border bg-white px-3 py-2 text-xs text-gray-700 shadow-lg
										opacity-0 translate-y-1 transition
										group-hover:opacity-100 group-hover:translate-y-0
										z-20
									"
								>
									This fee covers customs processing,
									declaration handling, and administrative
									costs required for items valued above €
									{limit}.
								</span>
							</span>
						</p>
					</div>

					<form onSubmit={handleContinue} className="space-y-6">
						<div className="space-y-4">
							{relevant.map((item) => {
								const originalValueNum = Number(
									item.originalValueEUR,
								);

								const isValueInvalid =
									item.invoiceRequired === true &&
									item.originalValueEUR !== undefined &&
									(!Number.isFinite(originalValueNum) ||
										originalValueNum <= limit);

								const fee = Number(
									item.customsFeeEUR || 0,
								).toFixed(2);

								return (
									<div
										key={item.key}
										className="rounded-2xl border bg-gray-50/60 p-5"
									>
										<div className="flex items-start justify-between gap-4">
											<div className="flex items-start justify-between gap-4">
												<ShipmentMeta
													item={item}
													showIndex={true}
													showDateChip={false}
													showDetailChip={false}
													compact={true}
												/>
											</div>
										</div>

										<div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
											<div>
												<label className="block text-sm font-semibold text-gray-800">
													Original item value over €
													{limit}?{" "}
													<span className="text-red-500">
														*
													</span>
												</label>

												<select
													className="subtext w-full p-3 border border-gray-300 rounded-xl input-focus"
													value={
														item.invoiceRequired ===
														true
															? "true"
															: item.invoiceRequired ===
																  false
																? "false"
																: ""
													}
													onChange={(e) => {
														const value =
															e.target.value ===
															""
																? undefined
																: e.target
																		.value ===
																	"true";

														updateInvoiceRequirement(
															item.key,
															value,
														);
													}}
												>
													<option value="">
														Select option
													</option>
													<option value="false">
														No
													</option>
													<option value="true">
														Yes
													</option>
												</select>
											</div>

											<div
												className={
													item.invoiceRequired
														? ""
														: "opacity-50 pointer-events-none"
												}
											>
												<label className="block text-sm font-semibold text-gray-800">
													Original item value (€)
												</label>

												<input
													type="number"
													inputMode="decimal"
													min="0"
													step="0.01"
													placeholder="e.g. 150.00"
													className={[
														"subtext w-full p-3 border rounded-xl transition",
														isValueInvalid
															? "border-red-500 focus:ring-red-500"
															: "border-gray-300 input-focus",
													].join(" ")}
													value={
														item.originalValueEUR ??
														""
													}
													onChange={(e) =>
														updateOriginalValueEUR(
															item.key,
															e.target.value.trim() ===
																""
																? undefined
																: e.target
																		.value,
														)
													}
													required={
														item.invoiceRequired
													}
												/>

												{isValueInvalid && (
													<p className="subtext text-xs text-red-600 mt-2">
														Value must be bigger
														than €{limit} when
														selecting "Yes".
													</p>
												)}

												{!isValueInvalid &&
													item.invoiceRequired && (
														<p className="subtext text-xs text-gray-600 mt-2">
															Customs handling
															fee:{" "}
															<span className="font-semibold text-gray-800">
																€{fee}
															</span>{" "}
															will be added to the
															transport price.
														</p>
													)}
											</div>

											<div
												className={
													item.invoiceRequired
														? ""
														: "opacity-50 pointer-events-none"
												}
											>
												<label className="block text-sm font-semibold text-gray-800">
													Upload invoice/receipt{" "}
													{item.invoiceRequired && (
														<span className="text-red-500">
															*
														</span>
													)}
												</label>

												<input
													type="file"
													className="subtext w-full p-3 border border-gray-300 rounded-xl input-focus"
													onChange={(e) =>
														setProofFile(
															item.key,
															e.target
																.files?.[0] ??
																null,
														)
													}
													required={
														item.invoiceRequired
													}
												/>
											</div>
										</div>
									</div>
								);
							})}
						</div>

						<div className="flex items-center justify-end gap-3">
							<Link to="/cart" className="button-secondary">
								Cancel
							</Link>

							<button
								type="submit"
								disabled={!isInvoiceComplete}
								className={[
									"button-primary font-semibold",
									isInvoiceComplete
										? "bg-secondary hover:bg-secondary-900 text-white"
										: "bg-gray-200 text-gray-500 hover:bg-gray-200 cursor-not-allowed",
								].join(" ")}
							>
								Continue to Checkout{" "}
								<FaArrowRight className="ml-2 text-lg" />
							</button>
						</div>

						{errorMessage ? (
							<div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
								{errorMessage}
							</div>
						) : null}
					</form>
				</div>
			</div>
		</section>
	);
};

export default InvoiceUploadsPage;
