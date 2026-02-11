import React, { useState, useEffect } from 'react';
import { DatePicker } from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import Options from '../data/options.json';
import {formatDateToISO} from "../utils/formatDate";

const Calendar = ({ routeKey, shipmentDate, setShipmentDate }) => {
    const [availableDates, setAvailableDates] = useState([]);

    useEffect(() => {
        setAvailableDates(Options.availableDates[routeKey] || []);
    }, [routeKey]);

    const handleDateChange = (date) => {
        if (date) {
            // manually extract date in 'YYYY-MM-DD' format, avoiding time zone issues
            const selectedDate = formatDateToISO(date);
            if (availableDates.includes(selectedDate)) {
                setShipmentDate(selectedDate);
            } else {
                alert('Selected date is not available. Please choose a valid date.');
                setShipmentDate(null);
            }
        }
    };

    return (
        <div className="mt-5">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
                Shipment date
            </label>
            <DatePicker
                selected={shipmentDate}
                onChange={handleDateChange}
                required
                includeDates={availableDates}
                dateFormat="dd/MM/yyyy"
                placeholderText="Select a date"
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                showMonthYearDropdown
            />
        </div>
    );
};

export default Calendar;
