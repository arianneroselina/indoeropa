import React from "react";
import {FaArrowRight, FaCheckCircle} from "react-icons/fa";

const AboutUsPage = () => {
    return (
        <section id="about-us" className="bg-gray-100 py-16">
            <div className="max-w-screen-xl mx-auto px-4">
                <div className="text-center mb-12 animate__animated animate__fadeIn animate__delay-1s">
                    <h2 className="text-4xl font-bold text-gray-800">About Dion Transport</h2>
                    <p className="subtext mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                        Dion Transport – The largest hand-carry luggage delivery service provider in Europe, based in Germany and Indonesia. We ensure that your goods are delivered safely, quickly, and professionally.
                    </p>
                </div>

                <div className="flex justify-between items-center pt-16 mb-16 animate__animated animate__fadeIn animate__delay-2s">
                    <div className="w-full md:w-1/2">
                        <h3 className="text-3xl font-semibold text-gray-800">Your Trusted Shipping Partner</h3>
                        <p className="subtext mt-4 mr-4 text-lg text-gray-600">
                            We offer the most reliable luggage shipping service. Your items are delivered directly by our trusted team, ensuring that they arrive safely and on time.
                        </p>
                        <a
                            href="/catalog"
                            className="button-text mt-6 font-semibold"
                        >
                            Explore Our Catalog
                            <FaArrowRight className="ml-2 text-sm" />
                        </a>
                    </div>
                    <div className="w-full md:w-1/2">
                        <video
                            className="w-full rounded-lg shadow-lg"
                            controls
                            autoPlay
                            loop
                            muted
                        >
                            <source src="/shipping.mp4" type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    </div>
                </div>

                <div className="text-center pt-16 mb-16">
                    <h3 className="text-3xl font-semibold text-gray-800 mb-6">Why Choose Us?</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-lg shadow-lg hover:scale-105 transform transition-all duration-300">
                            <FaCheckCircle className="text-red-800 text-3xl mb-4" />
                            <h4 className="text-xl font-semibold text-gray-800 mb-3">Professional & Experienced</h4>
                            <p className="text-gray-600">
                                We handle more than 50 flights every year, ensuring that every item is shipped safely and efficiently with clear SOPs.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-lg shadow-lg hover:scale-105 transform transition-all duration-300">
                            <FaCheckCircle className="text-red-800 text-3xl mb-4" />
                            <h4 className="text-xl font-semibold text-gray-800 mb-3">Safe & Secure Packing</h4>
                            <p className="text-gray-600">
                                Your items are packed with care using our secure packing SOPs to ensure they are safely delivered without any issues.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-lg shadow-lg hover:scale-105 transform transition-all duration-300">
                            <FaCheckCircle className="text-red-800 text-3xl mb-4" />
                            <h4 className="text-xl font-semibold text-gray-800 mb-3">Trusted Flight Crew</h4>
                            <p className="text-gray-600">
                                Our trusted flight crew, consisting of students and Ausbildung participants, transports your luggage directly.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-red-800 text-white py-16 px-4 mb-16 rounded-lg shadow-xl">
                    <h3 className="text-3xl font-semibold text-center">Our Mission</h3>
                    <p className="mt-6 text-lg text-center max-w-2xl mx-auto">
                        Dion Transport is committed to providing the most reliable, secure, and efficient luggage shipping solutions. We are here to give you peace of mind while shipping your precious items across the world. ✈️📦
                    </p>
                </div>

                <div className="text-center pt-16">
                    <h3 className="text-3xl font-semibold text-gray-800 mb-4">Ready to Ship?</h3>
                    <p className="subtext text-lg text-gray-600 mb-6">Trust us with your belongings and enjoy a seamless shipping experience.</p>
                    <a
                        href="/catalog"
                        className="button-text font-semibold text-lg"
                    >
                        Get Started
                    </a>
                </div>
            </div>
        </section>
    );
};

export default AboutUsPage;
