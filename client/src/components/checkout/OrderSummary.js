import { Link } from "react-router-dom";
import { ShipmentMeta } from "../shipping/ShipmentMeta";
import { calculatePriceWithCustoms } from "../../utils/checkoutPricing";

/**
 * OrderSummary
 *
 * Props:
 * - cartItems: array of cart/shipment items shown in the summary
 * - relevantDutyItems: duty-relevant items used to calculate customs per item
 * - customsFeeByKey: map of customs fee per duty key
 * - totalAmountEUR: final total in EUR (including customs)
 * - totalAmountIDR: final total in IDR
 * - eurToIdrRate: exchange rate used for conversion
 */
const OrderSummary = ({
	cartItems,
	relevantDutyItems,
	customsFeeByKey,
	totalAmountEUR,
	totalAmountIDR,
	eurToIdrRate,
}) => {
	return (
		<aside className="rounded-2xl border bg-white p-5 shadow-lg">
			<div className="flex items-start justify-between gap-4">
				<div>
					<h3 className="text-lg font-semibold text-gray-900">
						Order summary
					</h3>
					<p className="subtext mt-1 text-xs text-gray-600">
						{cartItems.length} shipment
						{cartItems.length === 1 ? "" : "s"}
					</p>
				</div>

				<Link
					to="/cart"
					className="text-sm font-semibold text-secondary hover:opacity-80"
				>
					Edit
				</Link>
			</div>

			<div className="mt-4 space-y-3">
				{cartItems.map((item, idx) => {
					const { customsAmountEur, itemTotalEur } =
						calculatePriceWithCustoms(item, customsFeeByKey);

					return (
						<div
							key={item.signature ?? idx}
							className="rounded-xl border bg-gray-50/60 p-3"
						>
							<div className="flex items-start justify-between gap-3">
								<ShipmentMeta
									item={item}
									showDateChip={false}
									showDetailChip={false}
									compact
								/>

								<div className="shrink-0 text-right">
									<div className="text-sm font-semibold text-gray-900">
										€{itemTotalEur.toFixed(2)}
									</div>

									{customsAmountEur > 0 && (
										<div className="subtext mt-0.5 text-xs text-gray-500">
											incl. customs €
											{customsAmountEur.toFixed(2)}
										</div>
									)}
								</div>
							</div>
						</div>
					);
				})}
			</div>

			{/* Totals */}
			<div className="mt-5 border-t pt-4">
				<div className="flex items-center justify-between">
					<div className="text-sm font-semibold text-gray-900">
						Total (incl. customs)
					</div>
					<div className="text-lg font-bold text-gray-900">
						€{totalAmountEUR.toFixed(2)}
					</div>
				</div>

				<div className="mt-1 flex items-center justify-between">
					<div className="subtext text-xs text-gray-500">
						Total IDR
					</div>
					<div className="subtext text-xs font-semibold text-gray-700">
						IDR {totalAmountIDR.toLocaleString()}
					</div>
				</div>

				<div className="mt-3 flex justify-end">
					<p className="subtext text-xs text-gray-500">
						Calculated using fixed exchange rate:{" "}
						<span className="font-semibold text-gray-700">
							1 EUR = {(eurToIdrRate ?? 0).toLocaleString()} IDR
						</span>
					</p>
				</div>
			</div>
		</aside>
	);
};

export default OrderSummary;
