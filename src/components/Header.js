import React from 'react';
import { FaPhoneAlt, FaEnvelope } from 'react-icons/fa';

const Header = () => {
    return (
        <header className="bg-gray-800 text-white py-4">
            <div className="max-w-screen-xl mx-auto flex justify-between items-center px-4">
                <div className="text-2xl font-bold">Dion Transport</div>
                <nav className="flex space-x-6">
                    <a href="/" className="hover:text-gray-400">Home</a>
                    <a href="/about" className="hover:text-gray-400">About</a>
                    <a href="/catalog" className="hover:text-gray-400">Catalog</a>
                    <a href="/contact" className="hover:text-gray-400">Contact</a>
                    <a href="/terms" className="hover:text-gray-400">T&C</a>
                </nav>
                <div className="flex space-x-4">
                    <FaPhoneAlt />
                    <FaEnvelope />
                </div>
            </div>
        </header>
    );
};

export default Header;
