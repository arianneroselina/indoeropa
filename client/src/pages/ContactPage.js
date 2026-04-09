import React, { useState } from "react";
import { sendContactMessage } from "../api/contactApi";
import { FaArrowRight } from "react-icons/fa";

const ContactPage = () => {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		phone: "",
		subject: "",
		message: "",
	});

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitSuccess, setSubmitSuccess] = useState(false);
	const [submitError, setSubmitError] = useState("");

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			setIsSubmitting(true);
			setSubmitSuccess(false);
			setSubmitError("");

			await sendContactMessage(formData);

			setSubmitSuccess(true);
			setFormData({
				name: "",
				email: "",
				phone: "",
				subject: "",
				message: "",
			});
		} catch (err) {
			console.error(err);
			setSubmitError(err.message || "Failed to send message.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<section id="contact" className="py-24 bg-gray-100">
			<div className="max-w-screen-xl mx-auto px-4">
				<div className="text-center mb-12">
					<h2 className="text-4xl font-semibold text-gray-800">
						Contact Us
					</h2>
					<p className="subtext text-lg text-gray-600 mt-2 max-w-2xl mx-auto">
						Discuss your shipping needs or ask any questions. We are
						here to help.
					</p>
				</div>

				<div className="bg-white p-6 md:p-8 rounded-xl shadow-lg">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
						<div>
							<h3 className="text-2xl font-semibold text-gray-800 mb-2">
								Send us a message
							</h3>
							<p className="subtext text-gray-600 mb-6">
								Fill out the form below and we’ll get back to
								you as soon as possible.
							</p>

							<form onSubmit={handleSubmit} className="space-y-5">
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div>
										<label
											htmlFor="name"
											className="block text-sm font-medium text-gray-700 mb-1"
										>
											Name
										</label>
										<input
											id="name"
											name="name"
											type="text"
											value={formData.name}
											onChange={handleChange}
											required
											className="subtext w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-900"
										/>
									</div>

									<div>
										<label
											htmlFor="phone"
											className="block text-sm font-medium text-gray-700 mb-1"
										>
											Phone
										</label>
										<input
											id="phone"
											name="phone"
											type="text"
											value={formData.phone}
											onChange={handleChange}
											className="subtext w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-900"
										/>
									</div>
								</div>

								<div>
									<label
										htmlFor="email"
										className="block text-sm font-medium text-gray-700 mb-1"
									>
										Email
									</label>
									<input
										id="email"
										name="email"
										type="email"
										value={formData.email}
										onChange={handleChange}
										required
										className="subtext w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-900"
									/>
								</div>

								<div>
									<label
										htmlFor="subject"
										className="block text-sm font-medium text-gray-700 mb-1"
									>
										Subject
									</label>
									<input
										id="subject"
										name="subject"
										type="text"
										value={formData.subject}
										onChange={handleChange}
										required
										className="subtext w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-900"
									/>
								</div>

								<div>
									<label
										htmlFor="message"
										className="block text-sm font-medium text-gray-700 mb-1"
									>
										Message
									</label>
									<textarea
										id="message"
										name="message"
										rows="6"
										value={formData.message}
										onChange={handleChange}
										required
										className="subtext w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-900 resize-none"
									/>
								</div>

								{submitSuccess && (
									<div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
										Your message has been sent successfully.
									</div>
								)}

								{submitError && (
									<div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
										{submitError}
									</div>
								)}

								<button
									type="submit"
									disabled={isSubmitting}
									className="button-primary font-semibold"
								>
									{isSubmitting
										? "Sending..."
										: "Send Message"}
								</button>
							</form>
						</div>

						<div className="w-full">
							<h3 className="text-2xl font-semibold text-gray-800 mb-2">
								Contact information
							</h3>

							<div className="space-y-4 mb-6">
								<p className="subtext text-gray-600">
									<strong className="text-gray-800">
										Email:
									</strong>{" "}
									<a
										href="mailto:diontransport@hotmail.com"
										className="hover:underline"
									>
										diontransport@hotmail.com
									</a>
								</p>

								<p className="subtext text-gray-600">
									<strong className="text-gray-800">
										Phone:
									</strong>{" "}
									<a
										href="tel:+491754513280"
										className="hover:underline"
									>
										+49 175 4513280
									</a>
								</p>

								<p className="subtext text-gray-600">
									<strong className="text-gray-800">
										Instagram:
									</strong>{" "}
									<a
										href="https://www.instagram.com/indoeropa_com"
										className="hover:underline"
										target="_blank"
										rel="noreferrer"
									>
										@indoeropa_com
									</a>
								</p>

								<p className="subtext text-gray-600">
									<strong className="text-gray-800">
										Address:
									</strong>{" "}
									<a
										href="https://maps.app.goo.gl/2js6zWanRJiVcKCE7"
										className="hover:underline"
										target="_blank"
										rel="noreferrer"
									>
										Jl. Utama 2 No.14-15 Komp. Perumahan
										Dasana Indah, Bojong Nangka, Kecamatan
										Kelapa Dua, Kabupaten Tangerang, Banten
										15810
									</a>
								</p>
							</div>

							<iframe
								title="INDO EROPA Location"
								src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.064155817739!2d106.60179149999999!3d-6.2552786!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69fd0fa4cbcbc3%3A0x6b0ad38449bc58ca!2sINDOEROPA%20DionTransport!5e0!3m2!1sen!2sid!4v1766055699386!5m2!1sen!2sid"
								width="100%"
								height="320"
								style={{ border: "0" }}
								allowFullScreen=""
								loading="lazy"
								className="rounded-xl shadow-sm"
							></iframe>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default ContactPage;
