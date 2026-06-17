import { Link } from "react-router-dom";
import { ShipmentMeta } from "../shipping/ShipmentMeta";
import { totalPriceWithCustoms } from "../../utils/checkoutHelper";
import { formatOptionalEUR, formatOptionalIDR } from "../../utils/formatters";
import { useShippingData } from "../../hooks/useShippingData";
import { useMemo } from "react";

/**
 * OrderSummary
 *
 * Props:
 * - checkoutItems: array of cart/shipment items shown in the summary
 * - totalAmountEUR: final total in EUR (including customs / addons)
 * - totalAmountIDR: final total in IDR
 * - dhlAddonEnabled: whether Germany DHL addon section is active
 * - dhlAddonObject: selected DHL addon tier object
 * - dhlAddonPriceEUR: selected DHL addon price in EUR
 */
const OrderSummary = ({
	checkoutItems,
	totalAmountEUR,
	totalAmountIDR,
	dhlAddonEnabled = false,
	dhlAddonObject = null,
	dhlAddonPriceEUR = 0,
}) => {
	const { data } = useShippingData();
	const eurToIdrRate = useMemo(() => data?.EUR_TO_IDR_RATE ?? 0, [data]);

	return (
		<aside className="rounded-2xl border bg-white p-5 shadow-lg">
			<div className="flex items-start justify-between gap-4">
				<div>
					<h3 className="text-lg font-semibold text-gray-900">
						Order summary
					</h3>
					<p className="subtext mt-1 text-xs text-gray-600">
						{checkoutItems.length} shipment
						{checkoutItems.length === 1 ? "" : "s"}
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
				{checkoutItems.map((item) => {
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
										{formatOptionalEUR(itemTotalEUR)}
									</div>

									{customsAmountEUR > 0 && (
										<div className="subtext mt-0.5 text-xs text-gray-500">
											incl. customs €
											{formatOptionalEUR(
												customsAmountEUR,
											)}
										</div>
									)}
								</div>
							</div>
						</div>
					);
				})}
			</div>

			{dhlAddonEnabled && dhlAddonObject && (
				<div className="mt-4 rounded-xl border border-yellow-200 bg-yellow-50/70 p-3">
					<div className="flex items-center justify-between gap-3">
						<div>
							<div className="text-sm font-semibold text-gray-900">
								Germany DHL delivery
							</div>
							<div className="subtext mt-0.5 text-xs text-gray-600">
								{dhlAddonObject.label}
							</div>
						</div>

						<div className="text-sm font-semibold text-gray-900">
							{formatOptionalEUR(dhlAddonPriceEUR)}
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
						{formatOptionalEUR(totalAmountEUR)}
					</div>
				</div>

				<div className="mt-1 flex items-center justify-between">
					<div className="subtext text-xs text-gray-500">
						Total IDR
					</div>
					<div className="subtext text-xs font-semibold text-gray-700">
						{formatOptionalIDR(totalAmountIDR)}
					</div>
				</div>

				<div className="mt-3 flex justify-end">
					<p className="subtext text-xs text-gray-500 text-right">
						Calculated using fixed exchange rate:{" "}
						<span className="font-semibold text-gray-700">
							1 EUR = {formatOptionalIDR(eurToIdrRate)}
						</span>
					</p>
				</div>
			</div>
		</aside>
	);
};

export default OrderSummary;
