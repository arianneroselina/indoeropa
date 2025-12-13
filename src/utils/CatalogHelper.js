export const CART_KEY = "shipping_cart_items";

export const ROUTES = [
    {
        key: "indo-ger",
        title: "INDONESIA → GERMANY",
        subtitle: "Shipping from Indonesia to Germany",
        image: "/indo-to-german.png",
    },
    {
        key: "ger-indo",
        title: "GERMANY → INDONESIA",
        subtitle: "Shipping from Germany to Indonesia",
        image: "/german-to-indo.png",
    },
];

export const DHL_LOGO = "/dhl.png";

export const DHL_TIERS = [
    { id: "dhl2", label: "DHL Paket 2kg", maxKg: 2, price: 7.19 },
    { id: "dhl5", label: "DHL Paket 5kg", maxKg: 5, price: 8.69 },
    { id: "dhl10", label: "DHL Paket 10kg", maxKg: 10, price: 11.49 },
    { id: "dhl20", label: "DHL Paket 20kg", maxKg: 20, price: 19.99 },
];

export function pickTier(weightKg) {
    if (!weightKg || weightKg <= 0) return null;
    if (weightKg <= 2) return DHL_TIERS[0];
    if (weightKg <= 5) return DHL_TIERS[1];
    if (weightKg <= 10) return DHL_TIERS[2];
    if (weightKg <= 20) return DHL_TIERS[3];
    return null;
}
