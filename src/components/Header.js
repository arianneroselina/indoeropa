import React, { useState } from "react";
import { FaShoppingCart, FaBars, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="bg-primary text-white">
            <div className="mx-auto flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-12">
                {/* Logo */}
                <Link to="/" className="flex items-center">
                    <img
                        src="/logo.png"
                        alt="INDO EROPA"
                        className="h-16 md:h-22 w-auto"
                        />
                    </Link>

                    {/* Desktop Menu */}
                    <nav className="hidden md:flex items-center space-x-8 text-lg">
                        <Link to="/" className="hover:text-gray-400">HOME</Link>
                        <Link to="/about" className="hover:text-gray-400">ABOUT</Link>
                        <Link to="/shipment" className="hover:text-gray-400">SHIPMENT</Link>
                        <Link to="/contact" className="hover:text-gray-400">CONTACT</Link>
                        <Link to="/terms" className="hover:text-gray-400">T&amp;C</Link>
                    </nav>
                </div>

                {/* Right Side */}
                <div className="flex items-center gap-4 text-lg px-4">
                    <Link to="/cart" className="hover:text-gray-400">
                        <FaShoppingCart />
                    </Link>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-xl"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <FaTimes /> : <FaBars />}
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            {isOpen && (
                <div className="md:hidden bg-primary border-t border-white/20">
                    <nav className="flex flex-col px-4 py-3 space-y-3 text-lg">
                        <Link to="/" onClick={() => setIsOpen(false)}>HOME</Link>
                        <Link to="/about" onClick={() => setIsOpen(false)}>ABOUT</Link>
                        <Link to="/shipment" onClick={() => setIsOpen(false)}>SHIPMENT</Link>
                        <Link to="/contact" onClick={() => setIsOpen(false)}>CONTACT</Link>
                        <Link to="/terms" onClick={() => setIsOpen(false)}>T&amp;C</Link>
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Header;
