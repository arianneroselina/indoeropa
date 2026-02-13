import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import { CART_KEY } from "../utils/shipmentHelper";
import { ShipmentMeta } from "../components/shipping/ShipmentMeta";
import { getRelevantDutyItems } from "../utils/dutyHelper";

const INVOICES_KEY = "checkout_invoices_v1";

const InvoiceUploadsPage = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);

    // { [itemKey]: { over125: string, proofDataUrl?: string, proofName?: string } }
    const [invoiceByItem, setInvoiceByItem] = useState({});

    useEffect(() => {
        const savedCartItems = localStorage.getItem(CART_KEY);
        if (savedCartItems) setCartItems(JSON.parse(savedCartItems));

        const savedInvoices = localStorage.getItem(INVOICES_KEY);
        if (savedInvoices) setInvoiceByItem(JSON.parse(savedInvoices));
    }, []);

    const relevant = useMemo(() => {
        return getRelevantDutyItems(cartItems);
    }, [cartItems]);

    // If no relevant items, skip page
    useEffect(() => {
        if (cartItems.length > 0 && relevant.length === 0) {
            navigate("/checkout", { replace: true });
        }
    }, [cartItems.length, relevant.length, navigate]);

    const setOver125 = (key, over125) => {
        setInvoiceByItem((prev) => {
            const next = {
                ...prev,
                [key]: {
                    over125,
                    proofDataUrl: over125 === "yes" ? (prev[key]?.proofDataUrl ?? "") : "",
                    proofName: over125 === "yes" ? (prev[key]?.proofName ?? "") : "",
                },
            };
            localStorage.setItem(INVOICES_KEY, JSON.stringify(next));
            return next;
        });
    };

    const setProofFile = async (key, file) => {
        // TODO: Store as DataURL for now (works, but keep files small).
        // For production, upload to your backend or storage instead.
        const toDataUrl = (f) =>
            new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(String(reader.result || ""));
                reader.onerror = reject;
                reader.readAsDataURL(f);
            });

        const dataUrl = file ? await toDataUrl(file) : "";

        setInvoiceByItem((prev) => {
            const next = {
                ...prev,
                [key]: {
                    ...(prev[key] ?? { over125: "" }),
                    proofDataUrl: dataUrl,
                    proofName: file?.name ?? "",
                },
            };
            localStorage.setItem(INVOICES_KEY, JSON.stringify(next));
            return next;
        });
    };

    const isInvoiceComplete = relevant.every(({ key }) => {
        const entry = invoiceByItem[key];

        // must  have a selection
        if (!entry) return false;
        // if over125 → proof must exist
        if (entry.over125 === "yes" && !entry.proofDataUrl) return false;

        return true;
    });

    const handleContinue = (e) => {
        e.preventDefault();

        for (const { key } of relevant) {
            const entry = invoiceByItem[key];
            if (entry?.over125 === "yes" && !entry?.proofDataUrl) {
                alert("Please upload an invoice/receipt for every shipment marked as over €125.");
                return;
            }
        }

        navigate("/checkout");
    };

    return (
        <section className="py-24 bg-gray-100">
            <div className="max-w-screen-xl mx-auto px-4">
                <div className="flex justify-between items-center mb-6">
                    <Link to="/cart" className="text-primary flex items-center gap-2">
                        <FaArrowRight className="transform rotate-180" />
                        <span>Back to Cart</span>
                    </Link>
                    <h2 className="text-4xl font-semibold text-center">Invoices Upload</h2>
                </div>

                <div className="bg-white p-8 rounded-lg shadow-md">
                    <p className="subtext text-sm text-gray-600 mb-6">
                        For items below with an original value <span className="font-semibold">above €125</span>,
                        please upload the invoice or receipt.
                    </p>

                    <form onSubmit={handleContinue} className="space-y-6">
                        <div className="space-y-4">
                            {relevant.map(({ item, idx, key }) => {
                                const entry = invoiceByItem[key] ?? { over125: "", proofDataUrl: "", proofName: "" };

                                return (
                                    <div key={key} className="rounded-2xl border bg-gray-50/60 p-5">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start justify-between gap-4">
                                                <ShipmentMeta
                                                    item={item}
                                                    idx={idx}
                                                    showIndex={true}
                                                    showPickupChip={false}
                                                    showDetailChip={false}
                                                    compact={true}
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-800">
                                                    Original item value over €125? <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    className="subtext w-full p-3 border border-gray-300 rounded-xl"
                                                    value={entry.over125 }
                                                    onChange={(e) => setOver125(key, e.target.value)}
                                                >
                                                    <option value="">Select option</option>
                                                    <option value="no">No</option>
                                                    <option value="yes">Yes</option>
                                                </select>
                                            </div>

                                            <div className={entry.over125 === "yes" ? "" : "opacity-50 pointer-events-none"}>
                                                <label className="block text-sm font-semibold text-gray-800">
                                                    Upload invoice/receipt {entry.over125 === "yes" && <span className="text-red-500">*</span>}
                                                </label>
                                                <input
                                                    type="file"
                                                    className="subtext w-full p-3 border border-gray-300 rounded-xl"
                                                    onChange={(e) => setProofFile(key, e.target.files?.[0] ?? null)}
                                                    required={entry.over125 === "yes"}
                                                />
                                                {entry.proofName ? (
                                                    <p className="subtext text-xs text-gray-500 mt-1">
                                                        Selected: <span className="font-semibold text-gray-700">{entry.proofName}</span>
                                                    </p>
                                                ) : null}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex items-center justify-end gap-3">
                            <Link to="/cart" className="button-secondary">
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={!isInvoiceComplete}
                                className={[
                                    "button-primary font-semibold",
                                    isInvoiceComplete
                                        ? "bg-secondary hover:bg-secondary-900 text-white"
                                        : "bg-gray-200 text-gray-500 hover:bg-gray-200 cursor-not-allowed",
                                ].join(" ")}
                            >
                                Continue to Checkout <FaArrowRight className="ml-2 text-lg" />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default InvoiceUploadsPage;
