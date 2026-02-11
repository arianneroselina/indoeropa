import React, { useMemo, useState, useEffect, useRef } from "react";
import { FaArrowRight, FaExchangeAlt, FaInfoCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import { CART_KEY } from "../utils/CatalogHelper";

const COUNTRIES = [
    { id: "ID", name: "Indonesia" },
    { id: "DE", name: "Germany" },
];

const PACKAGE_TYPES = [
    { id: "pkg_1_vol", label: "1 kg Volume" },
    { id: "pkg_1_super", label: "1 kg Super Volume" },
    { id: "bag", label: "Bag" },
    { id: "hat", label: "Hat" },
    { id: "shoes", label: "Shoes" },
    { id: "documents", label: "Documents" },
    { id: "wallet", label: "Wallet/Clutch" },
];

const SIZE_PRESETS = [
    { id: "a4", label: "A4 Envelope", dims: { l: 32, w: 24, h: 1 } },
    { id: "books", label: "Books", dims: { l: 23, w: 14, h: 4 } },
    { id: "shoebox", label: "Shoe box", dims: { l: 35, w: 20, h: 15 } },
    { id: "moving", label: "Moving box", dims: { l: 75, w: 35, h: 35 } },
];

function snapToHalf(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return 0;
    return Math.round(n * 2) / 2;
}

export default function Catalog() {
    const [fromCountry, setFromCountry] = useState("ID");
    const [toCountry, setToCountry] = useState("");

    const [weight, setWeight] = useState("");
    const [lengthCm, setLengthCm] = useState("");
    const [widthCm, setWidthCm] = useState("");
    const [heightCm, setHeightCm] = useState("");

    const [selectedPackageTypeId, setSelectedPackageTypeId] = useState("pkg_0_5");

    const [cartItems, setCartItems] = useState([]);
    const [feedbackVisible, setFeedbackVisible] = useState(false);

    const shipmentRef = useRef(null);

    useEffect(() => {
        try {
            const saved = localStorage.getItem(CART_KEY);
            if (saved) setCartItems(JSON.parse(saved));
        } catch {
            // ignore
        }
    }, []);

    const canShowShipment = useMemo(() => {
        return !!fromCountry && !!toCountry && fromCountry !== toCountry;
    }, [fromCountry, toCountry]);

    const weightNum = useMemo(() => {
        if (weight === "") return 0;
        return snapToHalf(weight);
    }, [weight]);

    const dims = useMemo(() => {
        const l = Number(lengthCm);
        const w = Number(widthCm);
        const h = Number(heightCm);
        return {
            l: Number.isFinite(l) ? l : 0,
            w: Number.isFinite(w) ? w : 0,
            h: Number.isFinite(h) ? h : 0,
        };
    }, [lengthCm, widthCm, heightCm]);

    const selectedPackageType = useMemo(() => {
        return PACKAGE_TYPES.find((p) => p.id === selectedPackageTypeId) ?? null;
    }, [selectedPackageTypeId]);

    const canAddToCart = useMemo(() => {
        if (!canShowShipment) return false;
        if (!selectedPackageType) return false;
        if (weightNum <= 0) return false;
        return true;
    }, [canShowShipment, selectedPackageType, weightNum]);

    const handleSwap = () => {
        if (!toCountry) return;
        setFromCountry(toCountry);
        setToCountry(fromCountry);
    };

    const handleWeightChange = (e) => {
        const raw = e.target.value;
        if (raw === "") {
            setWeight("");
            return;
        }

        // 1 decimal place
        if (/^\d*\.?\d?$/.test(raw)) {
            setWeight(raw);
        }
    };

    const roundUpToHalf = (value) => {
        const n = Number(value);
        if (!Number.isFinite(n)) return 0;
        return Math.ceil(n * 2) / 2;
    };

    const roundedWeight = weight ? roundUpToHalf(weight) : 0;
    const willBeRounded = weight && Number(weight) !== roundedWeight;

    const applyPreset = (preset) => {
        setLengthCm(String(preset.dims.l));
        setWidthCm(String(preset.dims.w));
        setHeightCm(String(preset.dims.h));
    };

    const priceEur = useMemo(() => {
        if (!roundedWeight || roundedWeight <= 0) return 0;

        const fullKg = Math.floor(roundedWeight);
        const hasHalf = roundedWeight % 1 !== 0;  // remaining 0.5kg

        return (fullKg * 15) + (hasHalf ? 10 : 0);
    }, [roundedWeight]);

    const priceBreakdown = useMemo(() => {
        if (!roundedWeight || roundedWeight <= 0) return "";

        const fullKg = Math.floor(roundedWeight);
        const hasHalf = roundedWeight % 1 !== 0;

        if (fullKg === 0 && hasHalf) {
            return "1 × 10€";
        }

        if (fullKg > 0 && hasHalf) {
            return `${fullKg} × 15€ + 1 × 10€`;
        }

        if (fullKg > 0 && !hasHalf) {
            return `${fullKg} × 15€`;
        }

        return "";
    }, [roundedWeight]);

    const roundedText = useMemo(() => {
        if (!weight) return "";
        return `${Number(weight).toFixed(1)} kg → billed as ${roundedWeight.toFixed(1)} kg`;
    }, [weight, roundedWeight]);

    const priceLabel = useMemo(() => {
        if (!roundedWeight || roundedWeight <= 0) return "—";
        return `€${priceEur.toFixed(2)}`;
    }, [roundedWeight, priceEur]);

    const handleAddToCart = () => {
        if (!canAddToCart) return;

        const item = {
            type: "shipping",
            fromCountry,
            toCountry,
            weightKg: weightNum,
            dimensionsCm: { ...dims },
            packageTypeId: selectedPackageTypeId,
            packageTypeLabel: selectedPackageType?.label ?? "",
            quantity: 1,
            createdAt: new Date().toISOString(),
        };

        const signature = [
            item.fromCountry,
            item.toCountry,
            item.weightKg.toFixed(1),
            item.packageTypeId,
            item.dimensionsCm.l,
            item.dimensionsCm.w,
            item.dimensionsCm.h,
        ].join("|");

        const existingIndex = cartItems.findIndex((x) => x.signature === signature);
        let updated = [...cartItems];

        if (existingIndex >= 0) {
            updated[existingIndex] = {
                ...updated[existingIndex],
                quantity: (updated[existingIndex].quantity ?? 1) + 1,
            };
        } else {
            updated.push({ ...item, signature });
        }

        setCartItems(updated);
        localStorage.setItem(CART_KEY, JSON.stringify(updated));

        setFeedbackVisible(true);
        setTimeout(() => setFeedbackVisible(false), 4000);

        // Keep route selection; reset shipment basics
        setWeight("");
    };

    const fromLabel = COUNTRIES.find((c) => c.id === fromCountry)?.name ?? fromCountry;
    const toLabel = COUNTRIES.find((c) => c.id === toCountry)?.name ?? toCountry;

    return (
        <section id="catalog" className="py-24 bg-white">
            <div className="max-w-5xl mx-auto px-4 sm:px-6">
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-semibold">Shipping</h2>
                    <p className="mt-2 subtext text-lg text-gray-600">
                        Choose destination, then describe your shipment.
                    </p>
                </div>

                {/* Step 1: Route card */}
                <div className="rounded-2xl border bg-white shadow-lg overflow-hidden">
                    <div className="h-1 w-full bg-gradient-to-r from-red-800 via-red-600 to-red-400" />

                    <div className="p-6 border-b flex items-start justify-between gap-6">
                        <div>
                            <h3 className="mt-3 text-xl font-semibold text-gray-900">Where are we shipping?</h3>
                            <p className="text-xs subtext text-gray-600 mt-1">
                                Currently available: Indonesia ↔ Germany
                            </p>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 md:gap-6 items-stretch">
                            {/* From */}
                            <div className="rounded-xl border p-4">
                                <div className="text-xs text-gray-500">From</div>
                                <div className="mt-4 flex items-center justify-between">
                                    <div className="text-lg font-semibold text-gray-900">{fromLabel}</div>
                                    <span className="text-xs text-gray-500">Billing country</span>
                                </div>
                            </div>

                            {/* Swap */}
                            <div className="relative flex items-center justify-center">
                                <div className="hidden md:block absolute left-0 right-0 h-px bg-gray-200" />
                                <div className="md:hidden absolute top-0 bottom-0 w-px bg-gray-200" />

                                <button
                                    type="button"
                                    onClick={handleSwap}
                                    disabled={!toCountry}
                                    className={[
                                        "relative z-10 w-12 h-12 rounded-full border bg-white shadow-md",
                                        "flex items-center justify-center transition",
                                        toCountry
                                            ? "hover:scale-[1.03] hover:bg-gray-50 text-gray-900"
                                            : "text-gray-400 cursor-not-allowed bg-gray-100 shadow-sm",
                                    ].join(" ")}
                                    title="Swap From/To"
                                >
                                    <FaExchangeAlt />
                                </button>
                            </div>

                            {/* To */}
                            <div className="relative rounded-2xl border bg-white p-5 shadow-sm">
                                <div className="text-xs font-semibold text-gray-500">To</div>

                                <select
                                    value={toCountry}
                                    onChange={(e) => setToCountry(e.target.value)}
                                    className="mt-2 w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                                >
                                    <option value="">Select destination</option>
                                    {COUNTRIES.filter((c) => c.id !== fromCountry).map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>

                                {fromCountry && toCountry && fromCountry === toCountry && (
                                    <div className="mt-2 text-sm text-red-800">
                                        From and To can’t be the same country.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>


                {/* Step 2: Shipment card */}
                {canShowShipment && (
                    <div ref={shipmentRef} className="mt-10">
                        <div className="rounded-2xl border bg-gradient-to-b bg-red-800 shadow-lg overflow-hidden">

                            {/* Header */}
                            <div className="p-5 sm:p-6 flex items-start justify-between gap-6">
                                <div>
                                    <h3 className="mt-3 text-xl font-semibold text-white">Shipment details</h3>
                                    <div className="mt-3 inline-flex items-center gap-3 rounded-full bg-white/15 backdrop-blur-sm px-4 py-2">
                                        <span className="subtext text-sm text-white">
                                            {fromLabel}
                                        </span>
                                        <span className="subtext text-sm text-white">→</span>
                                        <span className="subtext text-sm text-white">
                                            {toLabel}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="px-4 pb-5 sm:px-6 sm:pb-6">
                                <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-5">
                                    <div className="space-y-4">
                                        {/* Weight block */}
                                        <div className="rounded-2xl border bg-gray-50/80 p-4">
                                            <h4 className="font-semibold text-gray-900">Weight</h4>

                                            <div className="mt-2">
                                                <label className="block text-xs font-semibold text-gray-700 mb-2">
                                                    Package weight (kg)
                                                </label>

                                                <input
                                                    type="number"
                                                    inputMode="decimal"
                                                    step="0.1"
                                                    min="0.1"
                                                    max="20"
                                                    value={weight}
                                                    onChange={handleWeightChange}
                                                    placeholder="e.g. 2.3"
                                                    className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                                                />

                                                {willBeRounded && (
                                                    <p className="subtext mt-2 text-xs text-gray-700">
                                                        Your entered weight will automatically be rounded <b>up</b> to the next 0.5 kg tier.
                                                    </p>
                                                )}

                                                {roundedWeight > 0 && (
                                                    <div className="mt-3 rounded-xl bg-white/50 border p-4">
                                                        <div className="flex items-center justify-between gap-4">
                                                            <div>
                                                                <div className="subtext text-xs text-gray-500">
                                                                    Estimated price
                                                                </div>

                                                                <div className="text-base font-semibold text-gray-900">
                                                                    {willBeRounded
                                                                        ? `Rounded to ${roundedWeight.toFixed(1)} kg`
                                                                        : `${roundedWeight.toFixed(1)} kg`}
                                                                </div>
                                                            </div>

                                                            <div className="text-right">
                                                                {/* Tooltip wrapper */}
                                                                <div className="relative inline-block group">
                                                                    {/* Hoverable price */}
                                                                    <div
                                                                        className={[
                                                                            "text-lg font-bold text-gray-900 inline-flex items-center gap-2",
                                                                            "cursor-help select-none",
                                                                        ].join(" ")}
                                                                        title="" // prevent default browser tooltip
                                                                    >
                                                                        {priceLabel}
                                                                        <FaInfoCircle className="text-gray-500 text-sm" />
                                                                    </div>

                                                                    {/* Tooltip */}
                                                                    {priceBreakdown && (
                                                                        <div
                                                                            className={[
                                                                                "absolute right-0 top-full mt-2 w-64",
                                                                                "rounded-xl border bg-white shadow-lg",
                                                                                "px-3 py-2 text-left",
                                                                                "opacity-0 pointer-events-none translate-y-1",
                                                                                "group-hover:opacity-100 group-hover:pointer-events-auto group-hover:translate-y-0",
                                                                                "transition duration-150",
                                                                            ].join(" ")}
                                                                            role="tooltip"
                                                                        >
                                                                            <div className="text-xs font-semibold text-gray-900">
                                                                                Price calculation
                                                                            </div>

                                                                            {willBeRounded && (
                                                                                <div className="subtext text-xs text-gray-600 mt-1">
                                                                                    {roundedText}
                                                                                </div>
                                                                            )}

                                                                            <div className="subtext text-xs text-gray-700 mt-2">
                                                                                {priceBreakdown}
                                                                            </div>

                                                                            <div className="subtext text-[11px] text-gray-500 mt-2">
                                                                                1 kg = 15€ • 0.5 kg = 10€ (rounded up)
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>


                                        {/* Dimensions block */}
                                        <div className="rounded-2xl border bg-gray-50/80 p-4">
                                            <h4 className="font-semibold text-gray-900">Dimensions</h4>

                                            {/* Inputs */}
                                            <div className="mt-2">
                                                <div className="grid grid-cols-3 gap-3">
                                                    <div>
                                                        <label className="subtext text-xs text-gray-500">
                                                            Length (cm)
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={lengthCm}
                                                            onChange={(e) => setLengthCm(e.target.value)}
                                                            className="mt-1 w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="subtext text-xs text-gray-500">
                                                            Width (cm)
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={widthCm}
                                                            onChange={(e) => setWidthCm(e.target.value)}
                                                            className="mt-1 w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="subtext text-xs text-gray-500">
                                                            Height (cm)
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={heightCm}
                                                            onChange={(e) => setHeightCm(e.target.value)}
                                                            className="mt-1 w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Presets */}
                                            <div className="mt-2">
                                                <div className="subtext text-xs text-gray-500 mb-2">
                                                    Quick presets
                                                </div>

                                                <div className="flex flex-wrap gap-2">
                                                    {SIZE_PRESETS.map((p) => (
                                                        <button
                                                            key={p.id}
                                                            type="button"
                                                            onClick={() => applyPreset(p)}
                                                            className="rounded-xl border bg-white px-4 py-2 text-left hover:bg-gray-100 transition"
                                                        >
                                                            <div className="text-xs font-semibold text-gray-900">
                                                                {p.label}
                                                            </div>

                                                            <div className="subtext text-[11px] text-gray-500">
                                                                {p.dims.l} × {p.dims.w} × {p.dims.h} cm
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {/* Package Type block */}
                                        <div className="rounded-2xl border bg-gray-50/80 p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">Package type</h4>
                                                    <p className="text-xs subtext text-gray-600 mt-0.5">
                                                        Choose one option
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {PACKAGE_TYPES.map((p) => {
                                                    const active = p.id === selectedPackageTypeId;
                                                    return (
                                                        <button
                                                            key={p.id}
                                                            type="button"
                                                            onClick={() => setSelectedPackageTypeId(p.id)}
                                                            className={[
                                                                "rounded-xl border px-3 py-3 text-left transition",
                                                                "bg-white",
                                                                active
                                                                    ? "border-red-800 ring-1 ring-red-200"
                                                                    : "border-gray-200 hover:bg-gray-50",
                                                            ].join(" ")}
                                                        >
                                                            <div className="text-sm font-semibold text-gray-900">{p.label}</div>
                                                            <div className="text-xs subtext text-gray-500 mt-0.5">
                                                                {active ? "Selected" : "Select"}
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Summary block */}
                                        <div className="rounded-2xl border bg-white p-4">
                                            <h4 className="font-semibold text-gray-900">Summary</h4>

                                            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                                                <div className="text-gray-500">Route</div>
                                                <div className="font-semibold text-gray-900 text-right">
                                                    {fromLabel} → {toLabel}
                                                </div>

                                                <div className="text-gray-500">Weight</div>
                                                <div className="font-semibold text-gray-900 text-right">
                                                    {weightNum ? `${weightNum.toFixed(1)} kg` : "—"}
                                                </div>

                                                <div className="text-gray-500">Package</div>
                                                <div className="font-semibold text-gray-900 text-right">
                                                    {selectedPackageType?.label ?? "—"}
                                                </div>
                                            </div>

                                            <div className="mt-4 flex justify-end">
                                                <button
                                                    type="button"
                                                    onClick={handleAddToCart}
                                                    disabled={!canAddToCart}
                                                    className={[
                                                        "button-text font-semibold inline-flex items-center justify-center",
                                                        canAddToCart
                                                            ? "bg-red-800 hover:bg-red-900 text-white"
                                                            : "bg-gray-200 text-gray-500 cursor-not-allowed",
                                                    ].join(" ")}
                                                >
                                                    Add to cart
                                                    <FaArrowRight className="ml-2 text-sm" />
                                                </button>
                                            </div>

                                            {feedbackVisible && (
                                                <div className="mt-4 rounded-xl border bg-green-50 p-3">
                                                    <div className="text-sm font-semibold text-green-800">Added to cart</div>
                                                    <div className="text-xs text-green-800/80 mt-1">
                                                        {fromLabel} → {toLabel} • {weightNum.toFixed(1)} kg • {selectedPackageType?.label}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
