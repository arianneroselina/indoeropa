import React, { useState } from 'react';

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
    };

    return (
        <section id="contact" className="py-24 bg-gray-100">
            <div className="max-w-screen-xl mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-semibold text-gray-800">
                        Contact Us
                    </h2>
                    <p className="subtext text-lg text-gray-600 mt-2 max-w-2xl mx-auto">
                        Get in touch with us to discuss your shipping needs, or if you have any questions or inquiries. We are here to help!
                    </p>
                </div>

                {/* Contact Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-lg shadow-lg">
                        <h3 className="text-2xl font-semibold text-gray-800 mb-6">Get In Touch</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label htmlFor="name" className="block text-gray-700 font-semibold mb-2">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="phone" className="block text-gray-700 font-semibold mb-2">
                                    Phone (Optional)
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="message" className="block text-gray-700 font-semibold mb-2">
                                    Message
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows="5"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                                ></textarea>
                            </div>

                            <div className="text-center">
                                <button
                                    type="submit"
                                    className="button-text font-semibold"
                                >
                                    Send Message
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Contact Information */}
                    <div className="bg-white p-8 rounded-lg shadow-lg">
                        <h3 className="text-2xl font-semibold text-gray-800 mb-6">Contact Information</h3>
                        <p className="subtext text-gray-600 mb-4">
                            <strong>Address:</strong> Jl. Utama 2 No.14-15 Komp. Perumahan Dasana Indah, Bojong Nangka, Kecamatan Kelapa Dua, Kabupaten Tangerang, Banten 15810
                        </p>
                        <p className="subtext text-gray-600 mb-4">
                            <strong>Email:</strong> <a href="mailto:info@diontransport.com">info@diontransport.com</a>
                        </p>
                        <p className="subtext text-gray-600 mb-4">
                            <strong>Phone:</strong> <a href="tel:+491754513280">+49 175 4513280</a>
                        </p>

                        {/* Embedded Google Map */}
                        <div className="mt-6">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.064155817739!2d106.60179149999999!3d-6.2552786!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69fd0fa4cbcbc3%3A0x6b0ad38449bc58ca!2sINDOEROPA%20DionTransport!5e0!3m2!1sen!2sid!4v1766055699386!5m2!1sen!2sid"
                                width="100%"
                                height="300"
                                style={{ border: "0" }}
                                allowFullScreen=""
                                loading="lazy"
                                title="Dion Transport Location"
                            ></iframe>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ContactPage;
