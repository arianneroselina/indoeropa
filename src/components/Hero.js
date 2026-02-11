import React from "react";
import { FaArrowRight } from "react-icons/fa";

const Hero = () => {
    return (
        <section
            className="relative bg-cover bg-center h-[80vh] text-white flex"
            style={{ backgroundImage: "url('/shipping-service-bg.png')" }}
        >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/60"></div>

            {/* Content */}
            <div className="relative z-10 w-full max-w-screen-xl px-6 mx-auto flex items-center">
                <div className="w-full pt-16 sm:pt-20 md:pt-24 space-y-4 text-left">
                    {/* Slogan */}
                    <div className="text-2xl sm:text-3xl md:text-4xl text-white space-y-1 sm:space-y-2">
                        <p>PAY.</p>
                        <p>DROP YOUR</p>
                        <p>PACKAGE.</p>
                        <p>RECEIVE.</p>
                    </div>

                    {/* Smaller description */}
                    <p className="subtext text-white/95 max-w-3xl">
                        We make everything easy and transparent
                    </p>

                    {/* Shop Button */}
                    <div className="flex justify-center sm:justify-start">
                        <a
                            href="/src/components/Shipment"
                            className="button-text"
                        >
                            Shop All
                            <FaArrowRight className="ml-2 text-sm" />
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
