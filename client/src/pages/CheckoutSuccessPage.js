import React, { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaCheckCircle, FaArrowRight } from "react-icons/fa";
import { CART_KEY, INVOICES_KEY } from "../utils/constants";

const CheckoutSuccessPage = () => {
	const navigate = useNavigate();
	const location = useLocation();

	const {
		fullName = "",
		totalAmountEUR = null,
		totalAmountIDR = null,
		itemsCount = null,
		paidViaLabel = "",
	} = location.state || {};

	useEffect(() => {
		// clear local storage just in case.
		localStorage.removeItem(CART_KEY);
		localStorage.removeItem(INVOICES_KEY);
	}, []);

	return (
		<section className="py-24 bg-gray-100">
			<div className="max-w-screen-md mx-auto px-4">
				<div className="bg-white rounded-2xl shadow-md p-8">
					<div className="flex flex-col items-center text-center">
						<FaCheckCircle className="text-green-800 text-6xl" />
						<h1 className="text-3xl font-semibold text-gray-900 mt-4">
							Checkout successful
						</h1>
						<p className="subtext text-gray-600 mt-2">
							We received your request and saved your order.
						</p>
					</div>

					<div className="mt-8 rounded-2xl border bg-gray-50 p-5">
						<h2 className="text-lg font-semibold text-gray-900">
							Summary
						</h2>

						<div className="mt-4 space-y-2">
							{fullName && (
								<div className="flex items-center justify-between">
									<span className="subtext text-sm text-gray-600">
										Name
									</span>
									<span className="text-sm font-semibold text-gray-900">
										{fullName}
									</span>
								</div>
							)}

							{typeof itemsCount === "number" && (
								<div className="flex items-center justify-between">
									<span className="subtext text-sm text-gray-600">
										Shipments
									</span>
									<span className="text-sm font-semibold text-gray-900">
										{itemsCount}
									</span>
								</div>
							)}

							{totalAmountEUR != null && (
								<div className="flex items-center justify-between">
									<span className="subtext text-sm text-gray-600">
										Total (EUR)
									</span>
									<span className="text-sm font-semibold text-gray-900">
										€{Number(totalAmountEUR).toFixed(2)}
									</span>
								</div>
							)}

							{totalAmountIDR != null && (
								<div className="flex items-center justify-between">
									<span className="subtext text-sm text-gray-600">
										Total (IDR)
									</span>
									<span className="text-sm font-semibold text-gray-900">
										IDR{" "}
										{Number(
											totalAmountIDR,
										).toLocaleString()}
									</span>
								</div>
							)}

							{paidViaLabel && (
								<div className="flex items-center justify-between">
									<span className="subtext text-sm text-gray-600">
										Payment
									</span>
									<span className="text-sm font-semibold text-gray-900">
										{paidViaLabel}
									</span>
								</div>
							)}
						</div>

						<div className="mt-4">
							<p className="subtext text-xs text-gray-500">
								Next step: We’ll confirm your shipment and follow
								up if we need any extra details.
							</p>
						</div>
					</div>

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

					<div className="mt-6 w-full text-center">
						<Link
							to="/cart"
							className="text-sm subtext font-semibold text-secondary hover:opacity-80 inline-block"
						>
							View cart
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
};

export default CheckoutSuccessPage;
