import React from "react";
import { Link } from "react-router-dom";

/**
 * CheckoutForm
 *
 * Props:
 * - handleSubmit
 * - buyer info:
 *   firstName, setFirstName, lastName, setLastName, email, setEmail, phone, setPhone
 * - delivery info:
 *   deliveryRecipientFirstName, setDeliveryRecipientFirstName
 *   deliveryRecipientLastName, setDeliveryRecipientLastName
 *   deliveryRecipientPhone, setDeliveryRecipientPhone
 *   deliveryStreet, setDeliveryStreet
 *   deliveryPostalCode, setDeliveryPostalCode
 *   deliveryCountry, setDeliveryCountry
 * - billing info:
 *   billingSameAsDelivery, setBillingSameAsDelivery
 *   billingFirstName, setBillingFirstName
 *   billingLastName, setBillingLastName
 *   billingPhone, setBillingPhone
 *   billingStreet, setBillingStreet
 *   billingPostalCode, setBillingPostalCode
 *   billingCountry, setBillingCountry
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

	deliveryRecipientFirstName,
	setDeliveryRecipientFirstName,
	deliveryRecipientLastName,
	setDeliveryRecipientLastName,
	deliveryRecipientPhone,
	setDeliveryRecipientPhone,
	deliveryStreet,
	setDeliveryStreet,
	deliveryPostalCode,
	setDeliveryPostalCode,
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
	billingCountry,
	setBillingCountry,

	paymentMethod,
	setPaymentMethod,
	setPaymentProof,
	notes,
	setNotes,
	termsAccepted,
	setTermsAccepted,
	submitting,
}) => {
	return (
		<div>
			<form onSubmit={handleSubmit} className="space-y-8">
				<fieldset
					disabled={submitting}
					className={submitting ? "opacity-70" : ""}
				>
					{/* Buyer info */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
							Buyer Information
						</h3>

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div>
								<label className="block text-sm font-semibold text-gray-800">
									First Name{" "}
									<span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									className="subtext w-full rounded-xl border border-gray-300 p-3 input-focus disabled:bg-gray-100 disabled:cursor-not-allowed"
									value={firstName}
									onChange={(e) =>
										setFirstName(e.target.value)
									}
									required
								/>
							</div>

							<div>
								<label className="block text-sm font-semibold text-gray-800">
									Last Name{" "}
									<span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									className="subtext w-full rounded-xl border border-gray-300 p-3 input-focus disabled:bg-gray-100 disabled:cursor-not-allowed"
									value={lastName}
									onChange={(e) =>
										setLastName(e.target.value)
									}
									required
								/>
							</div>
						</div>

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div>
								<label className="block text-sm font-semibold text-gray-800">
									Email{" "}
									<span className="text-red-500">*</span>
								</label>
								<input
									type="email"
									className="subtext w-full rounded-xl border border-gray-300 p-3 input-focus disabled:bg-gray-100 disabled:cursor-not-allowed"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
								/>
							</div>

							<div>
								<label className="block text-sm font-semibold text-gray-800">
									Phone Number{" "}
									<span className="text-red-500">*</span>
								</label>
								<input
									type="tel"
									className="subtext w-full rounded-xl border border-gray-300 p-3 input-focus disabled:bg-gray-100 disabled:cursor-not-allowed"
									value={phone}
									onChange={(e) => setPhone(e.target.value)}
									required
								/>
							</div>
						</div>
					</div>

					{/* Delivery */}
					<div className="space-y-4 mt-8">
						<h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
							Delivery Address
						</h3>

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
							<div>
								<label className="block text-sm font-semibold text-gray-800">
									Recipient First Name{" "}
									<span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									className="subtext w-full rounded-xl border border-gray-300 p-3 input-focus disabled:bg-gray-100 disabled:cursor-not-allowed"
									value={deliveryRecipientFirstName}
									onChange={(e) =>
										setDeliveryRecipientFirstName(
											e.target.value,
										)
									}
									required
								/>
							</div>

							<div>
								<label className="block text-sm font-semibold text-gray-800">
									Recipient Last Name{" "}
									<span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									className="subtext w-full rounded-xl border border-gray-300 p-3 input-focus disabled:bg-gray-100 disabled:cursor-not-allowed"
									value={deliveryRecipientLastName}
									onChange={(e) =>
										setDeliveryRecipientLastName(
											e.target.value,
										)
									}
									required
								/>
							</div>

							<div>
								<label className="block text-sm font-semibold text-gray-800">
									Recipient Phone{" "}
									<span className="text-red-500">*</span>
								</label>
								<input
									type="tel"
									className="subtext w-full rounded-xl border border-gray-300 p-3 input-focus disabled:bg-gray-100 disabled:cursor-not-allowed"
									value={deliveryRecipientPhone}
									onChange={(e) =>
										setDeliveryRecipientPhone(
											e.target.value,
										)
									}
									required
								/>
							</div>
						</div>

						<div>
							<label className="block text-sm font-semibold text-gray-800">
								Street Address{" "}
								<span className="text-red-500">*</span>
							</label>
							<input
								type="text"
								className="subtext w-full rounded-xl border border-gray-300 p-3 input-focus disabled:bg-gray-100 disabled:cursor-not-allowed"
								placeholder="e.g. Musterstraße 12"
								value={deliveryStreet}
								onChange={(e) =>
									setDeliveryStreet(e.target.value)
								}
								required
							/>
						</div>

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div>
								<label className="block text-sm font-semibold text-gray-800">
									Postal Code{" "}
									<span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									className="subtext w-full rounded-xl border border-gray-300 p-3 input-focus disabled:bg-gray-100 disabled:cursor-not-allowed"
									placeholder="e.g. 60311"
									value={deliveryPostalCode}
									onChange={(e) =>
										setDeliveryPostalCode(e.target.value)
									}
									required
								/>
							</div>

							<div>
								<label className="block text-sm font-semibold text-gray-800">
									Country{" "}
									<span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									className="subtext w-full rounded-xl border border-gray-300 p-3 input-focus disabled:bg-gray-100 disabled:cursor-not-allowed"
									placeholder="e.g. Germany"
									value={deliveryCountry}
									onChange={(e) =>
										setDeliveryCountry(e.target.value)
									}
									required
								/>
							</div>
						</div>
					</div>

					{/* Billing */}
					<div className="space-y-4 mt-8">
						<h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
							Billing Address
						</h3>

						<label className="flex items-center gap-3">
							<input
								type="checkbox"
								checked={billingSameAsDelivery}
								onChange={(e) =>
									setBillingSameAsDelivery(e.target.checked)
								}
								className="input-focus"
							/>
							<span className="text-sm text-gray-800">
								Billing address is the same as delivery address
							</span>
						</label>

						{!billingSameAsDelivery && (
							<>
								<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
									<div>
										<label className="block text-sm font-semibold text-gray-800">
											Billing First Name{" "}
											<span className="text-red-500">
												*
											</span>
										</label>
										<input
											type="text"
											className="subtext w-full rounded-xl border border-gray-300 p-3 input-focus disabled:bg-gray-100 disabled:cursor-not-allowed"
											value={billingFirstName}
											onChange={(e) =>
												setBillingFirstName(
													e.target.value,
												)
											}
											required
										/>
									</div>

									<div>
										<label className="block text-sm font-semibold text-gray-800">
											Billing Last Name{" "}
											<span className="text-red-500">
												*
											</span>
										</label>
										<input
											type="text"
											className="subtext w-full rounded-xl border border-gray-300 p-3 input-focus disabled:bg-gray-100 disabled:cursor-not-allowed"
											value={billingLastName}
											onChange={(e) =>
												setBillingLastName(
													e.target.value,
												)
											}
											required
										/>
									</div>

									<div>
										<label className="block text-sm font-semibold text-gray-800">
											Billing Phone{" "}
											<span className="text-red-500">
												*
											</span>
										</label>
										<input
											type="tel"
											className="subtext w-full rounded-xl border border-gray-300 p-3 input-focus disabled:bg-gray-100 disabled:cursor-not-allowed"
											value={billingPhone}
											onChange={(e) =>
												setBillingPhone(e.target.value)
											}
											required
										/>
									</div>
								</div>

								<div>
									<label className="block text-sm font-semibold text-gray-800">
										Street Address{" "}
										<span className="text-red-500">*</span>
									</label>
									<input
										type="text"
										className="subtext w-full rounded-xl border border-gray-300 p-3 input-focus disabled:bg-gray-100 disabled:cursor-not-allowed"
										placeholder="e.g. Musterstraße 12"
										value={billingStreet}
										onChange={(e) =>
											setBillingStreet(e.target.value)
										}
										required={!billingSameAsDelivery}
									/>
								</div>

								<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
									<div>
										<label className="block text-sm font-semibold text-gray-800">
											Postal Code{" "}
											<span className="text-red-500">
												*
											</span>
										</label>
										<input
											type="text"
											className="subtext w-full rounded-xl border border-gray-300 p-3 input-focus disabled:bg-gray-100 disabled:cursor-not-allowed"
											placeholder="e.g. 60311"
											value={billingPostalCode}
											onChange={(e) =>
												setBillingPostalCode(
													e.target.value,
												)
											}
											required={!billingSameAsDelivery}
										/>
									</div>

									<div>
										<label className="block text-sm font-semibold text-gray-800">
											Country{" "}
											<span className="text-red-500">
												*
											</span>
										</label>
										<input
											type="text"
											className="subtext w-full rounded-xl border border-gray-300 p-3 input-focus disabled:bg-gray-100 disabled:cursor-not-allowed"
											placeholder="e.g. Germany"
											value={billingCountry}
											onChange={(e) =>
												setBillingCountry(
													e.target.value,
												)
											}
											required={!billingSameAsDelivery}
										/>
									</div>
								</div>
							</>
						)}
					</div>

					{/* Payment */}
					<div className="space-y-4 mt-8">
						<h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
							Payment
						</h3>

						<div>
							<label className="block text-sm font-semibold text-gray-800">
								Payment Method{" "}
								<span className="text-red-500">*</span>
							</label>
							<select
								className="subtext w-full rounded-xl border border-gray-300 p-3 input-focus disabled:bg-gray-100 disabled:cursor-not-allowed"
								value={paymentMethod}
								onChange={(e) =>
									setPaymentMethod(e.target.value)
								}
								required
							>
								<option value="">Select Payment Method</option>
								<option value="paypal">PayPal</option>
								<option value="iban">IBAN</option>
								<option value="n26">N26</option>
								<option value="bca">Bank BCA</option>
								<option value="revolut">Bank Revolut</option>
								<option value="jenius">Bank Jenius</option>
							</select>
						</div>

						<div className="space-y-2">
							<label className="block text-sm font-semibold text-gray-800">
								Proof of Payment{" "}
								<span className="text-red-500">*</span>
							</label>
							<input
								type="file"
								accept="application/pdf,image/*"
								className="subtext w-full rounded-xl border border-gray-300 p-3 input-focus disabled:bg-gray-100 disabled:cursor-not-allowed"
								onChange={(e) =>
									setPaymentProof(e.target.files?.[0] ?? null)
								}
								required
							/>
						</div>

						<div className="space-y-2">
							<label className="block text-sm font-semibold text-gray-800">
								Notes / Request (if any)
							</label>
							<textarea
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
								rows={2}
								placeholder="e.g. call before pickup, fragile, etc."
								className="subtext w-full rounded-xl border border-gray-300 p-3 input-focus disabled:bg-gray-100 disabled:cursor-not-allowed"
							/>
						</div>
					</div>

					{/* Terms */}
					<div className="flex items-center">
						<input
							type="checkbox"
							checked={termsAccepted}
							onChange={() => setTermsAccepted(!termsAccepted)}
							className="mr-2 input-focus"
							required
						/>
						<span>I have read and accept the</span>
						<Link
							to="/terms"
							target="_blank"
							className="ml-1 text-blue-600 underline"
						>
							Terms and Conditions
						</Link>
						<span className="ml-1 text-red-500">*</span>
					</div>

					<button
						type="submit"
						disabled={submitting}
						className="button-primary mt-2 inline-flex w-full items-center justify-center py-3 text-lg font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
					>
						{submitting ? "Processing..." : "Checkout"}
					</button>
				</fieldset>
			</form>
		</div>
	);
};

export default CheckoutForm;
