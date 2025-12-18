import React, { useEffect, useState, useMemo } from "react";
import { FaArrowRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import {CART_KEY, DHL_LOGO, ROUTES} from "../utils/CatalogHelper";
import DHL_TIERS from '../data/dhl-tiers.json';

const Catalog = () => {
    const [activeRouteKey, setActiveRouteKey] = useState(null);
    const [weight, setWeight] = useState("");
    const [shipmentDate, setShipmentDate] = useState("");

    const [cartItems, setCartItems] = useState([]);
    //const [cartItem, setCartItem] = useState(null);
    const [feedbackCartItem, setFeedbackCartItem] = useState(null);
    const [feedbackVisible, setFeedbackVisible] = useState(false);

    const weightNum = useMemo(() => {
        const w = parseFloat(weight);
        return Number.isFinite(w) ? w : 0;
    }, [weight]);

    // Select DHL tier based on weight
    const selectedTier = useMemo(() => pickTier(weightNum), [weightNum]);

    function pickTier(weightKg) {
        if (!weightKg || weightKg <= 0) return null;
        const tiers = DHL_TIERS;
        return tiers.find((tier) => weightKg <= tier.maxKg) || null;
    }

    // Check if the weight is valid (between 0.1 and 20 kg)
    const invalidWeight = weightNum !== 0 && (weightNum < 0.1 || weightNum > 20);

    const canAddToCart =
        !!activeRouteKey &&
        !!selectedTier &&
        !invalidWeight &&
        weightNum > 0 &&
        shipmentDate;

    useEffect(() => {
        try {
            const saved = localStorage.getItem(CART_KEY);
            if (saved) setCartItems(JSON.parse(saved));
        } catch {
            // ignore
        }
    }, []);

    const activeRoute = useMemo(
        () => ROUTES.find((r) => r.key === activeRouteKey) ?? null,
        [activeRouteKey]
    );

    const signature = useMemo(() => {
        return [
            activeRouteKey ?? "",
            selectedTier?.id ?? "",
            weightNum ? weightNum.toFixed(2) : "",
            shipmentDate ?? "",
        ].join("|");
    }, [
        activeRouteKey,
        selectedTier?.id,
        weightNum,
        shipmentDate,
    ]);

    // If user changes inputs after adding to cart -> require re-add (avoid stale cart)
    /*useEffect(() => {
        if (cartItem?.signature && cartItem.signature !== signature) {
            console.log("cartItem.signature:", cartItem.signature)
            console.log("signature:", signature)
            setCartItem(null);
            try {
                localStorage.removeItem(CART_KEY);
                console.log("Signature changes. Removing..")
            } catch {
                // ignore
            }
        }
    }, [signature, cartItem]);*/

    const toggleRoute = (key) => {
        setActiveRouteKey((prev) => (prev === key ? null : key));
    };

    const handleAddToCart = () => {
        if (!canAddToCart) return;

        const item = {
            type: "shipping",
            routeKey: activeRoute.key,
            routeTitle: activeRoute.title,
            weightKg: weightNum,
            shipmentDate,
            tierId: selectedTier.id,
            tierLabel: selectedTier.label,
            tierMaxKg: selectedTier.maxKg,
            priceEur: selectedTier.price,
            signature,
            quantity: 1,
            createdAt: new Date().toISOString(),
        };

        // Check if item already exists in cart (based on signature)
        const existingItemIndex = cartItems.findIndex((cartItem) => cartItem.signature === item.signature);

        let updatedCartItems;
        if (existingItemIndex >= 0) {
            // If item exists, update the quantity
            updatedCartItems = [...cartItems];
            updatedCartItems[existingItemIndex].quantity += 1;
        } else {
            // If item doesn't exist, add it to the cart
            updatedCartItems = [...cartItems, item];
        }

        // Update the cart in state and localStorage
        setCartItems(updatedCartItems);
        localStorage.setItem(CART_KEY, JSON.stringify(updatedCartItems));
        console.log("Storing last state of cart items:", updatedCartItems)

        // Reset the form immediately
        setFeedbackCartItem(item);
        resetForm();

        // Show feedback for 5 seconds
        setFeedbackVisible(true);
        setTimeout(() => {
            setFeedbackVisible(false);
            setFeedbackCartItem(null)
        }, 5000);
    };

    const resetForm = () => {
        setWeight("");
        setShipmentDate("");
    };

    return (
        <section id="catalog" className="py-24 bg-white">
            <div className="max-w-screen-xl mx-auto px-4">
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-semibold">Our Catalogs</h2>
                    <p className="mt-2 subtext text-lg text-gray-600">
                        Select a route to view pricing. DHL package is automatically selected based on weight.
                    </p>
                </div>

                {/* Route cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {ROUTES.map((route) => {
                        const active = route.key === activeRouteKey;

                        return (
                            <button
                                key={route.key}
                                type="button"
                                onClick={() => toggleRoute(route.key)}
                                aria-expanded={active}
                                className={[
                                    "group relative overflow-hidden rounded-2xl shadow-lg min-h-[320px] sm:min-h-[360px]",
                                    "transform transition-all duration-300 hover:scale-[1.02]",
                                    "focus:outline-none focus:ring-2 focus:ring-blue-600",
                                    active ? "ring-2 ring-blue-700" : "",
                                ].join(" ")}
                                style={{
                                    backgroundImage: `url('${route.image}')`,
                                    backgroundSize: "cover",
                                    backgroundPosition: "center",
                                }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10" />

                                <div className="relative h-full p-6 flex flex-col justify-end text-left text-white">
                                    <h3 className="text-2xl font-bold">{route.title}</h3>
                                    <p className="mt-1 subtext text-xs text-white/90">{route.subtitle}</p>

                                    <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold">
                                        {active ? "Hide details" : "View details"} <FaArrowRight />
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Inline details panel */}
                {activeRoute && (
                    <div className="mt-10 rounded-2xl border bg-white shadow-lg overflow-hidden">
                        {/* Header */}
                        <div className="p-6 border-b flex items-start justify-between gap-6">
                            <div>
                                <h3 className="text-xl font-semibold">{activeRoute.title}</h3>
                                <p className="text-xs subtext text-gray-600 mt-1">{activeRoute.subtitle}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => toggleRoute(activeRoute.key)}
                                className="text-gray-500 hover:text-gray-800 text-2xl leading-none"
                                aria-label="Close details"
                            >
                                ×
                            </button>
                        </div>

                        {/* Main content */}
                        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Left: inputs */}
                            <div className="space-y-6">
                                {/* Weight + calendar */}
                                <div className="rounded-xl border p-4">
                                    <div className="flex items-center justify-between gap-4">
                                        <h4 className="font-semibold text-gray-900">Shipping cost</h4>
                                        <img
                                            src={DHL_LOGO}
                                            alt="DHL"
                                            className="h-6 w-auto opacity-90"
                                            onError={(e) => {
                                                e.currentTarget.style.display = "none";
                                            }}
                                        />
                                    </div>

                                    <p className="subtext text-xs text-gray-600 mt-2">
                                        We automatically select the <b>next DHL package</b> based on weight.
                                    </p>

                                    <div className="mt-4">
                                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                                            Package weight (kg)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="0.1"
                                            max="20"
                                            value={weight}
                                            onChange={(e) => setWeight(e.target.value)}
                                            placeholder="e.g. 2.1"
                                            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                                            required
                                        />
                                        {invalidWeight && (
                                            <p className="mt-2 subtext text-sm text-red-600">
                                                Please enter a weight between 0.1 and 20 kg.
                                            </p>
                                        )}

                                        <div className="mt-4 rounded-xl bg-gray-50 border p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="text-xs text-gray-500">Selected DHL package</div>
                                                    <div className="text-base font-semibold text-gray-900">
                                                        {selectedTier && !invalidWeight ? selectedTier.label : "—"}
                                                    </div>
                                                    <div className="subtext text-xs text-gray-500 mt-1">
                                                        {selectedTier && !invalidWeight && weightNum > 0
                                                            ? `${weightNum} kg → automatically rounded up to ≤ ${selectedTier.maxKg} kg tier`
                                                            : "Enter weight to see the auto-selection"}
                                                    </div>
                                                </div>
                                                <div className="text-lg font-bold">
                                                    {selectedTier && selectedTier.price && !invalidWeight ? `€${selectedTier.price.toFixed(2)}` : "—"}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Calendar only */}
                                    <div className="mt-5">
                                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                                            Shipment date
                                        </label>
                                        <input
                                            type="date"
                                            value={shipmentDate}
                                            onChange={(e) => setShipmentDate(e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                                            required
                                            min={new Date().toISOString().split('T')[0]}
                                        />
                                    </div>
                                </div>

                                {/* Cart feedback */}
                                {feedbackVisible && feedbackCartItem && (
                                    <div className="rounded-xl border bg-green-50 p-4">
                                        <div className="text-sm font-semibold text-green-800">Added to cart</div>
                                        <div className="subtext text-xs text-green-800/80 mt-1">
                                            {feedbackCartItem.routeTitle} • {feedbackCartItem.tierLabel} • €{feedbackCartItem.priceEur ? feedbackCartItem.priceEur.toFixed(2) : ""} •{" "}
                                            {feedbackCartItem.weightKg} kg • {feedbackCartItem.shipmentDate}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right: pricing table */}
                            <div className="rounded-xl border p-4 h-fit">
                                <h4 className="font-semibold text-gray-900 mb-3">DHL package tiers</h4>

                                <div className="overflow-hidden rounded-xl border">
                                    <div className="grid grid-cols-3 bg-gray-50 text-xs font-semibold text-gray-600">
                                        <div className="p-3">Weight</div>
                                        <div className="p-3">Auto DHL</div>
                                        <div className="p-3 text-right">Price</div>
                                    </div>

                                    {DHL_TIERS.map((t) => {
                                        const active = selectedTier?.id === t.id && !invalidWeight && weightNum > 0;

                                        return (
                                            <div
                                                key={t.id}
                                                className={[
                                                    "grid grid-cols-3 border-t text-sm",
                                                    active ? "bg-blue-50" : "bg-white",
                                                ].join(" ")}
                                            >
                                                <div className="p-3">up to {t.maxKg} kg</div>
                                                <div className="p-3 font-semibold">{t.label}</div>
                                                <div className="p-3 text-right font-semibold">€{t.price ? t.price.toFixed(2) : ""}</div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <p className="subtext text-xs text-gray-600 mt-3">
                                    Example: 2.1 kg automatically selects the next tier (≤ 5 kg).
                                </p>
                            </div>
                        </div>

                        {/* Footer buttons (outer part, bottom-right, last thing) */}
                        <div className="p-6 border-t flex flex-col sm:flex-row gap-3 sm:justify-end">
                            <button
                                type="button"
                                onClick={handleAddToCart}
                                disabled={!canAddToCart}
                                className={[
                                    "button-text font-semibold",
                                    canAddToCart
                                        ? "bg-blue-800 hover:bg-blue-900 text-white"
                                        : "bg-gray-200 text-gray-500 cursor-not-allowed",
                                ].join(" ")}
                            >
                                Add to cart
                                <FaArrowRight className="ml-2 text-sm" />
                            </button>

                            <Link
                                to="/cart"
                                className="button-text bg-gray-800 hover:bg-gray-900"
                            >
                                Go to Cart
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Catalog;
