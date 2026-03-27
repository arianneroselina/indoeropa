import React from "react";

const ContactPage = () => {
  return (
    <section id="contact" className="py-24 bg-gray-100">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-semibold text-gray-800">Contact Us</h2>
          <p className="subtext text-lg text-gray-600 mt-2 max-w-2xl mx-auto">
            Discuss your shipping needs or ask any questions. We are here to
            help.
          </p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-6">
                Get in touch with us.
              </h3>

              <p className="subtext text-gray-600 mb-4">
                <strong>Email:</strong>{" "}
                <a
                  href="mailto:diontransport@hotmail.com"
                  className="hover:underline"
                >
                  diontransport@hotmail.com
                </a>
              </p>

              <p className="subtext text-gray-600 mb-4">
                <strong>Phone:</strong>{" "}
                <a href="tel:+491754513280" className="hover:underline">
                  +49 175 4513280
                </a>
              </p>

              <p className="subtext text-gray-600 mb-4">
                <strong>Instagram:</strong>{" "}
                <a
                  href="https://www.instagram.com/indoeropa_com"
                  className="hover:underline"
                >
                  @indoeropa_com
                </a>
              </p>

              <p className="subtext text-gray-600 mb-4">
                <strong>Address:</strong>{" "}
                <a
                  href="https://maps.app.goo.gl/2js6zWanRJiVcKCE7"
                  className="hover:underline"
                >
                  Jl. Utama 2 No.14-15 Komp. Perumahan Dasana Indah, Bojong
                  Nangka, Kecamatan Kelapa Dua, Kabupaten Tangerang, Banten
                  15810
                </a>
              </p>
            </div>

            <div className="w-full">
              <iframe
                title="INDO EROPA Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.064155817739!2d106.60179149999999!3d-6.2552786!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69fd0fa4cbcbc3%3A0x6b0ad38449bc58ca!2sINDOEROPA%20DionTransport!5e0!3m2!1sen!2sid!4v1766055699386!5m2!1sen!2sid"
                width="100%"
                height="300"
                style={{ border: "0" }}
                allowFullScreen=""
                loading="lazy"
                className="rounded-lg"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactPage;
