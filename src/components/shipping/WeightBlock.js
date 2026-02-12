import React from "react";

export default function WeightBlock({
                                        weight,
                                        handleWeightChange,
                                        willBeRounded,
                                        isVolumeLike,
                                    }) {
    return (
        <div className="rounded-2xl border bg-white p-4">
            <h4 className="font-semibold text-gray-900">Weight</h4>

            <div className="mt-2">
                <label className="subtext text-xs text-gray-500">Package weight (kg)</label>

                <input
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    min="0.1"
                    max="20"
                    value={weight}
                    onChange={handleWeightChange}
                    placeholder="e.g. 2.3"
                    className="mt-1 w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                />

                {willBeRounded && (
                    <p className="subtext mt-2 text-xs text-gray-700">
                        Your entered weight will be rounded <b>up</b> to the next {isVolumeLike ? "1.0" : "0.5"} kg tier.
                    </p>
                )}
            </div>
        </div>
    );
}
