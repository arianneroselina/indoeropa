import React from 'react';
import { FaArrowRight } from 'react-icons/fa';

const Hero = () => {
    return (
        <section
            className="relative bg-cover bg-center h-[60vh] text-white flex flex-col justify-end"
            style={{
                backgroundImage: "url('/shipping-service-bg.png')",
            }}
        >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black opacity-60"></div>

            {/* Content Wrapper */}
            <div className="relative z-10 max-w-screen-xl px-6 py-6 text-left space-y-8">
                {/* Side Texts */}
                <div className="space-y-4 sm:space-y-6">
                    {/* Slogan */}
                    <div className="text-3xl font-semibold text-white">
                        <p>PAY.</p>
                        <p>DROP YOUR PACKAGE.</p>
                        <p>RECEIVE.</p>
                    </div>

                    {/* Smaller description */}
                    <p className="text-l text-white mb-6 max-w-3xl sm:text-l">
                        We make everything easy and transparent
                    </p>

                    {/* Shop Button */}
                    <div className="flex justify-center sm:justify-start">
                        <a
                            href="#services"
                            className="inline-flex items-center bg-red-800 hover:bg-red-900 text-white font-semibold py-3 px-8 rounded-full shadow-lg transform transition-all duration-300 hover:scale-105"
                        >
                            Shop All
                            <FaArrowRight className="ml-2 text-l" />
                        </a>
                    </div>
                </div>
            </div>
        </section>

    );
};

export default Hero;
