import React, { useMemo } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { formatDateToISO, formatDateToDDMMYYYY } from "../../utils/formatDate";
import { useShippingData } from "../../hooks/useShippingData";

const Calendar = ({ routeKey, shipmentDate, setShipmentDate }) => {
	const { data } = useShippingData();
	const routeDates = useMemo(() => data?.ROUTE_DATES ?? {}, [data]);

	//console.log("routeDates", routeDates);

	const allowedISO = useMemo(() => {
		const entries = routeDates?.[routeKey] || [];
		const dates = [];

		for (const entry of entries) {
			const start = new Date(`${entry.start}T00:00:00`);
			const end = entry.end
				? new Date(`${entry.end}T00:00:00`)
				: new Date(`${entry.start}T00:00:00`);

			const current = new Date(start);
			while (current <= end) {
				dates.push(formatDateToISO(current));
				current.setDate(current.getDate() + 1);
			}
		}

		return [...new Set(dates)].sort();
	}, [routeKey, routeDates]);

	const availableDates = useMemo(() => {
		return allowedISO.map((d) => new Date(`${d}T00:00:00`));
	}, [allowedISO]);

	const hasAvailableDates = availableDates.length > 0;

	const selectedDateObj = useMemo(() => {
		if (!shipmentDate) return null;
		return new Date(`${shipmentDate}T00:00:00`);
	}, [shipmentDate]);

	const handleDateChange = (date) => {
		if (!date) {
			setShipmentDate("");
			return;
		}

		const selectedISO = formatDateToISO(date);

		if (allowedISO.includes(selectedISO)) {
			setShipmentDate(selectedISO);
		} else {
			setShipmentDate("");
		}
	};

	return (
		<div className="rounded-2xl border bg-white p-4">
			<div className="flex items-start justify-between gap-3">
				<div>
					<h4 className="font-semibold text-gray-900">Pickup date</h4>
					<p className="subtext text-xs text-gray-600 mt-0.5">
						Choose an available pickup date for this route.
					</p>
				</div>

				{shipmentDate ? (
					<span className="rounded-full border bg-white px-3 py-1 text-xs font-semibold text-gray-700">
						Selected: {formatDateToDDMMYYYY(shipmentDate)}
					</span>
				) : (
					<span className="rounded-full border bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-500">
						Not selected
					</span>
				)}
			</div>

			<div className="mt-3 rounded-2xl border bg-gray-50/70 p-3 relative">
				{!hasAvailableDates && (
					<div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/60 backdrop-blur-sm">
						<div className="rounded-2xl border bg-gray-100 px-5 py-4 shadow-sm text-center max-w-sm">
							<div className="text-sm font-semibold text-gray-900">
								No pickup dates available
							</div>
							<div className="subtext text-xs text-gray-600 mt-1">
								Please choose another route or check back later.
							</div>
						</div>
					</div>
				)}

				<div
					className={`calendar-wrap ${!hasAvailableDates ? "pointer-events-none opacity-40" : ""}`}
				>
					<DatePicker
						selected={selectedDateObj}
						onChange={handleDateChange}
						inline
						includeDates={availableDates}
						disabled={!hasAvailableDates}
						calendarClassName="shipping-calendar"
						dayClassName={(date) => {
							const iso = formatDateToISO(date);
							const allowed = allowedISO.includes(iso);
							return allowed
								? "shipping-day-available"
								: "shipping-day-disabled";
						}}
					/>
				</div>
			</div>
		</div>
	);
};

export default Calendar;
