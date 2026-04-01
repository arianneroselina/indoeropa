import React from "react";
import { Link } from "react-router-dom";

/**
 * CheckoutForm
 *
 * Props:
 * - handleSubmit: form submit handler for the checkout action
 * - fullName, address, email, phone: current customer form values
 * - setFullName, setAddress, setEmail, setPhone: setters for customer form fields
 * - paymentMethod, paymentProof, notes: current payment / notes values
 * - setPaymentMethod, setPaymentProof, setNotes: setters for payment / notes fields
 * - termsAccepted: whether the user accepted the terms
 * - setTermsAccepted: setter for the term checkbox
 * - submitting: loading state while checkout is being processed
 */
const CheckoutForm = ({
	handleSubmit,
	fullName,
	setFullName,
	address,
	setAddress,
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
			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Customer details */}
				<div className="space-y-4">
					<div>
						<label className="block text-sm font-semibold text-gray-800">
							Full Name <span className="text-red-500">*</span>
						</label>
						<input
							type="text"
							className="subtext w-full rounded-xl border border-gray-300 p-3 input-focus"
							value={fullName}
							onChange={(e) => setFullName(e.target.value)}
							required
						/>
					</div>

					<div>
						<label className="block text-sm font-semibold text-gray-800">
							Full Delivery Address{" "}
							<span className="text-red-500">*</span>
						</label>
						<input
							type="text"
							className="subtext w-full rounded-xl border border-gray-300 p-3 input-focus"
							value={address}
							onChange={(e) => setAddress(e.target.value)}
							required
						/>
					</div>

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
							Phone Number <span className="text-red-500">*</span>
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

				{/* Payment details */}
				<div className="mt-6 space-y-4">
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
				<div className="mt-4 flex items-center">
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
					className="button-primary mt-6 inline-flex w-full items-center justify-center py-3 text-lg font-semibold disabled:opacity-60"
				>
					{submitting ? "Processing..." : "Checkout"}
				</button>
			</form>
		</div>
	);
};

export default CheckoutForm;
