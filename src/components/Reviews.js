import React from 'react';

const Review = () => {
    return (
        <section className="py-24 bg-white">
            <div className="max-w-screen-xl mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-semibold text-gray-800 mb-4">What Our Customers Say</h2>
                </div>

                <div className="google-reviews">
                    <div className="relative w-full overflow-hidden rounded-xl shadow-lg">
                        <iframe
                            src="https://widgets.sociablekit.com/google-reviews/iframe/25634778"
                            frameBorder="0"
                            width="100%"
                            height="400px"
                            style={{
                                overflowX: 'auto',
                                overflowY: 'hidden',
                            }}
                        ></iframe>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Review;
