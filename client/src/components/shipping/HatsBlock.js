import React from "react";

export default function HatsBlock({ hatQuantity, setHatQuantity }) {
    return (
        <div className="rounded-2xl border bg-white p-4">
            <h4 className="font-semibold text-gray-900">Quantity</h4>
            <p className="subtext text-xs text-gray-600 mt-1">
                Hats are priced per piece.
            </p>

            <div className="mt-3">
                <label className="subtext text-xs text-gray-600">
                    Number of pieces
                </label>
                <input
                    type="number"
                    min="1"
                    value={hatQuantity}
                    onChange={(e) => setHatQuantity(e.target.value)}
                    className="mt-1 w-full p-3 border border-gray-300 rounded-xl bg-white"
                    placeholder="e.g. 2"
                />
            </div>
        </div>
    );
}
