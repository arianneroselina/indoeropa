import React, { useMemo, useState, useEffect, useRef } from "react";
import { FaArrowRight, FaExchangeAlt, FaInfoCircle } from "react-icons/fa";
import { CART_KEY } from "../utils/shipmentHelper";

import { COUNTRIES, PACKAGE_TYPES, SIZE_PRESETS } from "../data/shippingData";
import { snapToHalf, getBilledWeight, calcPrice } from "../utils/shippingPricing";

import PackageTypePicker from "../components/shipping/PackageTypePicker";
import WeightBlock from "../components/shipping/WeightBlock";
import DimensionsBlock from "../components/shipping/DimensionsBlock";
import DocumentsBlock from "../components/shipping/DocumentsBlock";
import ShoesCustomsBlock from "../components/shipping/ShoesCustomsBlock";

export default function Shipment({ variant = "default" }) {
    const [fromCountry, setFromCountry] = useState("ID");
    const [toCountry, setToCountry] = useState("");

    const [selectedPackageTypeId, setSelectedPackageTypeId] = useState("");

    const [weight, setWeight] = useState("");
    const [lengthCm, setLengthCm] = useState("");
    const [widthCm, setWidthCm] = useState("");
    const [heightCm, setHeightCm] = useState("");

    const [documentPages, setDocumentPages] = useState("");
    const [originalPrice, setOriginalPrice] = useState("");

    // 0: package, 1: weight/pages, 2: dimensions, 3: shoes customs
    const [progressStep, setProgressStep] = useState(0);

    const [cartItems, setCartItems] = useState([]);
    const [feedbackItem, setFeedbackItem] = useState(null);
    const [feedbackVisible, setFeedbackVisible] = useState(false);

    const shipmentRef = useRef(null);

    // Load cart from localStorage once
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

    const selectedPackageType = useMemo(() => {
        return PACKAGE_TYPES.find((p) => p.id === selectedPackageTypeId) ?? null;
    }, [selectedPackageTypeId]);

    const isDocument = selectedPackageType?.pricing.type === "document";
    const isShoes = selectedPackageType?.id === "shoes";

    const isVolumeLike =
        selectedPackageType?.pricing.type === "volume" ||
        selectedPackageType?.pricing.type === "super_volume";

    // stored weight for cart (your old behavior)
    const weightNum = useMemo(() => {
        if (weight === "") return 0;
        return snapToHalf(weight);
    }, [weight]);

    // billed weight for pricing + summary display (volume-like rounds to full kg)
    const billedWeight = useMemo(() => {
        return getBilledWeight(weight, isVolumeLike);
    }, [weight, isVolumeLike]);

    const roundedWeight = billedWeight;
    const willBeRounded = weight && Number(weight) !== roundedWeight;

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

    // Progressive reveal (only increments)
    useEffect(() => {
        if (selectedPackageType && progressStep < 1) {
            setProgressStep(1);
        }
    }, [selectedPackageType, progressStep]);

    useEffect(() => {
        if (progressStep < 1) return;

        const okWeight = !isDocument && roundedWeight > 0;
        const okPages = isDocument && Number(documentPages) > 0;

        if ((okWeight || okPages) && progressStep < 2) {
            setProgressStep(2);
        }
    }, [progressStep, isDocument, roundedWeight, documentPages]);

    useEffect(() => {
        if (progressStep < 2) return;
        if (isDocument) return;

        const hasDims =
            Number(lengthCm) > 0 &&
            Number(widthCm) > 0 &&
            Number(heightCm) > 0;

        if (hasDims && progressStep < 3) {
            setProgressStep(3);
        }
    }, [progressStep, isDocument, lengthCm, widthCm, heightCm]);

    const canAddToCart = useMemo(() => {
        if (!canShowShipment) return false;
        if (!selectedPackageType) return false;

        if (isDocument) {
            const pages = Number(documentPages);
            return pages > 0 && pages <= 100;
        }

        if (roundedWeight <= 0) return false;

        if (isShoes) {
            const price = Number(originalPrice);
            return price > 0;
        }

        return true;
    }, [
        canShowShipment,
        selectedPackageType,
        isDocument,
        documentPages,
        roundedWeight,
        isShoes,
        originalPrice,
    ]);

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
        // 1 decimal place max
        if (/^\d*\.?\d?$/.test(raw)) {
            setWeight(raw);
        }
    };

    const applyPreset = (preset) => {
        setLengthCm(String(preset.dims.l));
        setWidthCm(String(preset.dims.w));
        setHeightCm(String(preset.dims.h));
    };

    const priceResult = useMemo(() => {
        return calcPrice({
            selectedPackageType,
            billedWeight: roundedWeight,
            documentPages,
        });
    }, [selectedPackageType, roundedWeight, documentPages]);

    const roundedText = useMemo(() => {
        if (!weight) return "";
        return `${Number(weight).toFixed(1)} kg → billed as ${roundedWeight.toFixed(1)} kg`;
    }, [weight, roundedWeight]);

    const priceLabel = priceResult.total ? `€${priceResult.total.toFixed(2)}` : "—";

    const handleAddToCart = () => {
        if (!canAddToCart) return;

        const item = {
            type: "shipping",
            fromCountry,
            toCountry,
            weightKg: weightNum,
            billedWeightKg: roundedWeight,
            dimensionsCm: { ...dims },
            packageTypeId: selectedPackageTypeId,
            packageTypeLabel: selectedPackageType?.label ?? "",
            priceEur: priceResult.total,
            priceBreakdown: priceResult.breakdown,
            quantity: 1,
            createdAt: new Date().toISOString(),
            documentPages: isDocument ? Number(documentPages) : undefined,
            originalPrice: isShoes ? Number(originalPrice) : undefined,
        };

        const signature = [
            item.fromCountry,
            item.toCountry,
            item.weightKg.toFixed(1),
            item.packageTypeId,
            item.dimensionsCm.l,
            item.dimensionsCm.w,
            item.dimensionsCm.h,
            isDocument ? `pages:${documentPages || ""}` : "",
            isShoes ? `price:${originalPrice || ""}` : "",
        ].join("|");

        const existingIndex = cartItems.findIndex((x) => x.signature === signature);
        const updated = [...cartItems];

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

        setFeedbackItem({
            fromLabel,
            toLabel,
            billed: isDocument
                ? `${documentPages || "—"} pages`
                : `${roundedWeight ? roundedWeight.toFixed(1) : "—"} kg`,
            packageLabel: selectedPackageType?.label ?? "—",
            priceLabel: priceResult.total ? `€${priceResult.total.toFixed(2)}` : "—",
        });

        setFeedbackVisible(true);
        setTimeout(() => {
            setFeedbackVisible(false);
            setFeedbackItem(null);
        }, 4000);

        // reset
        setWeight("");
    };

    const fromLabel = COUNTRIES.find((c) => c.id === fromCountry)?.name ?? fromCountry;
    const toLabel = COUNTRIES.find((c) => c.id === toCountry)?.name ?? toCountry;

    return (
        <section
            id="catalog"
            className={["py-24",
                variant === "home" ? "bg-primary" : "bg-white",
            ].join(" ")}
        >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
                <div className="text-center mb-10">
                    <h2
                        className={["text-4xl font-semibold",
                            variant === "home" ? "text-white" : "text-gray-900",
                        ].join(" ")}
                    >
                        Shipping
                    </h2>

                    <p
                        className={["mt-2 subtext text-lg",
                            variant === "home" ? "text-gray-200" : "text-gray-600",
                        ].join(" ")}
                    >
                        Choose destination, then describe your shipment.
                    </p>

                </div>

                {/* Route card */}
                <div className="rounded-2xl border bg-white shadow-lg overflow-hidden">
                    <div className="h-1 w-full bg-gradient-to-r from-red-800 via-red-600 to-red-400" />

                    <div className="p-6 border-b flex items-start justify-between gap-6">
                        <div>
                            <h3 className="mt-3 text-xl font-semibold text-gray-900">
                                Where are we shipping?
                            </h3>
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
                                            : "text-gray-500 cursor-not-allowed bg-gray-100 shadow-sm",
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

                {/* Shipment card */}
                {canShowShipment && (
                    <div ref={shipmentRef} className="mt-10">
                        <div className="rounded-2xl border bg-gradient-to-b bg-secondary shadow-lg overflow-hidden">
                            {/* Header */}
                            <div className="p-5 sm:p-6 flex items-start justify-between gap-6">
                                <div>
                                    <h3 className="mt-3 text-xl font-semibold text-white">Shipment details</h3>
                                    <div className="mt-3 inline-flex items-center gap-3 rounded-full bg-white/15 backdrop-blur-sm px-4 py-2">
                                        <span className="subtext text-sm text-white">{fromLabel}</span>
                                        <span className="subtext text-sm text-white">→</span>
                                        <span className="subtext text-sm text-white">{toLabel}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="px-4 pb-5 sm:px-6 sm:pb-6">
                                {/* Package picker (always visible in shipment) */}
                                <PackageTypePicker
                                    PACKAGE_TYPES={PACKAGE_TYPES}
                                    selectedPackageType={selectedPackageType}
                                    selectedPackageTypeId={selectedPackageTypeId}
                                    setSelectedPackageTypeId={setSelectedPackageTypeId}
                                />

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                    {/* LEFT */}
                                    <div className="space-y-4">
                                        {progressStep >= 1 && !isDocument && (
                                            <WeightBlock
                                                weight={weight}
                                                handleWeightChange={handleWeightChange}
                                                willBeRounded={willBeRounded}
                                                isVolumeLike={isVolumeLike}
                                            />
                                        )}

                                        {progressStep >= 2 && !isDocument && (
                                            <DimensionsBlock
                                                lengthCm={lengthCm}
                                                setLengthCm={setLengthCm}
                                                widthCm={widthCm}
                                                setWidthCm={setWidthCm}
                                                heightCm={heightCm}
                                                setHeightCm={setHeightCm}
                                                SIZE_PRESETS={SIZE_PRESETS}
                                                applyPreset={applyPreset}
                                            />
                                        )}

                                        {progressStep >= 1 && isDocument && (
                                            <DocumentsBlock
                                                documentPages={documentPages}
                                                setDocumentPages={setDocumentPages}
                                            />
                                        )}
                                    </div>

                                    {/* RIGHT */}
                                    <div className="space-y-4">
                                        {progressStep >= 3 && isShoes && (
                                            <ShoesCustomsBlock
                                                originalPrice={originalPrice}
                                                setOriginalPrice={setOriginalPrice}
                                            />
                                        )}

                                        <div className="rounded-2xl border bg-white p-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <h4 className="font-semibold text-gray-900">Summary</h4>

                                                <div className="relative inline-block group text-right">
                                                    <div className="text-xl font-bold text-gray-900 inline-flex items-center gap-2 cursor-help select-none">
                                                        {priceLabel}
                                                        <FaInfoCircle className="text-gray-500 text-sm" />
                                                    </div>

                                                    {!!priceResult.breakdown && (
                                                        <div
                                                            className={[
                                                                "absolute right-0 top-full mt-2 w-72",
                                                                "rounded-xl border bg-white shadow-lg",
                                                                "px-3 py-2 text-left",
                                                                "opacity-0 pointer-events-none translate-y-1",
                                                                "group-hover:opacity-100 group-hover:pointer-events-auto group-hover:translate-y-0",
                                                                "transition duration-150",
                                                            ].join(" ")}
                                                            role="tooltip"
                                                        >
                                                            <div className="text-xs font-semibold text-gray-900">Price calculation</div>
                                                            {!isDocument && willBeRounded && (
                                                                <div className="subtext text-xs text-gray-600 mt-1">{roundedText}</div>
                                                            )}
                                                            <div className="subtext text-xs text-gray-700 mt-2">{priceResult.breakdown}</div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                                                <div className="text-gray-500">Route</div>
                                                <div className="font-semibold text-gray-900 text-right">
                                                    {fromLabel} → {toLabel}
                                                </div>

                                                <div className="text-gray-500">Package</div>
                                                <div className="font-semibold text-gray-900 text-right">
                                                    {selectedPackageType?.label ?? "—"}
                                                </div>

                                                <div className="text-gray-500">Billed</div>
                                                <div className="font-semibold text-gray-900 text-right">
                                                    {isDocument ? `${documentPages || "—"} pages` : (roundedWeight ? `${roundedWeight.toFixed(1)} kg` : "—")}
                                                </div>
                                            </div>

                                            <div className="mt-4 flex justify-end">
                                                <button
                                                    type="button"
                                                    onClick={handleAddToCart}
                                                    disabled={!canAddToCart}
                                                    className={[
                                                        "button-text font-semibold inline-flex items-center justify-center",
                                                        canAddToCart ? "bg-secondary hover:bg-secondary-900 text-white" : "bg-gray-200 text-gray-500 cursor-not-allowed",
                                                    ].join(" ")}
                                                >
                                                    Add to cart
                                                    <FaArrowRight className="ml-2 text-sm" />
                                                </button>
                                            </div>
                                        </div>

                                        {feedbackVisible && feedbackItem && (
                                            <div className="rounded-2xl border bg-green-50 p-3">
                                                <div className="text-sm font-semibold text-green-800">Added to cart</div>
                                                <div className="text-xs text-green-800/80 mt-1">
                                                    {feedbackItem.fromLabel} → {feedbackItem.toLabel} • {feedbackItem.billed} •{" "}
                                                    {feedbackItem.packageLabel} • {feedbackItem.priceLabel}
                                                </div>
                                            </div>
                                        )}
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
