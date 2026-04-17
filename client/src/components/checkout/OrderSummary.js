import { Link } from "react-router-dom";
import { ShipmentMeta } from "../shipping/ShipmentMeta";
import { totalPriceWithCustoms } from "../../utils/checkoutHelper";

/**
 * OrderSummary
 *
 * Props:
 * - cartItems: array of cart/shipment items shown in the summary
 * - totalAmountEUR: final total in EUR (including customs / addons)
 * - totalAmountIDR: final total in IDR
 * - eurToIdrRate: exchange rate used for conversion
 * - dhlAddonEnabled: whether Germany DHL addon section is active
 * - selectedDhlAddon: selected DHL addon tier
 * - dhlAddonPriceEUR: selected DHL addon price in EUR
 */
const OrderSummary = ({
	cartItems,
	totalAmountEUR,
	totalAmountIDR,
	eurToIdrRate,
	dhlAddonEnabled = false,
	selectedDhlAddon = null,
	dhlAddonPriceEUR = 0,
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
				{cartItems.map((item) => {
					const { customsAmountEUR, itemTotalEUR } =
						totalPriceWithCustoms(item);

					return (
						<div
							key={item.key}
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
										€{itemTotalEUR.toFixed(2)}
									</div>

									{customsAmountEUR > 0 && (
										<div className="subtext mt-0.5 text-xs text-gray-500">
											incl. customs €
											{customsAmountEUR.toFixed(2)}
										</div>
									)}
								</div>
							</div>
						</div>
					);
				})}
			</div>

			{dhlAddonEnabled && selectedDhlAddon && (
				<div className="mt-4 rounded-xl border border-yellow-200 bg-yellow-50/70 p-3">
					<div className="flex items-center justify-between gap-3">
						<div>
							<div className="text-sm font-semibold text-gray-900">
								Germany DHL delivery
							</div>
							<div className="subtext mt-0.5 text-xs text-gray-600">
								{selectedDhlAddon.label}
							</div>
						</div>

						<div className="text-sm font-semibold text-gray-900">
							€{Number(dhlAddonPriceEUR).toFixed(2)}
						</div>
					</div>
				</div>
			)}

			<div className="mt-5 border-t pt-4">
				<div className="flex items-center justify-between">
					<div className="text-sm font-semibold text-gray-900">
						Total
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
					<p className="subtext text-xs text-gray-500 text-right">
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
