import React, { useState } from 'react';
import { FaArrowRight } from 'react-icons/fa';

const Services = () => {
    // State to manage modal visibility and selected service
    const [showModal, setShowModal] = useState(false);
    const [selectedService, setSelectedService] = useState('');
    const [weight, setWeight] = useState(0);
    const [price, setPrice] = useState(0);
    const [shipmentDate, setShipmentDate] = useState('');

    // Calculate the shipping cost based on the weight
    const calculateShippingCost = (weight) => {
        if (weight <= 2) return 7.19; // DHL 2kg
        if (weight >= 3 && weight <= 5) return 8.69; // DHL 5kg
        if (weight >= 6 && weight <= 10) return 11.49; // DHL 10kg
        if (weight >= 10 && weight <= 20) return 19.99; // DHL 20kg
        return 0; // Default for invalid weight
    };

    const handleServiceSelect = (service) => {
        setSelectedService(service);
        setShowModal(true); // Show the modal when a service is selected
    };

    const handleWeightChange = (e) => {
        const inputWeight = parseInt(e.target.value, 10);
        setWeight(inputWeight);
        setPrice(calculateShippingCost(inputWeight)); // Update shipping cost dynamically
    };

    const handleDateChange = (e) => {
        setShipmentDate(e.target.value);
    };

    return (
        <section id="services" className="py-16 bg-white">
            {/* Service Cards on Homepage */}
            <div className="max-w-screen-xl mx-auto px-4 text-center">
                <h2 className="text-3xl font-semibold mb-8">Our Services</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
                    <div
                        onClick={() => handleServiceSelect('Indonesia to Germany')}
                        className="p-6 bg-blue-800 text-white rounded-lg shadow-lg cursor-pointer min-h-[350px] flex flex-col justify-between relative overflow-hidden transform transition-all duration-300 hover:scale-105 group"
                        style={{
                            backgroundImage: "url('/indo-to-german.png')",
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    >
                        {/* Overlay (visible only on hover) */}
                        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>

                        {/* Text in center (visible only on hover) */}
                        <div className="flex flex-col justify-center items-center absolute inset-0 text-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <h3 className="text-2xl font-bold">INDONESIA - GERMANY</h3>
                            <p className="mt-4 text-lg">Shipping from Indonesia to Germany.</p>
                        </div>
                    </div>

                    <div
                        onClick={() => handleServiceSelect('Germany to Indonesia')}
                        className="p-6 bg-blue-800 text-white rounded-lg shadow-lg cursor-pointer min-h-[350px] flex flex-col justify-between relative overflow-hidden transform transition-all duration-300 hover:scale-105 group"
                        style={{
                            backgroundImage: "url('/german-to-indo.png')",
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    >
                        {/* Overlay (visible only on hover) */}
                        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>

                        {/* Text in center (visible only on hover) */}
                        <div className="flex flex-col justify-center items-center absolute inset-0 text-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <h3 className="text-2xl font-bold">GERMANY - INDONESIA</h3>
                            <p className="mt-4 text-lg">Shipping from Germany to Indonesia.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Service Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-lg w-96 text-center">
                        <h3 className="text-2xl font-semibold mb-4">{selectedService}</h3>

                        {/* Weight and Shipping Cost */}
                        <div className="mt-4">
                            <input
                                type="number"
                                placeholder="Enter weight (kg)"
                                value={weight}
                                onChange={handleWeightChange}
                                className="w-48 p-3 border border-gray-300 rounded-md mb-4"
                                min="1"
                            />
                            <p className="text-lg mt-4">Estimated Shipping Cost: €{price.toFixed(2)}</p>
                        </div>

                        {/* Shipment Date */}
                        <div className="mt-4">
                            <label className="text-lg" htmlFor="shipment-date">Select Shipment Date</label>
                            <input
                                type="date"
                                id="shipment-date"
                                value={shipmentDate}
                                onChange={handleDateChange}
                                className="w-48 p-3 border border-gray-300 rounded-md mb-4"
                            />
                        </div>

                        {/* Close Modal Button */}
                        <button
                            className="mt-6 bg-blue-800 text-white py-3 px-8 rounded-full shadow-lg"
                            onClick={() => setShowModal(false)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
};

export default Services;
