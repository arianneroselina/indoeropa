import React, { useMemo } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { formatDateToISO, formatDateToDDMMYYYY } from "../../utils/formatDate";
import { AVAILABLE_DATES } from "../../data/shippingData";

const Calendar = ({ routeKey, shipmentDate, setShipmentDate }) => {
    const availableDates = useMemo(() => {
        return (AVAILABLE_DATES?.[routeKey] || [])
            .map((d) => new Date(`${d}T00:00:00`)); // safe local parsing
    }, [routeKey]);
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

        const selectedISO = formatDateToISO(date); // "YYYY-MM-DD"
        const allowedISO = (AVAILABLE_DATES?.[routeKey] || []);

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
                            <div className="text-sm font-semibold text-gray-900">No pickup dates available</div>
                            <div className="subtext text-xs text-gray-600 mt-1">
                                Please choose another route or check back later.
                            </div>
                        </div>
                    </div>
                )}

                <div className={`calendar-wrap ${!hasAvailableDates ? "pointer-events-none opacity-40" : ""}`}>
                    <DatePicker
                        selected={selectedDateObj}
                        onChange={handleDateChange}
                        inline
                        includeDates={availableDates}
                        disabled={!hasAvailableDates}
                        calendarClassName="shipping-calendar"
                        dayClassName={(date) => {
                            const iso = formatDateToISO(date);
                            const allowed = (AVAILABLE_DATES?.[routeKey] || []).includes(iso);
                            return allowed ? "shipping-day-available" : "shipping-day-disabled";
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default Calendar;
