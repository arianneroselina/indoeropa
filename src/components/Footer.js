import React from "react";
import { FaFacebook, FaTwitter, FaLinkedin, FaWhatsapp, FaEnvelope } from "react-icons/fa";

const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white py-8">
            <div className="max-w-screen-xl mx-auto text-center">
                <div className="flex justify-center space-x-6 mt-4">
                    <a
                        // TODO
                        href="https://facebook.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-gray-400"
                        aria-label="Facebook"
                    >
                        <FaFacebook className="text-2xl" />
                    </a>
                    <a
                        // TODO
                        href="https://twitter.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-gray-400"
                        aria-label="Twitter"
                    >
                        <FaTwitter className="text-2xl" />
                    </a>
                    <a
                        // TODO
                        href="https://linkedin.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-gray-400"
                        aria-label="LinkedIn"
                    >
                        <FaLinkedin className="text-2xl" />
                    </a>
                    <a
                        href="https://wa.me/%2B491754513280/?text=Halo%20admin%20dion%2C%20saya%20mau%20pesan%20bagasi"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-gray-400"
                        aria-label="WhatsApp"
                    >
                        <FaWhatsapp className="text-2xl" />
                    </a>
                    <a
                        // TODO
                        href="mailto:info@diontransport.com"
                        className="hover:text-gray-400"
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
