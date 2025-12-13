import React from 'react';
import {FaArrowRight} from "react-icons/fa";
import {Link} from "react-router-dom";

const WhyUs = () => {
    return (
        <section id="why-us" className="py-16 px-8 bg-white flex items-center">
            <div className="w-1/2">
                <img
                    src="/girl-dion-transport.png"
                    alt="Why Us"
                    className="w-full h-full object-cover rounded-lg shadow-lg"
                />
            </div>

            <div className="w-1/2 pl-8">
                <h2 className="text-2xl font-bold mb-6">DISTANCE IS NO <br/> LONGER A PROBLEM.</h2>
                <p className="text-lg mb-6">
                    Even though we are thousands of kilometers apart, the smile on your face is the most beautiful gift. We send this as a sign that distance is just a number. This gift may be delivered by courier, but the love that accompanies it is sent directly from our hearts. Distance is not a barrier for family.
                </p>
                <div className="flex justify-center sm:justify-start">
                    <Link
                        to="/catalog"
                        className="button-text"
                    >
                        Ship Now
                        <FaArrowRight className="ml-2 text-l" />
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default WhyUs;
