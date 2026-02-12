import React from 'react';
import { Link } from 'react-router-dom';

const Contact = () => {
    return (
        <section
            className="relative bg-cover bg-center bg-no-repeat py-36"
            style={{
                backgroundImage: "url('/boxes.jpg')",
            }}
        >
            <div className="absolute inset-0 bg-black opacity-50"></div>
            <div className="max-w-screen-xl mx-auto px-4 text-center relative z-10">
                <h2 className="text-4xl font-semibold text-white mb-12">
                    Have Any Questions?
                </h2>
                <p className="subtext text-lg text-white mb-8 max-w-3xl mx-auto">
                    We’re here to help! If you have any questions, need further information, or just want to discuss your shipping needs, feel free to reach out to us.
                </p>
                <p className="subtext text-lg text-white mb-8 max-w-3xl mx-auto">
                    At INDO EROPA, we're committed to providing you with the best and most reliable luggage shipping services. Our team is always ready to assist you with any inquiries.
                </p>
                <Link
                    to="/contact"
                    className="button-primary font-semibold"
                >
                    Contact Us
                </Link>
            </div>
        </section>
    );
};

export default Contact;
