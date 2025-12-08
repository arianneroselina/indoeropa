import React, { useState } from 'react';
import { FaArrowRight } from 'react-icons/fa';

const CheckoutForm = () => {
    // States for form data
    const [weight, setWeight] = useState(0);
    const [address, setAddress] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [paymentProof, setPaymentProof] = useState(null);
    const [totalAmountEUR, setTotalAmountEUR] = useState(0);
    const [totalAmountIDR, setTotalAmountIDR] = useState(0);
    const [termsAccepted, setTermsAccepted] = useState(false);

    // Shipping cost calculation based on weight
    const calculateShipping = (weight) => {
        if (weight <= 2) return 7.19; // DHL 2kg
        if (weight >= 3 && weight <= 5) return 8.69; // DHL 5kg
        if (weight >= 6 && weight <= 10) return 11.49; // DHL 10kg
        if (weight >= 10 && weight <= 20) return 19.99; // DHL 20kg
        return 0; // Default for invalid weight
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        // Calculate the shipping cost
        const shippingCost = calculateShipping(weight);

        // Calculate total amount in EUR and IDR
        const totalEUR = shippingCost; // Example: Just the shipping cost, extend with other charges if needed
        const totalIDR = totalEUR * 19600;

        // Update the state with the calculated values
        setTotalAmountEUR(totalEUR);
        setTotalAmountIDR(totalIDR);

        // Simulate sending data to Notion and sending an email (implement actual API calls here)
        alert("Checkout successful! Email sent and data connected to Notion.");
    };

    return (
        <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-3xl font-bold mb-6">Checkout Form</h2>
            <form onSubmit={handleSubmit}>
                {/* User Information */}
                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder="Address"
                        className="w-full p-3 border border-gray-300 rounded-md"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full p-3 border border-gray-300 rounded-md"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="tel"
                        placeholder="Phone Number"
                        className="w-full p-3 border border-gray-300 rounded-md"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                    />
                    <input
                        type="number"
                        placeholder="Weight (kg)"
                        className="w-full p-3 border border-gray-300 rounded-md"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        required
                    />
                </div>

                {/* Payment Method */}
                <div className="space-y-4 mt-6">
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

                    {/* Proof of Payment */}
                    <input
                        type="file"
                        className="w-full p-3 border border-gray-300 rounded-md"
                        onChange={(e) => setPaymentProof(e.target.files[0])}
                        required
                    />
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
                    <span>I accept the</span>
                    <a
                        href="https://drive.google.com/file/d/your-link" // Replace with your Google Drive link
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline ml-1"
                    >
                        Terms and Conditions
                    </a>
                </div>

                {/* Total Price */}
                <div className="mt-6">
                    <p>Total Amount (EUR): €{totalAmountEUR}</p>
                    <p>Total Amount (IDR): Rp{totalAmountIDR}</p>
                </div>

                {/* Checkout Button */}
                <button
                    type="submit"
                    className="inline-flex items-center justify-center w-full mt-6 bg-blue-800 hover:bg-blue-900 text-white py-3 rounded-full shadow-lg transform transition-all duration-300 hover:scale-105"
                    disabled={!termsAccepted || !paymentProof}
                >
                    Checkout <FaArrowRight className="ml-2 text-l" />
                </button>
            </form>
        </div>
    );
};

export default CheckoutForm;
