import React, { useEffect, useRef, useState } from "react";

export default function PackageTypePicker({
                                              PACKAGE_TYPES,
                                              selectedPackageType,
                                              selectedPackageTypeId,
                                              setSelectedPackageTypeId,
                                          }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const onDown = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        if (open) document.addEventListener("mousedown", onDown);
        return () => document.removeEventListener("mousedown", onDown);
    }, [open]);

    return (
        <div ref={ref} className="rounded-2xl border bg-white p-6 mb-4 shadow-md">
            <div className="mb-4">
                <h4 className="text-lg font-semibold text-gray-900">Choose your package type</h4>
                <p className="subtext text-xs text-gray-600 mt-1">
                    This determines pricing and required shipment details.
                </p>
            </div>

            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="w-full rounded-xl border bg-white px-4 py-3 text-left hover:bg-gray-50 transition flex items-center justify-between"
            >
                <div className="flex items-center gap-3">
                    {selectedPackageType?.icon ? (
                        <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                            {React.createElement(selectedPackageType.icon, { className: "text-gray-700" })}
                        </div>
                    ) : (
                        <div className="w-9 h-9 rounded-lg bg-gray-100" />
                    )}

                    <div>
                        <div className="text-sm font-semibold text-gray-900">
                            {selectedPackageType ? selectedPackageType.label : "Select package type"}
                        </div>
                        <div className="subtext text-xs text-gray-500 mt-0.5">
                            {selectedPackageType ? selectedPackageType.description : "Click to view all options"}
                        </div>
                    </div>
                </div>

                <div className="text-gray-500 text-sm font-semibold">{open ? "▲" : "▼"}</div>
            </button>

            {open && (
                <div className="mt-3 rounded-2xl border bg-white p-3 shadow-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {PACKAGE_TYPES.map((p) => {
                            const active = p.id === selectedPackageTypeId;
                            const Icon = p.icon;

                            return (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => {
                                        setSelectedPackageTypeId(p.id);
                                        setOpen(false);
                                    }}
                                    className={[
                                        "rounded-xl border px-4 py-3 text-left transition",
                                        active ? "border-red-800 ring-2 ring-red-200" : "border-gray-200 hover:bg-gray-50",
                                    ].join(" ")}
                                >
                                    <div className="flex items-start gap-3">
                                        <div
                                            className={[
                                                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                                                active ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-700",
                                            ].join(" ")}
                                        >
                                            <Icon className="text-sm" />
                                        </div>

                                        <div>
                                            <div className="text-sm font-semibold text-gray-900 leading-tight">{p.label}</div>
                                            <div className="subtext text-[11px] text-gray-500 mt-0.5 leading-snug">{p.description}</div>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
