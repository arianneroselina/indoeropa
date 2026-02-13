import { formatDateToDDMMYYYY } from "../../utils/formatDate";

export const ShipmentMeta = ({
                          item,
                          idx,
                          showIndex = false,
                          showPickupChip = true,
                          showDetailChip = true,
                          compact = false,
                      }) => {
    const titleClass = compact
        ? "text-sm font-semibold text-gray-900 truncate"
        : "text-lg font-semibold text-gray-900";

    const subtitleClass = compact
        ? "subtext text-xs text-gray-600 mt-0.5 truncate"
        : "mt-1 subtext text-sm text-gray-600";

    const detailTextClass = compact
        ? "subtext text-xs text-gray-500 mt-1"
        : "mt-2";

    const detail =
        item.documentPages
            ? `${item.documentPages} pages`
            : item.billedWeightKg
                ? `${Number(item.billedWeightKg).toFixed(1)} kg`
                : null;

    return (
        <div className="min-w-0">
            <div className={compact ? "flex items-center gap-2 min-w-0" : "flex flex-wrap items-center gap-2"}>
                <div className={titleClass}>
                    {showIndex ? `Shipment ${idx + 1}: ` : ""}
                    {item.fromCountry} → {item.toCountry}
                </div>

                {showPickupChip && item.shipmentDate && (
                    <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-gray-700">
            Pickup: {formatDateToDDMMYYYY(item.shipmentDate)}
          </span>
                )}
            </div>

            <div className={subtitleClass}>
                {item.packageTypeLabel ?? item.packageTypeId}
            </div>

            {/* Details */}
            {showDetailChip ? (
                <div className={detailTextClass}>
                    {detail ? (
                        <span className="rounded-full border bg-white px-3 py-1 text-sm font-semibold text-gray-700">
              {detail}
            </span>
                    ) : null}
                </div>
            ) : (
                <div className={detailTextClass}>
          <span className="subtext text-xs text-gray-500">
            {detail ?? "—"}
              {!showPickupChip && item.shipmentDate ? ` • ${formatDateToDDMMYYYY(item.shipmentDate)}` : ""}
          </span>
                </div>
            )}
        </div>
    );
};
