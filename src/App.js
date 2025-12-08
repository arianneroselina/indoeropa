import React from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Reviews from "./components/Reviews";
import About from "./components/About";
import Services from "./components/Services";
import WhyUs from "./components/WhyUs";
import Closing from "./components/Closing";
import CheckoutForm from "./components/CheckoutForm";
import Footer from "./components/Footer";

const App = () => {
    return (
        <div>
            <Header />
            <Hero />
            <Reviews />
            <About />
            <Services />
            <WhyUs />
            <Closing />
            <CheckoutForm />
            <Footer />
        </div>
    );
};

export default App;
