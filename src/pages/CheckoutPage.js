import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';
import {CART_KEY} from "../utils/shipmentHelper";
import {formatDateToDDMMYYYY} from "../utils/formatDate";

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

    // Recalculate the total amounts whenever cartItems change
    useEffect(() => {
        const calculateTotalPrice = () => {
            return cartItems.reduce(
                (total, item) => total + item.priceEur * item.quantity,
                0
            );
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
                    <Link to="/cart" className="text-blue-600 flex items-center gap-2">
                        <FaArrowRight className="transform rotate-180" />
                        <span>Back to Cart</span>
                    </Link>
                    <h2 className="text-4xl font-semibold text-center">Checkout</h2>
                </div>

                <div className="bg-white p-8 rounded-lg shadow-md">
                    {cartItems.length === 0 ? (
                        <div className="text-center text-lg text-gray-600">
                            Your cart is empty.{" "}
                            <Link to="/shipment" className="text-red-800 font-semibold">
                                Browse our catalog
                            </Link>{" "}
                            to add items to your cart.
                        </div>
                    ) : (
                        <>
                            <div className="space-y-6">
                                {/* Cart summary */}
                                {cartItems.map((item, index) => (
                                    <div key={index} className="flex justify-between items-center border-b py-4">
                                        <div className="flex items-center gap-4">
                                            <div>
                                                <p className="text-lg font-semibold">{item.routeTitle} - {item.tierLabel}</p>
                                                <p className="text-sm text-gray-500">{formatDateToDDMMYYYY(item.shipmentDate)}</p>
                                                <p className="text-sm text-gray-500">{item.weightKg} kg</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <p className="text-lg font-semibold px-16">
                                                {item.quantity}
                                            </p>
                                            <p className="text-lg font-semibold">
                                                €{(item.priceEur * item.quantity).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 flex justify-end items-center space-x-4">
                                <p className="text-xl font-semibold text-gray-900">Total:</p>
                                <p className="text-xl font-bold">
                                    €{totalAmountEUR.toFixed(2)}
                                </p>
                                <span className="text-xl text-gray-500">/</span>
                                <p className="text-xl font-bold">
                                    IDR {totalAmountIDR.toLocaleString()}
                                </p>
                            </div>

                            {/* Checkout Form */}
                            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                                {/* Shipping Info */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-800">
                                            Full Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full p-3 border border-gray-300 rounded-md"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-800">
                                            Full Address <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full p-3 border border-gray-300 rounded-md"
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
                                            className="w-full p-3 border border-gray-300 rounded-md"
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
                                            className="w-full p-3 border border-gray-300 rounded-md"
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
                                            className="w-full p-3 border border-gray-300 rounded-md"
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
                                        {/* Payment Proof */}
                                        <label className="block text-sm font-semibold text-gray-800">
                                            Proof of Payment <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="file"
                                            className="w-full p-3 border border-gray-300 rounded-md"
                                            onChange={(e) => setPaymentProof(e.target.files[0])}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Terms & Conditions */}
                                <div className="mt-4 flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={termsAccepted}
                                        onChange={() => setTermsAccepted(!termsAccepted)}
                                        className="mr-2"
                                        required
                                    />
                                    <span>I have read and accept the</span>
                                    <Link
                                        to="/terms"
                                        target="_blank"
                                        className="text-blue-600 underline ml-1"
                                    >
                                        Terms and Conditions
                                    </Link>
                                    <span className="text-red-500 ml-1">*</span>
                                </div>

                                {/* Checkout Button */}
                                <button
                                    type="submit"
                                    className="button-text font-semibold text-lg inline-flex items-center justify-center w-full mt-6 py-2"
                                >
                                    Checkout <FaArrowRight className="ml-2 text-lg" />
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
};

export default CheckoutPage;
