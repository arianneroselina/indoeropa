import React from 'react';
import { Link } from 'react-router-dom';
import {FaArrowRight} from "react-icons/fa";

const About = () => {
    return (
        <section className="bg-gray-100 py-24">
            <div className="max-w-screen-xl mx-auto px-4">
                <h2 className="text-4xl font-semibold text-gray-800 mb-12 text-center">
                    About <span className="text-red-800">Dion Transport</span>
                </h2>

                <div className="flex flex-col-reverse md:flex-row justify-between items-center gap-8">
                    <div className="w-full md:w-1/2 text-center md:text-left">
                        <p className="text-lg text-gray-600 mb-6">
                            <strong className="text-red-800">Dion Transport</strong> is the largest hand-carry luggage delivery service provider in Europe,
                            based in <strong>Germany</strong> and <strong>Indonesia</strong>. We ensure that your goods are delivered safely, quickly, and professionally.
                        </p>

                        <p className="text-lg text-gray-600 mb-6">
                            We are the solution for those who want to ship to Indonesia without worrying about being scammed by unprofessional luggage sellers.
                            With clear <span className="font-bold">Standard Operating Procedures (SOPs)</span> and rules, we help protect you from irresponsible sellers.
                        </p>

                        <p className="text-lg text-gray-600 mb-6 subtext">
                            PS: Your items are transported directly by our team, <span className="font-bold text-red-800">without being entrusted to other services</span>.
                        </p>

                        <Link
                            to="/about"
                            className="button-text"
                        >
                            Discover More
                            <FaArrowRight className="ml-2 text-sm" />
                        </Link>
                    </div>

                    <div className="w-full md:w-1/2">
                        <img
                            src="/shipping.jpg"
                            alt="Dion Transport Service"
                            className="w-full rounded-lg shadow-lg"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;
