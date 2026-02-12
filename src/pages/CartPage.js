import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaArrowRight, FaTrash } from "react-icons/fa";
import { CART_KEY } from "../utils/shipmentHelper";
import { formatDateToDDMMYYYY } from "../utils/formatDate";


const CartPage = () => {
    const [cartItems, setCartItems] = useState([]);

    useEffect(() => {
        try {
            const saved = localStorage.getItem(CART_KEY);
            if (saved) setCartItems(JSON.parse(saved));
        } catch {
            // ignore
        }
    }, []);

    // Calculate total price based on cart items and quantity
    const calculateTotalPrice = () => {
        return cartItems.reduce(
            (total, item) => total + (Number(item.priceEur) || 0) * (item.quantity || 1),
            0
        );
    };

    const handleQuantityChange = (index, newQuantity) => {
        if (newQuantity <= 0) return; // Prevent 0 or negative quantities
        const updatedCart = [...cartItems];
        updatedCart[index].quantity = newQuantity;
        setCartItems(updatedCart);
        localStorage.setItem(CART_KEY, JSON.stringify(updatedCart)); // Save to localStorage
    };

    const handleRemoveItem = (index) => {
        const updatedCart = cartItems.filter((_, i) => i !== index);
        setCartItems(updatedCart);
        localStorage.setItem(CART_KEY, JSON.stringify(updatedCart)); // Save to localStorage
    };

    return (
        <section className="py-24 bg-white">
            <div className="max-w-screen-xl mx-auto px-4">
                <h2 className="text-4xl font-semibold text-center mb-6">Your Cart</h2>

                {!cartItems.length ? (
                    <div className="subtext text-center text-lg text-gray-600">
                        Your cart is empty.{" "}
                        <Link to="/shipment" className="text-secondary font-semibold">
                            Schedule a shipment
                        </Link>{" "}
                        to begin.
                    </div>
                ) : (
                    <div className="space-y-8">
                        <div className="space-y-4">
                            {cartItems.map((item, index) => (
                                <div
                                    key={item.signature ?? index}
                                    className="rounded-2xl border bg-white shadow-sm p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                                >
                                    {/* LEFT: Main info */}
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <div className="text-lg font-semibold text-gray-900">
                                                {item.fromCountry} → {item.toCountry}
                                            </div>

                                           <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-gray-700">
                                               Pickup: {formatDateToDDMMYYYY(item.shipmentDate)}
                                           </span>
                                        </div>

                                        <div className="mt-1 subtext text-sm text-gray-600">
                                            {item.packageTypeLabel}
                                        </div>

                                        {/* Detail chips */}
                                        <div className="mt-2">
                                            {item.documentPages ? (
                                                <span className="rounded-full border bg-white px-3 py-1 text-sm font-semibold text-gray-700">
                                                    {item.documentPages} pages
                                                </span>
                                            ) : item.billedWeightKg ? (
                                                <span className="rounded-full border bg-white px-3 py-1 text-sm font-semibold text-gray-700">
                                                    {Number(item.billedWeightKg).toFixed(1)} kg
                                                </span>
                                            ) : null}
                                        </div>
                                    </div>

                                    {/* RIGHT: Quantity + Price + Actions */}
                                    <div className="flex items-center justify-between md:justify-end gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="subtext text-xs text-gray-500">Qty</div>
                                            <input
                                                type="number"
                                                value={item.quantity ?? 1}
                                                onChange={(e) => handleQuantityChange(index, parseInt(e.target.value, 10))}
                                                min="1"
                                                className="w-20 p-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                                            />
                                        </div>

                                        <div className="text-right">
                                            <div className="text-lg font-bold text-gray-900">
                                                €{((Number(item.priceEur) || 0) * (item.quantity || 1)).toFixed(2)}
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleRemoveItem(index)}
                                            className="w-9 h-9 flex items-center justify-center rounded-xl hover:text-secondary transition"
                                            title="Remove item"
                                        >
                                            <FaTrash className="text-sm" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end mt-6">
                            <p className="text-xl font-semibold">Total: €{calculateTotalPrice()?.toFixed(2)}</p>
                        </div>

                        <div className="mt-6 flex justify-end gap-4">
                            <Link to="/shipment" className="button-secondary">
                                Continue Shopping
                            </Link>
                            {cartItems.length > 0 && (
                                <Link to="/checkout" className="button-primary font-semibold">
                                    Proceed to Checkout
                                    <FaArrowRight className="ml-2 text-sm" />
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default CartPage;
