import React from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { Link } from "react-router-dom";
import SectionCard from "./SectionCard";
import Input from "./InputField";
import { PAYMENT_DETAILS } from "../../utils/constants";
import {
	COD_DHL_ADDON_ID,
	INDONESIA_LOCAL_DELIVERY_OPTIONS,
} from "../../utils/checkoutHelper";
import { formatOptionalEUR } from "../../utils/formatters";

const PhoneInputField = ({
	label,
	value,
	onChange,
	required = false,
	defaultCountry = "DE",
}) => {
	return (
		<div>
			<label className="mb-1.5 block text-sm font-semibold text-gray-800">
				{label} {required && <span className="text-secondary">*</span>}
			</label>

			<PhoneInput
				international
				defaultCountry={defaultCountry}
				value={value || undefined}
				onChange={(nextValue) => onChange(nextValue || "")}
				placeholder="Enter phone number"
				required={required}
				className="subtext w-full rounded-xl border border-gray-300 bg-white p-3 text-gray-900 input-focus disabled:cursor-not-allowed disabled:bg-gray-100"
			/>
		</div>
	);
};

/**
 * CheckoutForm
 *
 * Props:
 * - handleSubmit
 * - buyer / billing info:
 *   buyerFirstName, setBuyerFirstName,
 *   buyerLastName, setBuyerLastName,
 *   buyerEmail, setBuyerEmail,
 *   buyerPhone, setBuyerPhone,
 *   buyerStreet, setBuyerStreet,
 *   buyerPostalCode, setBuyerPostalCode,
 *   buyerCity, setBuyerCity,
 *   buyerCountry, setBuyerCountry
 * - delivery info:
 *   sameAsBuyerInfo, setSameAsBuyerInfo
 *   deliveryFirstName, setDeliveryFirstName
 *   deliveryLastName, setDeliveryLastName
 *   deliveryEmail, setDeliveryEmail
 *   deliveryPhone, setDeliveryPhone
 *   deliveryStreet, setDeliveryStreet
 *   deliveryPostalCode, setDeliveryPostalCode
 *   deliveryCity, setDeliveryCity
 *   deliveryCountry, setDeliveryCountry
 * - dhl germany addon:
 *   dhlAddonEnabled,
 *   availableDhlAddons,
 *   dhlAddon, setDhlAddon,
 * - indonesia local delivery:
 *   indoLocalDeliveryEnabled,
 *   indoLocalDelivery,
 *   setIndoLocalDelivery,
 *   bubbleWrapPriceEUR,
 * - payment:
 *   paymentMethod, setPaymentMethod, setPaymentProof
 * - notes:
 *   notes, setNotes
 * - terms:
 *   termsAccepted, setTermsAccepted
 * - submitting
 */
const CheckoutForm = ({
	handleSubmit,
	buyerFirstName,
	setBuyerFirstName,
	buyerLastName,
	setBuyerLastName,
	buyerEmail,
	setBuyerEmail,
	buyerPhone,
	setBuyerPhone,
	buyerStreet,
	setBuyerStreet,
	buyerPostalCode,
	setBuyerPostalCode,
	buyerCity,
	setBuyerCity,
	buyerCountry,
	setBuyerCountry,

	sameAsBuyerInfo,
	setSameAsBuyerInfo,
	deliveryFirstName,
	setDeliveryFirstName,
	deliveryLastName,
	setDeliveryLastName,
	deliveryEmail,
	setDeliveryEmail,
	deliveryPhone,
	setDeliveryPhone,
	deliveryStreet,
	setDeliveryStreet,
	deliveryPostalCode,
	setDeliveryPostalCode,
	deliveryCity,
	setDeliveryCity,
	deliveryCountry,
	setDeliveryCountry,

	dhlAddonEnabled,
	availableDhlAddons,
	dhlAddon,
	setDhlAddon,
	indoLocalDeliveryEnabled,
	indoLocalDelivery,
	setIndoLocalDelivery,
	bubbleWrapPriceEUR,

	paymentMethod,
	setPaymentMethod,
	setPaymentProof,
	notes,
	setNotes,
	termsAccepted,
	setTermsAccepted,
	submitting,
}) => {
	const hasLocalDeliveryStep = dhlAddonEnabled || indoLocalDeliveryEnabled;
	const paymentStep = hasLocalDeliveryStep ? 4 : 3;
	const selectedPaymentDetails = PAYMENT_DETAILS[paymentMethod];
	const indoLocalDeliveryIsCOD =
		String(indoLocalDelivery || "")
			.trim()
			.toLowerCase() === COD_DHL_ADDON_ID;

	return (
		<div>
			<form onSubmit={handleSubmit} className="space-y-6">
				<fieldset
					disabled={submitting}
					className={submitting ? "opacity-70" : ""}
				>
					<SectionCard
						step={1}
						title="Buyer / Billing Information"
						tooltip="Details of the person placing the order and the billing address."
					>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<Input
								label="First Name"
								required
								type="text"
								value={buyerFirstName}
								onChange={(e) =>
									setBuyerFirstName(e.target.value)
								}
							/>
							<Input
								label="Last Name"
								required
								type="text"
								value={buyerLastName}
								onChange={(e) =>
									setBuyerLastName(e.target.value)
								}
							/>
						</div>

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<Input
								label="Email"
								required
								type="email"
								value={buyerEmail}
								onChange={(e) => setBuyerEmail(e.target.value)}
							/>
							<PhoneInputField
								label="Phone Number"
								required
								value={buyerPhone}
								onChange={setBuyerPhone}
							/>
						</div>

						<Input
							label="Street Address"
							required
							type="text"
							placeholder="e.g. Musterstraße 12"
							value={buyerStreet}
							onChange={(e) => setBuyerStreet(e.target.value)}
						/>

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
							<Input
								label="Postal Code"
								required
								type="text"
								placeholder="e.g. 60311"
								value={buyerPostalCode}
								onChange={(e) =>
									setBuyerPostalCode(e.target.value)
								}
							/>
							<Input
								label="City"
								required
								type="text"
								placeholder="e.g. Frankfurt am Main"
								value={buyerCity}
								onChange={(e) => setBuyerCity(e.target.value)}
							/>
							<Input
								label="Country"
								required
								type="text"
								placeholder="e.g. Germany"
								value={buyerCountry}
								onChange={(e) =>
									setBuyerCountry(e.target.value)
								}
							/>
						</div>
					</SectionCard>

					<SectionCard
						step={2}
						title="Delivery Information"
						tooltip="Recipient details and final delivery destination."
					>
						<label className="mb-4 flex items-center gap-3 rounded-md border border-gray-200 bg-gray-50 px-4 py-3 subtext text-sm text-gray-700">
							<input
								type="checkbox"
								checked={sameAsBuyerInfo}
								onChange={(e) =>
									setSameAsBuyerInfo(e.target.checked)
								}
								className="h-4 w-4 rounded border-gray-300"
							/>
							<span>
								Delivery information is the same as buyer /
								billing information
							</span>
						</label>

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<Input
								label="Recipient First Name"
								required
								type="text"
								value={deliveryFirstName}
								disabled={sameAsBuyerInfo}
								onChange={(e) =>
									setDeliveryFirstName(e.target.value)
								}
							/>
							<Input
								label="Recipient Last Name"
								required
								type="text"
								value={deliveryLastName}
								disabled={sameAsBuyerInfo}
								onChange={(e) =>
									setDeliveryLastName(e.target.value)
								}
							/>
						</div>

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<Input
								label="Recipient Email"
								required
								type="email"
								value={deliveryEmail}
								disabled={sameAsBuyerInfo}
								onChange={(e) =>
									setDeliveryEmail(e.target.value)
								}
							/>
							<PhoneInputField
								label="Recipient Phone"
								required
								value={deliveryPhone}
								disabled={sameAsBuyerInfo}
								onChange={setDeliveryPhone}
							/>
						</div>

						<Input
							label="Street Address"
							required
							type="text"
							placeholder="e.g. Musterstraße 12"
							value={deliveryStreet}
							disabled={sameAsBuyerInfo}
							onChange={(e) => setDeliveryStreet(e.target.value)}
						/>

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
							<Input
								label="Postal Code"
								required
								type="text"
								placeholder="e.g. 60311"
								value={deliveryPostalCode}
								disabled={sameAsBuyerInfo}
								onChange={(e) =>
									setDeliveryPostalCode(e.target.value)
								}
							/>
							<Input
								label="City"
								required
								type="text"
								placeholder="e.g. Frankfurt am Main"
								value={deliveryCity}
								disabled={sameAsBuyerInfo}
								onChange={(e) =>
									setDeliveryCity(e.target.value)
								}
							/>
							<Input
								label="Country"
								required
								type="text"
								placeholder="e.g. Germany"
								value={deliveryCountry}
								disabled={sameAsBuyerInfo}
								onChange={(e) =>
									setDeliveryCountry(e.target.value)
								}
							/>
						</div>
					</SectionCard>

					{dhlAddonEnabled && (
						<SectionCard
							step={3}
							title="Germany Local Delivery"
							tooltip="Choose COD or the recommended DHL option for local delivery in Germany."
							logo="/dhl.png"
						>
							<div>
								<label className="mb-1.5 block text-sm font-semibold text-gray-800">
									Local delivery option{" "}
									<span className="text-secondary">*</span>
								</label>

								<div className="space-y-3">
									{availableDhlAddons.length === 0 ? (
										<div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-500">
											No delivery option available
										</div>
									) : (
										availableDhlAddons.map((option) => {
											const price = Number(
												option.price || 0,
											);
											const label =
												option.label ||
												option.name ||
												option.id;
											const isSelected =
												dhlAddon === option.id;

											return (
												<label
													key={option.id}
													className={`flex cursor-pointer items-start gap-3 rounded-xl border bg-white p-4 transition ${
														isSelected
															? "border-primary ring-1 ring-primary"
															: "border-gray-200 hover:border-gray-400"
													}`}
												>
													<input
														type="radio"
														name="dhlAddon"
														value={option.id}
														checked={isSelected}
														onChange={() =>
															setDhlAddon(
																option.id,
															)
														}
														required
														className="mt-1"
													/>

													<div className="flex-1">
														<div className="flex items-start justify-between gap-4">
															<div>
																<div className="flex flex-wrap items-center gap-2">
																	<span className="subtext text-sm text-gray-900">
																		{label}
																	</span>
																</div>
															</div>

															<span className="subtext whitespace-nowrap text-sm text-gray-900">
																€
																{price.toFixed(
																	2,
																)}
															</span>
														</div>
													</div>
												</label>
											);
										})
									)}
								</div>
							</div>
						</SectionCard>
					)}

					{indoLocalDeliveryEnabled && (
						<SectionCard
							step={3}
							title="Indonesia Local Delivery"
							tooltip="Choose the local delivery method for delivery in Indonesia."
						>
							<div>
								<label className="mb-1.5 block text-sm font-semibold text-gray-800">
									Local delivery option{" "}
									<span className="text-secondary">*</span>
								</label>

								<div className="space-y-3">
									{INDONESIA_LOCAL_DELIVERY_OPTIONS.map(
										(option) => {
											const isSelected =
												indoLocalDelivery === option;
											const optionIsCOD =
												String(option || "")
													.trim()
													.toLowerCase() ===
												COD_DHL_ADDON_ID;

											return (
												<label
													key={option}
													className={`flex cursor-pointer items-start gap-3 rounded-xl border bg-white p-4 transition ${
														isSelected
															? "border-primary ring-1 ring-primary"
															: "border-gray-200 hover:border-gray-400"
													}`}
												>
													<input
														type="radio"
														name="indoLocalDelivery"
														value={option}
														checked={isSelected}
														onChange={() =>
															setIndoLocalDelivery(
																option,
															)
														}
														required
														className="mt-1"
													/>

													<div className="flex-1">
														<div className="flex items-start justify-between gap-4">
															<div>
																<div className="flex flex-wrap items-center gap-2">
																	<span className="subtext text-sm text-gray-900">
																		{option}
																	</span>
																</div>

																<p className="subtext mt-1 text-xs text-gray-600">
																	{optionIsCOD
																		? ""
																		: "includes Bubble Wrap"}
																</p>
															</div>

															<div className="shrink-0 text-right">
																<div className="subtext whitespace-nowrap text-sm font-semibold text-gray-900">
																	{optionIsCOD
																		? "€0.00"
																		: "€1.00"}
																</div>

																<div className="subtext mt-0.5 text-xs text-gray-500">
																	{optionIsCOD
																		? ""
																		: "delivery paid later"}
																</div>
															</div>
														</div>
													</div>
												</label>
											);
										},
									)}
								</div>

								{indoLocalDelivery &&
									!indoLocalDeliveryIsCOD && (
										<div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
											<div className="flex items-start justify-between gap-4">
												<div>
													<p className="text-sm text-gray-900">
														Bubble Wrap
													</p>

													<p className="subtext mt-1 text-xs text-gray-600">
														Automatically included
														for this delivery option
													</p>
												</div>

												<span className="subtext whitespace-nowrap text-gray-900">
													{formatOptionalEUR(
														bubbleWrapPriceEUR,
													)}
												</span>
											</div>
										</div>
									)}
							</div>
						</SectionCard>
					)}

					<SectionCard
						step={paymentStep}
						title="Payment"
						tooltip="Choose how you paid and upload proof of payment."
					>
						<div>
							<label className="mb-1.5 block text-sm font-semibold text-gray-800">
								Payment Method{" "}
								<span className="text-secondary">*</span>
							</label>
							<select
								className="subtext w-full rounded-xl border border-gray-300 bg-white p-3 text-gray-900 input-focus disabled:cursor-not-allowed disabled:bg-gray-100"
								value={paymentMethod}
								onChange={(e) =>
									setPaymentMethod(e.target.value)
								}
								required
							>
								<option value="">Select Payment Method</option>
								<option value="paypal">PayPal</option>
								{/*<option value="iban">IBAN</option>
								<option value="n26">N26</option>
								<option value="bca">Bank BCA</option>
								<option value="revolut">Bank Revolut</option>*/}
								<option value="jenius">Bank Jenius/SMBC</option>
							</select>
						</div>

						{selectedPaymentDetails && (
							<div className="rounded-2xl border border-primary-200 bg-primary-50 p-5 text-sm text-gray-800 shadow-sm">
								<p className="subtext text-xs mb-4 font-semibold uppercase tracking-wide text-primary-600">
									Transfer your payment to:
								</p>

								<div className="space-y-3 rounded-xl bg-white p-4">
									{selectedPaymentDetails.rows.map(
										([label, value]) => (
											<div
												key={label}
												className="grid grid-cols-1 gap-1 border-b border-gray-100 pb-3 last:border-b-0 last:pb-0 sm:grid-cols-[140px_1fr]"
											>
												<span className="text-xs uppercase tracking-wide text-gray-500">
													{label}
												</span>

												<span className="subtext font-semibold text-gray-900">
													{value}
												</span>
											</div>
										),
									)}
								</div>

								<p className="subtext mt-4 rounded-xl text-xs text-gray-700">
									{selectedPaymentDetails.note}
								</p>
							</div>
						)}

						<div>
							<label className="mb-1.5 block text-sm font-semibold text-gray-800">
								Proof of Payment{" "}
								<span className="text-secondary">*</span>
							</label>
							<input
								type="file"
								accept="application/pdf,image/*"
								className="subtext w-full rounded-xl border border-gray-300 bg-white p-3 input-focus disabled:cursor-not-allowed disabled:bg-gray-100"
								onChange={(e) =>
									setPaymentProof(e.target.files?.[0] ?? null)
								}
								required
							/>
						</div>

						<div>
							<label className="mb-1.5 block text-sm font-semibold text-gray-800">
								Notes / Request (if any)
							</label>
							<textarea
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
								rows={3}
								placeholder="e.g. call before pickup, fragile, etc."
								className="subtext w-full rounded-xl border border-gray-300 bg-white p-3 input-focus disabled:cursor-not-allowed disabled:bg-gray-100"
							/>
						</div>
					</SectionCard>

					<div className="rounded-2xl border border-primary-100 bg-primary-50 p-5 shadow-sm">
						<div className="flex items-start gap-3">
							<input
								type="checkbox"
								checked={termsAccepted}
								onChange={() =>
									setTermsAccepted(!termsAccepted)
								}
								className="mt-1 input-focus"
								required
							/>
							<div className="text-sm text-gray-800">
								I have read and accept the{" "}
								<Link
									to="/terms"
									target="_blank"
									className="font-semibold text-primary underline"
								>
									Terms and Conditions
								</Link>
								<span className="ml-1 text-secondary">*</span>
							</div>
						</div>

						<button
							type="submit"
							disabled={submitting}
							className="button-primary mt-5 inline-flex w-full items-center justify-center py-3 text-lg font-semibold disabled:cursor-not-allowed disabled:opacity-60"
						>
							{submitting ? "Processing..." : "Checkout"}
						</button>
					</div>
				</fieldset>
			</form>
		</div>
	);
};

export default CheckoutForm;
