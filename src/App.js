import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import ShipmentPage from "./pages/ShipmentPage";
import AboutPage from "./pages/AboutPage";
import ScrollToTop from "./utils/scrollToTop";
import ContactPage from "./pages/ContactPage";
import TermsConditionsPage from "./pages/TermsConditionsPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import InvoiceUploadsPage from "./pages/InvoiceUploadsPage";

const App = () => {
    return (
        <Router>
            <ScrollToTop />
            <div className="min-h-screen flex flex-col">
                <Header />

                <main className="flex-1">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/shipment" element={<ShipmentPage />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/contact" element={<ContactPage />} />
                        <Route path="/terms" element={<TermsConditionsPage />} />
                        <Route path="/cart" element={<CartPage />} />
                        <Route path="/invoices" element={<InvoiceUploadsPage />} />
                        <Route path="/checkout" element={<CheckoutPage />} />
                    </Routes>
                </main>

                <Footer />
            </div>
        </Router>
    );
};

export default App;
