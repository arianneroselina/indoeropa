import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import {CART_KEY} from "../utils/CatalogHelper";

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
            (total, item) => total + item.priceEur * item.quantity,
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
                        <Link to="/catalog" className="text-red-800 font-semibold">
                            Browse our catalog
                        </Link>{" "}
                        to add items to your cart.
                    </div>
                ) : (
                    <div className="space-y-8">
                        {cartItems.map((item, index) => (
                            <div key={index} className="flex justify-between items-center border-b py-4">
                                <div className="flex items-center gap-4">
                                    <div>
                                        <p className="text-lg font-semibold">{item.routeTitle} - {item.tierLabel}</p>
                                        <p className="text-sm text-gray-500">{item.shipmentDate}</p>
                                        <p className="text-sm text-gray-500">{item.weightKg} kg</p>
                                    </div>
                                </div>

                                {/* Quantity Input */}
                                <div className="flex items-center gap-4">
                                    <input
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => handleQuantityChange(index, parseInt(e.target.value))}
                                        min="1"
                                        className="w-16 p-2 border border-gray-300 rounded-md"
                                    />
                                    <p className="text-lg font-semibold">
                                        €{(item.priceEur * item.quantity)?.toFixed(2)}
                                    </p>
                                    <button
                                        onClick={() => handleRemoveItem(index)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}

                        <div className="flex justify-end mt-6">
                            <p className="text-xl font-semibold">Total: €{calculateTotalPrice()?.toFixed(2)}</p>
                        </div>

                        <div className="mt-6 flex justify-end gap-4">
                            <Link to="/catalog" className="button-text bg-gray-800">
                                Continue Shopping
                            </Link>
                            {cartItems.length > 0 && (
                                <Link to="/checkout" className="button-text font-semibold">
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
