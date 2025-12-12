import React from "react";
import Hero from "../components/Hero";
import Reviews from "../components/Reviews";
import About from "../components/About";
import Catalog from "../components/Catalog";
import WhyUs from "../components/WhyUs";
import Closing from "../components/Closing";
import CheckoutForm from "../components/CheckoutForm";

const HomePage = () => {
    return (
        <div>
            <Hero />
            <Reviews />
            <About />
            <Catalog />
            <WhyUs />
            <Closing />
            <CheckoutForm />
        </div>
    );
};

export default HomePage;
