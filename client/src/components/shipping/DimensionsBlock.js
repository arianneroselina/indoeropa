import React from "react";

export default function DimensionsBlock({
                                            lengthCm, setLengthCm,
                                            widthCm, setWidthCm,
                                            heightCm, setHeightCm,
                                            SIZE_PRESETS,
                                            applyPreset,
                                        }) {
    return (
        <div className="rounded-2xl border bg-white p-4">
            <h4 className="font-semibold text-gray-900">Dimensions</h4>

            <div className="mt-2">
                <div className="grid grid-cols-3 gap-3">
                    <div>
                        <label className="subtext text-xs text-gray-500">Length (cm)</label>
                        <input
                            type="number"
                            value={lengthCm}
                            onChange={(e) => setLengthCm(e.target.value)}
                            className="mt-1 w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                        />
                    </div>

                    <div>
                        <label className="subtext text-xs text-gray-500">Width (cm)</label>
                        <input
                            type="number"
                            value={widthCm}
                            onChange={(e) => setWidthCm(e.target.value)}
                            className="mt-1 w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                        />
                    </div>

                    <div>
                        <label className="subtext text-xs text-gray-500">Height (cm)</label>
                        <input
                            type="number"
                            value={heightCm}
                            onChange={(e) => setHeightCm(e.target.value)}
                            className="mt-1 w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                        />
                    </div>
                </div>
            </div>

            <div className="mt-2">
                <div className="subtext text-xs text-gray-500 mb-2">Quick presets</div>

                <div className="flex flex-wrap gap-2">
                    {SIZE_PRESETS.map((p) => (
                        <button
                            key={p.id}
                            type="button"
                            onClick={() => applyPreset(p)}
                            className="rounded-xl border bg-white px-4 py-2 text-left hover:bg-gray-100 transition"
                        >
                            <div className="text-xs font-semibold text-gray-900">{p.label}</div>
                            <div className="subtext text-[11px] text-gray-500">
                                {p.dims.l} × {p.dims.w} × {p.dims.h} cm
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
