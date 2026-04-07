import React from "react";
import { Link } from "react-router-dom";

/**
 * CheckoutForm
 *
 * Props:
 * - handleSubmit: form submit handler for the checkout action
 * - firstName, lastName, street, postalCode, country, email, phone: billing address fields
 * - setFirstName, setLastName, setStreet, setPostalCode, setCountry, setEmail, setPhone: setters
 * - paymentMethod, paymentProof, notes: current payment / notes values
 * - setPaymentMethod, setPaymentProof, setNotes: setters for payment / notes fields
 * - termsAccepted: whether the user accepted the terms
 * - setTermsAccepted: setter for the term checkbox
 * - submitting: loading state while checkout is being processed
 */
const CheckoutForm = ({
	handleSubmit,
	firstName,
	setFirstName,
	lastName,
	setLastName,
	street,
	setStreet,
	postalCode,
	setPostalCode,
	country,
	setCountry,
	email,
	setEmail,
	phone,
	setPhone,
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
				{/* Billing Address */}
				<div className="space-y-4">
					<h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
						Billing Address
					</h3>

					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div>
							<label className="block text-sm font-semibold text-gray-800">
								First Name{" "}
								<span className="text-red-500">*</span>
							</label>
							<input
								type="text"
								className="subtext w-full rounded-xl border border-gray-300 p-3 input-focus"
								value={firstName}
								onChange={(e) => setFirstName(e.target.value)}
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
								className="subtext w-full rounded-xl border border-gray-300 p-3 input-focus"
								value={lastName}
								onChange={(e) => setLastName(e.target.value)}
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
							className="subtext w-full rounded-xl border border-gray-300 p-3 input-focus"
							placeholder="e.g. Musterstraße 12"
							value={street}
							onChange={(e) => setStreet(e.target.value)}
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
								className="subtext w-full rounded-xl border border-gray-300 p-3 input-focus"
								placeholder="e.g. 60311"
								value={postalCode}
								onChange={(e) => setPostalCode(e.target.value)}
								required
							/>
						</div>

						<div>
							<label className="block text-sm font-semibold text-gray-800">
								Country <span className="text-red-500">*</span>
							</label>
							<input
								type="text"
								className="subtext w-full rounded-xl border border-gray-300 p-3 input-focus"
								placeholder="e.g. Germany"
								value={country}
								onChange={(e) => setCountry(e.target.value)}
								required
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div>
							<label className="block text-sm font-semibold text-gray-800">
								Email <span className="text-red-500">*</span>
							</label>
							<input
								type="email"
								className="subtext w-full rounded-xl border border-gray-300 p-3 input-focus"
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
								className="subtext w-full rounded-xl border border-gray-300 p-3 input-focus"
								value={phone}
								onChange={(e) => setPhone(e.target.value)}
								required
							/>
						</div>
					</div>
				</div>

				{/* Payment details */}
				<div className="space-y-4">
					<h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
						Payment
					</h3>

					<div>
						<label className="block text-sm font-semibold text-gray-800">
							Payment Method{" "}
							<span className="text-red-500">*</span>
						</label>
						<select
							className="subtext w-full rounded-xl border border-gray-300 p-3 input-focus"
							value={paymentMethod}
							onChange={(e) => setPaymentMethod(e.target.value)}
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
							className="subtext w-full rounded-xl border border-gray-300 p-3 input-focus"
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
							id="message"
							name="message"
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							rows={2}
							placeholder="e.g. call before pickup, fragile, etc."
							className="subtext w-full rounded-xl border border-gray-300 p-3 input-focus"
						/>
					</div>
				</div>

				{/* Terms acceptance */}
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

				{/* Submit */}
				<button
					type="submit"
					disabled={submitting}
					className="button-primary mt-2 inline-flex w-full items-center justify-center py-3 text-lg font-semibold disabled:opacity-60"
				>
					{submitting ? "Processing..." : "Checkout"}
				</button>
			</form>
		</div>
	);
};

export default CheckoutForm;
