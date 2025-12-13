import React from "react";
import { FaShoppingCart } from "react-icons/fa";
import { Link } from "react-router-dom";

const Header = () => {
    return (
        <header className="bg-gray-800 text-white py-4">
            <div className="max-w-screen-xl mx-auto flex items-center justify-between px-4">
                {/* Left: Logo + Menu */}
                <div className="flex items-center gap-8">
                    {/* Logo */}
                    <a href="/" className="flex items-center">
                        <img
                            src="/logo.png"
                            alt="Dion Transport"
                            className="h-9 w-auto"
                        />
                    </a>

                    {/* Menu */}
                    <nav className="hidden md:flex items-center space-x-6">
                        <a href="/" className="text-sm hover:text-gray-400">HOME</a>
                        <a href="/about" className="text-sm hover:text-gray-400">ABOUT</a>
                        <a href="/catalog" className="text-sm hover:text-gray-400">CATALOG</a>
                        <a href="/contact" className="text-sm hover:text-gray-400">CONTACT</a>
                        <a href="/terms" className="text-sm hover:text-gray-400">T&amp;C</a>
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
