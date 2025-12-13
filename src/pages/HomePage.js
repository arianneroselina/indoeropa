import React from "react";
import Hero from "../components/Hero";
import Reviews from "../components/Reviews";
import About from "../components/About";
import Catalog from "../components/Catalog";
import WhyUs from "../components/WhyUs";
import Closing from "../components/Closing";
import Contact from "../components/Contact";

const HomePage = () => {
    return (
        <div>
            <Hero />
            <Reviews />
            <About />
            <Catalog />
            <WhyUs />
            <Closing />
            <Contact />
        </div>
    );
};

export default HomePage;
