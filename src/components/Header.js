import React from "react";
import { FaShoppingCart } from "react-icons/fa";
import { Link } from "react-router-dom";

const Header = () => {
    return (
        <header className="bg-primary text-white py-2">
            <div className="max-w-screen-xl mx-auto flex items-center justify-between px-4">
                {/* Left: Logo + Menu */}
                <div className="flex items-center gap-12">
                    {/* Logo */}
                    <a href="/" className="flex items-center">
                        <img
                            src="/logo.png"
                            alt="INDO EROPA"
                            className="h-24 w-auto"
                        />
                    </a>

                    {/* Menu */}
                    <nav className="hidden md:flex items-center space-x-8">
                        <a href="/" className="text-lg hover:text-gray-400">HOME</a>
                        <a href="/about" className="text-lg hover:text-gray-400">ABOUT</a>
                        <a href="/shipment" className="text-lg hover:text-gray-400">SHIPMENT</a>
                        <a href="/contact" className="text-lg hover:text-gray-400">CONTACT</a>
                        <a href="/terms" className="text-lg hover:text-gray-400">T&amp;C</a>
                    </nav>
                </div>

                {/* Right: Cart Button */}
                <div className="flex items-center space-x-4 text-lg">
                    <Link to="/cart" className="hover:text-gray-400" aria-label="Go to Cart">
                        <FaShoppingCart />
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default Header;
