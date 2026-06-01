import React from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { Link } from "react-router-dom";
import SectionCard from "./SectionCard";
import Input from "./InputField";

const PAYMENT_DETAILS = {
	paypal: {
		title: "PayPal",
		rows: [
			["PayPal Email", "DionTransportPembayaran@gmail.com"],
			["Username", "@DTPembayaran"],
		],
		note: "Please send the payment as Friends & Family if applicable, then upload the payment proof below.",
	},
	/*iban: {
        title: "IBAN Bank Transfer",
        rows: [
            ["Account Holder", "Your Name / Business Name"],
            ["IBAN", "DE00 0000 0000 0000 0000 00"],
            ["BIC", "BANKDEFFXXX"],
            ["Reference", "Your full name"],
        ],
        note: "Please include your full name as the transfer reference.",
    },
    n26: {
        title: "N26",
        rows: [
            ["Account Holder", "Your Name"],
            ["IBAN", "DE00 0000 0000 0000 0000 00"],
            ["Reference", "Your full name"],
        ],
        note: "Please upload a screenshot or PDF confirmation after payment.",
    },
    bca: {
        title: "Bank BCA (Rupiah)",
        rows: [
            ["Account Holder", "Your Name"],
            ["Account Number", "0000000000"],
            ["Bank", "BCA"],
        ],
        note: "Please upload the transfer proof after payment.",
    },
    revolut: {
        title: "Revolut",
        rows: [
            ["Recipient", "Your Name"],
            ["Revolut Tag", "@yourtag"],
            ["Phone / Email", "+49 xxx / your@email.com"],
        ],
        note: "Please upload a screenshot or PDF confirmation after payment.",
    },*/
	jenius: {
		title: "Bank Jenius/SMBC (Rupiah)",
		rows: [
			["Account Holder", "Dionisius Velma"],
			["Account Number", "90160105717"],
		],
		note: "Please upload the transfer proof after payment.",
	},
};

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
 * - buyer info:
 *   firstName, setFirstName, lastName, setLastName, email, setEmail, phone, setPhone
 * - delivery info:
 *   deliveryFirstName, setDeliveryFirstName
 *   deliveryLastName, setDeliveryLastName
 *   deliveryEmail, setDeliveryEmail
 *   deliveryPhone, setDeliveryPhone
 *   deliveryStreet, setDeliveryStreet
 *   deliveryPostalCode, setDeliveryPostalCode
 *   deliveryCity, setDeliveryCity
 *   deliveryCountry, setDeliveryCountry
 * - billing info:
 *   billingSameAsDelivery, setBillingSameAsDelivery
 *   billingFirstName, setBillingFirstName
 *   billingLastName, setBillingLastName
 *   billingPhone, setBillingPhone
 *   billingStreet, setBillingStreet
 *   billingPostalCode, setBillingPostalCode
 *   billingCity, setBillingCity
 *   billingCountry, setBillingCountry
 * - dhl germany addon:
 *   dhlTiers,
 *   dhlAddonEnabled,
 *   recommendedDhlAddon,
 *   dhlAddon, setDhlAddon,
 *   totalWeightKg,
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
	firstName,
	setFirstName,
	lastName,
	setLastName,
	email,
	setEmail,
	phone,
	setPhone,

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

	billingSameAsDelivery,
	setBillingSameAsDelivery,
	billingFirstName,
	setBillingFirstName,
	billingLastName,
	setBillingLastName,
	billingPhone,
	setBillingPhone,
	billingStreet,
	setBillingStreet,
	billingPostalCode,
	setBillingPostalCode,
	billingCity,
	setBillingCity,
	billingCountry,
	setBillingCountry,

	dhlTiers,
	dhlAddonEnabled,
	recommendedDhlAddon,
	dhlAddon,
	setDhlAddon,
	totalWeightKg,

	paymentMethod,
	setPaymentMethod,
	setPaymentProof,
	notes,
	setNotes,
	termsAccepted,
	setTermsAccepted,
	submitting,
}) => {
	const recommendedDhlLabel =
		dhlTiers.find((option) => option.id === recommendedDhlAddon)?.label ||
		"-";

	const paymentStep = dhlAddonEnabled ? 5 : 4;
	const selectedPaymentDetails = PAYMENT_DETAILS[paymentMethod];

	return (
		<div>
			<form onSubmit={handleSubmit} className="space-y-6">
				<fieldset
					disabled={submitting}
					className={submitting ? "opacity-70" : ""}
				>
					<SectionCard
						step={1}
						title="Buyer Information"
						tooltip="Details of the person placing the order."
					>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<Input
								label="First Name"
								required
								type="text"
								value={firstName}
								onChange={(e) => setFirstName(e.target.value)}
							/>
							<Input
								label="Last Name"
								required
								type="text"
								value={lastName}
								onChange={(e) => setLastName(e.target.value)}
							/>
						</div>

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<Input
								label="Email"
								required
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>
							<PhoneInputField
								label="Phone Number"
								required
								value={phone}
								onChange={setPhone}
							/>
						</div>
					</SectionCard>

					<SectionCard
						step={2}
						title="Delivery Address"
						tooltip="Recipient details and final delivery destination."
					>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<Input
								label="Recipient First Name"
								required
								type="text"
								value={deliveryFirstName}
								onChange={(e) =>
									setDeliveryFirstName(e.target.value)
								}
							/>
							<Input
								label="Recipient Last Name"
								required
								type="text"
								value={deliveryLastName}
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
								onChange={(e) =>
									setDeliveryEmail(e.target.value)
								}
							/>
							<PhoneInputField
								label="Recipient Phone"
								required
								value={deliveryPhone}
								onChange={setDeliveryPhone}
							/>
						</div>

						<Input
							label="Street Address"
							required
							type="text"
							placeholder="e.g. Musterstraße 12"
							value={deliveryStreet}
							onChange={(e) => setDeliveryStreet(e.target.value)}
						/>

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
							<Input
								label="Postal Code"
								required
								type="text"
								placeholder="e.g. 60311"
								value={deliveryPostalCode}
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
								onChange={(e) =>
									setDeliveryCountry(e.target.value)
								}
							/>
						</div>
					</SectionCard>

					<SectionCard
						step={3}
						title="Billing Address"
						tooltip="Invoice details and billing recipient."
					>
						<label className="flex items-center gap-3 rounded-xl border border-primary-100 bg-primary-50 px-4 py-3">
							<input
								type="checkbox"
								checked={billingSameAsDelivery}
								onChange={(e) =>
									setBillingSameAsDelivery(e.target.checked)
								}
								className="input-focus"
							/>
							<span className="text-sm font-medium text-primary-700">
								Billing address is the same as delivery address
							</span>
						</label>

						{!billingSameAsDelivery && (
							<>
								<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
									<Input
										label="Billing First Name"
										required
										type="text"
										value={billingFirstName}
										onChange={(e) =>
											setBillingFirstName(e.target.value)
										}
									/>
									<Input
										label="Billing Last Name"
										required
										type="text"
										value={billingLastName}
										onChange={(e) =>
											setBillingLastName(e.target.value)
										}
									/>
									<PhoneInputField
										label="Billing Phone"
										required
										value={billingPhone}
										onChange={setBillingPhone}
									/>
								</div>

								<Input
									label="Street Address"
									required
									type="text"
									placeholder="e.g. Musterstraße 12"
									value={billingStreet}
									onChange={(e) =>
										setBillingStreet(e.target.value)
									}
								/>

								<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
									<Input
										label="Postal Code"
										required
										type="text"
										placeholder="e.g. 60311"
										value={billingPostalCode}
										onChange={(e) =>
											setBillingPostalCode(e.target.value)
										}
									/>
									<Input
										label="City"
										required
										type="text"
										placeholder="e.g. Frankfurt am Main"
										value={billingCity}
										onChange={(e) =>
											setBillingCity(e.target.value)
										}
									/>
									<Input
										label="Country"
										required
										type="text"
										placeholder="e.g. Germany"
										value={billingCountry}
										onChange={(e) =>
											setBillingCountry(e.target.value)
										}
									/>
								</div>
							</>
						)}
					</SectionCard>

					{dhlAddonEnabled && (
						<SectionCard
							step={4}
							title="Germany DHL Delivery Option"
							tooltip="Choose the DHL tier for local delivery in Germany."
							logo="/dhl.png"
						>
							<div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
								<div className="flex flex-wrap items-center gap-x-4 gap-y-1">
									<div>
										<span className="font-semibold text-gray-900">
											Total weight:
										</span>{" "}
										{Number(totalWeightKg).toFixed(2)} kg
									</div>
									<div>
										<span className="font-semibold text-gray-900">
											Recommended:
										</span>{" "}
										{recommendedDhlLabel}
									</div>
								</div>
							</div>

							<div>
								<label className="mb-1.5 block text-sm font-semibold text-gray-800">
									DHL option{" "}
									<span className="text-secondary">*</span>
								</label>
								<select
									className="subtext w-full rounded-xl border border-gray-300 bg-white p-3 text-gray-900 input-focus disabled:cursor-not-allowed disabled:bg-gray-100"
									value={dhlAddon}
									onChange={(e) =>
										setDhlAddon(e.target.value)
									}
									required
								>
									<option value="">Select option</option>
									{dhlTiers.map((option) => (
										<option
											key={option.id}
											value={option.id}
										>
											{option.label}
											{Number(option.price) > 0
												? ` - €${Number(option.price).toFixed(2)}`
												: ""}
										</option>
									))}
								</select>
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
