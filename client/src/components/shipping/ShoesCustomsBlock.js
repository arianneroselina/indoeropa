import React from "react";

export default function ShoesCustomsBlock({ originalPrice, setOriginalPrice }) {
    return (
        <div className="rounded-2xl border bg-white p-4">
            <h4 className="font-semibold text-gray-900">Customs info</h4>
            <p className="subtext text-xs text-gray-600 mt-1">Required for shoes shipments.</p>

            <div className="mt-3 space-y-3">
                <div>
                    <label className="subtext text-xs text-gray-600">Upload purchase invoice</label>
                    <input type="file" className="mt-1 w-full text-sm" />
                </div>

                <div>
                    <label className="subtext text-xs text-gray-600">Original price (€)</label>
                    <input
                        type="number"
                        value={originalPrice}
                        onChange={(e) => setOriginalPrice(e.target.value)}
                        className="mt-1 w-full p-3 border border-gray-300 rounded-xl bg-white"
                    />
                    {Number(originalPrice) > 125 && (
                        <div className="subtext text-xs text-gray-600 mt-2">
                            Additional fee: {(Number(originalPrice) * 0.025).toFixed(2)}€
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
