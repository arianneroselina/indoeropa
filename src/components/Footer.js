import React from "react";
import { FaWhatsapp, FaEnvelope } from "react-icons/fa6";

const Footer = () => {
    return (
        <footer className="bg-primary text-white py-8">
            <div className="max-w-screen-xl mx-auto text-center">
                <div className="flex justify-center space-x-6 mt-4">
                    <a
                        href="https://wa.me/%2B491754513280/?text=Halo%20admin%20INDO%20EROPA%2C%20saya%20mau%20pesan%20bagasi"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-gray-500"
                        aria-label="WhatsApp"
                    >
                        <FaWhatsapp className="text-2xl" />
                    </a>
                    <a
                        href="mailto:diontransport@hotmail.com"
                        className="hover:text-gray-500"
                        aria-label="Email"
                    >
                        <FaEnvelope className="text-2xl" />
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
