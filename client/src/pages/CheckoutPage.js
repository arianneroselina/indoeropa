import React, {useEffect, useState} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';
import { CART_KEY, INVOICES_KEY } from "../utils/shipmentHelper";
import { ShipmentMeta } from "../components/shipping/ShipmentMeta";
import { hasDutyStep, getRelevantDutyItems } from "../utils/dutyHelper";
import { PAYMENT_STATUS_MAP } from "../utils/notionMapping";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:3001";

console.log("API_BASE:", process.env.REACT_APP_API_BASE_URL);

const CheckoutPage = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);

    const [fullName, setFullName] = useState('');
    const [address, setAddress] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    const [paymentMethod, setPaymentMethod] = useState('');
    const [paymentProof, setPaymentProof] = useState(null);

    const [termsAccepted, setTermsAccepted] = useState(false);

    const [invoiceByItem, setInvoiceByItem] = useState({});

    const [totalAmountEUR, setTotalAmountEUR] = useState(0);
    const [totalAmountIDR, setTotalAmountIDR] = useState(0);

    const [notes, setNotes] = useState("")

    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const savedCartItems = localStorage.getItem(CART_KEY);
        if (savedCartItems) setCartItems(JSON.parse(savedCartItems));

        const savedInvoices = localStorage.getItem(INVOICES_KEY);
        if (savedInvoices) setInvoiceByItem(JSON.parse(savedInvoices));

    }, []);

    const relevantDutyItems = React.useMemo(() => getRelevantDutyItems(cartItems), [cartItems]);

    // key -> customsFeePerUnitEUR
    const customsFeeByKey = React.useMemo(() => {
        const map = {};
        for (const { key } of relevantDutyItems) {
            const entry = invoiceByItem?.[key];
            if (entry?.over125 !== "yes") {
                map[key] = 0;
                continue;
            }

            const original = Number(entry.originalValueEur);
            map[key] = Number.isFinite(original) && original > 0 ? original * 0.025 : 0;
        }
        return map;
    }, [relevantDutyItems, invoiceByItem]);

    // Total customs fee
    const customsFeeEUR = React.useMemo(() => {
        return relevantDutyItems.reduce((sum, { key, item }) => {
            const qty = Number(item.quantity) || 1;
            return sum + (customsFeeByKey[key] || 0) * qty;
        }, 0);
    }, [relevantDutyItems, customsFeeByKey]);

    const backTo = hasDutyStep(cartItems) ? "/invoices" : "/cart";
    const backLabel = hasDutyStep(cartItems) ? "Back to Invoices" : "Back to Cart";

    // Recalculate the total amounts whenever cartItems change
    useEffect(() => {
        const transportEUR = cartItems.reduce((total, item) => {
            const price = Number(item.priceEur) || 0;
            const qty = Number(item.quantity) || 1;
            return total + price * qty;
        }, 0);

        const grandTotalEUR = transportEUR + customsFeeEUR;
        const totalIDR = grandTotalEUR * 19600;

        setTotalAmountEUR(grandTotalEUR);
        setTotalAmountIDR(totalIDR);
    }, [cartItems, customsFeeEUR]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (submitting) return;
        setSubmitting(true);

        try {
            const today = new Date().toISOString().slice(0, 10);
            const paymentStatus = PAYMENT_STATUS_MAP[paymentMethod] || "";

            // Pengiriman Lokal
            const resPL = await fetch(`${API_BASE}/api/notion/pengiriman-lokal`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fullName,
                    address,
                }),
            });

            const dataPL = await resPL.json().catch(() => ({}));
            console.log("Pengiriman Lokal response:", resPL.status, dataPL);
            if (!resPL.ok) {
                alert(dataPL?.message || dataPL?.error || "Failed to save Pengiriman Lokal.");
                return;
            }

            for (const item of cartItems) {
                const packageType = item.packageTypeLabel ?? "-";
                const qty = Number(item.quantity) || 1;
                const unitPriceEur = Number(item.priceEur) || 0;

                const dutyInfo = relevantDutyItems.find((r) => r.item === item);
                const key = dutyInfo?.key;

                const unitCustomsFeeEur = key ? (customsFeeByKey[key] || 0) : 0;
                const unitPriceWithCustomsEur = unitPriceEur + unitCustomsFeeEur;

                // Penerimaan Barang
                const resPB = await fetch(`${API_BASE}/api/notion/penerimaan-barang`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        fullName,
                        packageType,
                        qtyPerUnit: qty,
                        request: notes,
                    }),
                });

                const dataPB = await resPB.json().catch(() => ({}));
                console.log("Penerimaan Barang response:", resPB.status, dataPB);
                if (!resPB.ok) {
                    alert(dataPB?.message || dataPB?.error || "Failed to save Penerimaan Barang.");
                    return;
                }

                // Pembayaran
                const pembayaranFormData = new FormData();
                pembayaranFormData.append("fullName", fullName);
                pembayaranFormData.append("packageType", packageType);
                pembayaranFormData.append("pricePerUnitEur", unitPriceWithCustomsEur);
                pembayaranFormData.append("qtyPerUnit", qty);
                pembayaranFormData.append("paymentStatus", paymentStatus);
                pembayaranFormData.append("paymentDate", today);
                pembayaranFormData.append("paymentProof", paymentProof);

                const resPembayaran = await fetch(`${API_BASE}/api/notion/pembayaran`, {
                    method: "POST",
                    body: pembayaranFormData,
                });

                const dataPembayaran = await resPembayaran.json().catch(() => ({}));
                console.log("Pembayaran response:", resPembayaran.status, dataPembayaran);
                if (!resPembayaran.ok) {
                    alert(dataPembayaran?.message || dataPembayaran?.error || "Failed to save Pembayaran.");
                    return;
                }
            }

            localStorage.removeItem(CART_KEY);
            localStorage.removeItem(INVOICES_KEY);
            setCartItems([]);
            setInvoiceByItem({});

            navigate("/checkout/success", {
                state: {
                    fullName,
                    totalAmountEUR,
                    totalAmountIDR,
                    itemsCount: cartItems.length,
                    paidViaLabel: paymentMethod?.toUpperCase() || "",
                },
            });
        } catch (e) {
            console.error(e);
            alert("Checkout failed.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="py-24 bg-gray-100">
            <div className="max-w-screen-xl mx-auto px-4">
                {/* Back to Cart button */}
                <div className="flex justify-between items-center mb-6">
                    <Link to={backTo} className="text-primary flex items-center gap-2">
                        <FaArrowRight className="transform rotate-180" />
                        <span>{backLabel}</span>
                    </Link>
                    <h2 className="text-4xl font-semibold text-center">Checkout</h2>
                </div>

                <div className="bg-white p-8 rounded-lg shadow-md">
                    {cartItems.length === 0 ? (
                        <div className="text-center text-lg text-gray-600">
                            Your cart is empty.{" "}
                            <Link to="/shipment" className="text-secondary font-semibold">
                                Schedule a shipment
                            </Link>{" "}
                            to begin.
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
                                {/* LEFT: Checkout form */}
                                <div>
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {/* Shipping Info */}
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-800">
                                                    Full Name <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    className="subtext w-full p-3 border border-gray-300 rounded-xl input-focus"
                                                    value={fullName}
                                                    onChange={(e) => setFullName(e.target.value)}
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-800">
                                                    Full Pickup Address <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    className="subtext w-full p-3 border border-gray-300 rounded-xl input-focus"
                                                    value={address}
                                                    onChange={(e) => setAddress(e.target.value)}
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-800">
                                                    Email <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="email"
                                                    className="subtext w-full p-3 border border-gray-300 rounded-xl input-focus"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-800">
                                                    Phone Number <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="tel"
                                                    className="subtext w-full p-3 border border-gray-300 rounded-xl input-focus"
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* Payment Method */}
                                        <div className="space-y-4 mt-6">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-800">
                                                    Payment Method <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    className="subtext w-full p-3 border border-gray-300 rounded-xl input-focus"
                                                    value={paymentMethod}
                                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                                    required
                                                >
                                                    <option value="">Select Payment Method</option>
                                                    <option value="paypal">PayPal</option>
                                                    <option value="iban">IBAN</option>
                                                    <option value="n26">N26</option>
                                                    <option value="bca">Bank BCA</option>
                                                    <option value="revolut">Bank Revolut</option>
                                                    <option value="jenius">Bank Jenius</option>
                                                </select>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="block text-sm font-semibold text-gray-800">
                                                    Proof of Payment <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="file"
                                                    accept="application/pdf,image/*"
                                                    className="subtext w-full p-3 border border-gray-300 rounded-xl input-focus"
                                                    onChange={(e) => setPaymentProof(e.target.files[0])}
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="block text-sm font-semibold text-gray-800">
                                                    Notes/Request (if any)
                                                </label>
                                                <textarea
                                                    id="message"
                                                    name="message"
                                                    value={notes}
                                                    onChange={(e) => setNotes(e.target.value)}
                                                    rows="2"
                                                    placeholder="e.g. call before pickup, fragile, etc."
                                                    className="subtext w-full p-3 border border-gray-300 rounded-xl input-focus"
                                                ></textarea>
                                            </div>
                                        </div>

                                        {/* Terms */}
                                        <div className="mt-4 flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={termsAccepted}
                                                onChange={() => setTermsAccepted(!termsAccepted)}
                                                className="mr-2 input-focus"
                                                required
                                            />
                                            <span>I have read and accept the</span>
                                            <Link to="/terms" target="_blank" className="text-blue-600 underline ml-1">
                                                Terms and Conditions
                                            </Link>
                                            <span className="text-red-500 ml-1">*</span>
                                        </div>

                                        {/* Checkout Button */}
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="button-primary font-semibold text-lg inline-flex items-center justify-center w-full mt-6 py-3 disabled:opacity-60"
                                        >
                                            {submitting ? "Processing..." : "Checkout"}
                                        </button>
                                    </form>
                                </div>

                                {/* RIGHT: Order summary */}
                                <aside className="lg:sticky lg:top-24 h-fit">
                                    <div className="rounded-2xl border bg-white p-5 shadow-lg">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">Order summary</h3>
                                                <p className="subtext text-xs text-gray-600 mt-1">
                                                    {cartItems.length} shipment{cartItems.length === 1 ? "" : "s"}
                                                </p>
                                            </div>

                                            <Link to="/cart" className="text-sm font-semibold text-secondary hover:opacity-80">
                                                Edit
                                            </Link>
                                        </div>

                                        <div className="mt-4 space-y-3">
                                            {cartItems.map((item, idx) => {
                                                const qty = Number(item.quantity) || 1;

                                                const dutyInfo = relevantDutyItems.find((r) => r.item === item);
                                                const key = dutyInfo?.key;
                                                const unitCustoms = key ? (customsFeeByKey[key] || 0) : 0;

                                                const unitTransport = Number(item.priceEur) || 0;
                                                const unitTotal = unitTransport + unitCustoms;

                                                const subtotal = unitTotal * qty;
                                                const customsSubtotal = unitCustoms * qty;

                                                return (
                                                    <div key={item.signature ?? idx} className="rounded-xl border bg-gray-50/60 p-3">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <ShipmentMeta item={item} showPickupChip={false} showDetailChip={false} compact={true} />

                                                            <div className="text-right shrink-0">
                                                                <div className="text-sm font-semibold text-gray-900">
                                                                    €{subtotal.toFixed(2)}
                                                                </div>

                                                                {customsSubtotal > 0 && (
                                                                    <div className="subtext text-xs text-gray-500 mt-0.5">
                                                                        incl. customs €{customsSubtotal.toFixed(2)}
                                                                    </div>
                                                                )}

                                                                {qty > 1 && (
                                                                    <div className="subtext text-xs text-gray-500 mt-0.5">
                                                                        Qty {qty}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="mt-5 border-t pt-4">
                                            <div className="flex items-center justify-between">
                                                <div className="text-sm font-semibold text-gray-900">Total (incl. customs)</div>
                                                <div className="text-lg font-bold text-gray-900">
                                                    €{totalAmountEUR.toFixed(2)}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between mt-1">
                                                <div className="subtext text-xs text-gray-500">Total IDR</div>
                                                <div className="subtext text-xs text-gray-700 font-semibold">
                                                    IDR {totalAmountIDR.toLocaleString()}
                                                </div>
                                            </div>

                                            <div className="mt-3 flex justify-end">
                                                <p className="subtext text-xs text-gray-500">
                                                    Calculated using fixed exchange rate: <span className="font-semibold text-gray-700">1 EUR = 19,600 IDR</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </aside>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
};

export default CheckoutPage;
