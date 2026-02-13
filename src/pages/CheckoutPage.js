import React, {useEffect, useState} from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';
import {CART_KEY} from "../utils/shipmentHelper";
import { ShipmentMeta } from "../components/shipping/ShipmentMeta";
import { hasDutyStep } from "../utils/dutyHelper";

const CheckoutPage = () => {
    const [cartItems, setCartItems] = useState([]);

    const [fullName, setFullName] = useState('');
    const [address, setAddress] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    const [paymentMethod, setPaymentMethod] = useState('');
    const [, setPaymentProof] = useState(null);

    const [termsAccepted, setTermsAccepted] = useState(false);

    const [totalAmountEUR, setTotalAmountEUR] = useState(0);
    const [totalAmountIDR, setTotalAmountIDR] = useState(0);

    useEffect(() => {
        const savedCartItems = localStorage.getItem(CART_KEY);
        if (savedCartItems) {
            setCartItems(JSON.parse(savedCartItems));
        }

    }, []);

    const backTo = hasDutyStep(cartItems) ? "/invoices" : "/cart";
    const backLabel = hasDutyStep(cartItems) ? "Back to Invoices" : "Back to Cart";

    // Recalculate the total amounts whenever cartItems change
    useEffect(() => {
        const calculateTotalPrice = () => {
            return cartItems.reduce((total, item) => {
                const price = Number(item.priceEur) || 0;
                const qty = Number(item.quantity) || 1;
                return total + price * qty;
            }, 0);
        };

        const totalEUR = calculateTotalPrice();
        const totalIDR = totalEUR * 19600;

        setTotalAmountEUR(totalEUR);
        setTotalAmountIDR(totalIDR);
    }, [cartItems]);

    const handleSubmit = (e) => {
        e.preventDefault();

        // TODO: Simulate sending data to Notion and sending an email (implement actual API calls here)
        alert("Checkout successful! Email sent and data connected to Notion.");
    };

    return (
        <section className="py-24 bg-gray-100">
            <div className="max-w-screen-xl mx-auto px-4">
                {/* Back to Cart button */}
                <div className="flex justify-between items-center mb-6">
                    <Link to={backTo} className="text-primary flex items-center gap-2">
                        <FaArrowRight className="transform rotate-180" />
                        <span>{backLabel}</span>
                    </Link>
                    <h2 className="text-4xl font-semibold text-center">Checkout</h2>
                </div>

                <div className="bg-white p-8 rounded-lg shadow-md">
                    {cartItems.length === 0 ? (
                        <div className="text-center text-lg text-gray-600">
                            Your cart is empty.{" "}
                            <Link to="/shipment" className="text-secondary font-semibold">
                                Schedule a shipment
                            </Link>{" "}
                            to begin.
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
                                {/* LEFT: Checkout form */}
                                <div>
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {/* Shipping Info */}
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-800">
                                                    Full Name <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    className="subtext w-full p-3 border border-gray-300 rounded-xl"
                                                    value={fullName}
                                                    onChange={(e) => setFullName(e.target.value)}
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-800">
                                                    Full Pickup Address <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    className="subtext w-full p-3 border border-gray-300 rounded-xl"
                                                    value={address}
                                                    onChange={(e) => setAddress(e.target.value)}
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-800">
                                                    Email <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="email"
                                                    className="subtext w-full p-3 border border-gray-300 rounded-xl"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-800">
                                                    Phone Number <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="tel"
                                                    className="subtext w-full p-3 border border-gray-300 rounded-xl"
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* Payment Method */}
                                        <div className="space-y-4 mt-6">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-800">
                                                    Payment Method <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    className="subtext w-full p-3 border border-gray-300 rounded-xl"
                                                    value={paymentMethod}
                                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                                    required
                                                >
                                                    <option value="">Select Payment Method</option>
                                                    <option value="paypal">PayPal</option>
                                                    <option value="iban">IBAN</option>
                                                    <option value="indonesian_bank">Indonesian Bank Account</option>
                                                </select>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="block text-sm font-semibold text-gray-800">
                                                    Proof of Payment <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="file"
                                                    className="subtext w-full p-3 border border-gray-300 rounded-xl"
                                                    onChange={(e) => setPaymentProof(e.target.files[0])}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* Terms */}
                                        <div className="mt-4 flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={termsAccepted}
                                                onChange={() => setTermsAccepted(!termsAccepted)}
                                                className="mr-2"
                                                required
                                            />
                                            <span>I have read and accept the</span>
                                            <Link to="/terms" target="_blank" className="text-blue-600 underline ml-1">
                                                Terms and Conditions
                                            </Link>
                                            <span className="text-red-500 ml-1">*</span>
                                        </div>

                                        {/* Checkout Button */}
                                        <button
                                            type="submit"
                                            className="button-primary font-semibold text-lg inline-flex items-center justify-center w-full mt-6 py-3"
                                        >
                                            Checkout <FaArrowRight className="ml-2 text-lg" />
                                        </button>
                                    </form>
                                </div>

                                {/* RIGHT: Order summary */}
                                <aside className="lg:sticky lg:top-24 h-fit">
                                    <div className="rounded-2xl border bg-white p-5 shadow-lg">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">Order summary</h3>
                                                <p className="subtext text-xs text-gray-600 mt-1">
                                                    {cartItems.length} shipment{cartItems.length === 1 ? "" : "s"}
                                                </p>
                                            </div>

                                            <Link to="/cart" className="text-sm font-semibold text-secondary hover:opacity-80">
                                                Edit
                                            </Link>
                                        </div>

                                        <div className="mt-4 space-y-3">
                                            {cartItems.map((item, idx) => {
                                                const qty = Number(item.quantity) || 1;
                                                const subtotal = (Number(item.priceEur) || 0) * qty;

                                                return (
                                                    <div key={item.signature ?? idx} className="rounded-xl border bg-gray-50/60 p-3">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <ShipmentMeta
                                                                item={item}
                                                                showPickupChip={false}
                                                                showDetailChip={false}
                                                                compact={true}
                                                            />

                                                            <div className="text-right shrink-0">
                                                                <div className="text-sm font-semibold text-gray-900">
                                                                    €{subtotal.toFixed(2)}
                                                                </div>
                                                                {qty > 1 && (
                                                                    <div className="subtext text-xs text-gray-500 mt-0.5">
                                                                        Qty {qty}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="mt-5 border-t pt-4">
                                            <div className="flex items-center justify-between">
                                                <div className="text-sm font-semibold text-gray-900">Total</div>
                                                <div className="text-lg font-bold text-gray-900">
                                                    €{totalAmountEUR.toFixed(2)}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between mt-1">
                                                <div className="subtext text-xs text-gray-500">Total IDR</div>
                                                <div className="subtext text-xs text-gray-700 font-semibold">
                                                    IDR {totalAmountIDR.toLocaleString()}
                                                </div>
                                            </div>

                                            <div className="mt-3 flex justify-end">
                                                <p className="subtext text-xs text-gray-500">
                                                    Calculated using fixed exchange rate: <span className="font-semibold text-gray-700">1 EUR = 19,600 IDR</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </aside>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
};

export default CheckoutPage;
