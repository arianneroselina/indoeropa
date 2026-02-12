import {
    FaBoxOpen,
    FaTv,
    FaCouch,
    FaShoppingBag,
    FaHatCowboy,
    FaShoePrints,
    FaFileAlt,
    FaWallet,
} from "react-icons/fa";

export const COUNTRIES = [
    { id: "ID", name: "Indonesia" },
    { id: "DE", name: "Germany" },
];

export const PACKAGE_TYPES = [
    {
        id: "standard",
        label: "Standard items",
        description: "Clothing, gifts, personal belongings and general goods.",
        icon: FaBoxOpen,
        pricing: { type: "standard" },
    },
    {
        id: "pkg_1_vol",
        label: "1 kg Volume",
        description: "Large items (e.g. computer monitor, small microwave).",
        icon: FaTv,
        pricing: { type: "volume", perKg: 18 },
    },
    {
        id: "pkg_1_super",
        label: "1 kg Super Volume",
        description: "Very large items requiring special handling (e.g. large furniture, baby stroller).",
        icon: FaCouch,
        pricing: { type: "super_volume", perKg: 20 },
    },
    {
        id: "bag",
        label: "Bag",
        description: "Handbags, backpacks, travel bags.",
        icon: FaShoppingBag,
        pricing: { type: "perKgAddon", firstKg: 18 },
    },
    {
        id: "hat",
        label: "Hat",
        description: "Caps, structured hats.",
        icon: FaHatCowboy,
        pricing: { type: "perKgAddon", firstKg: 4 },
    },
    {
        id: "shoes",
        label: "Shoes",
        description: "Sneakers, boots, sandals.",
        icon: FaShoePrints,
        pricing: { type: "perKgAddon", firstKg: 18 },
    },
    {
        id: "wallet",
        label: "Wallet / Clutch",
        description: "Small leather goods.",
        icon: FaWallet,
        pricing: { type: "perKgAddon", firstKg: 12 },
    },
    {
        id: "document",
        label: "Documents",
        description: "Printed documents only.",
        icon: FaFileAlt,
        pricing: { type: "document" },
    },
];

export const SIZE_PRESETS = [
    { id: "a4", label: "A4 Envelope", dims: { l: 32, w: 24, h: 1 } },
    { id: "books", label: "Books", dims: { l: 23, w: 14, h: 4 } },
    { id: "shoebox", label: "Shoe box", dims: { l: 35, w: 20, h: 15 } },
    { id: "moving", label: "Moving box", dims: { l: 75, w: 35, h: 35 } },
];

export const DHL_TIERS = [
    { "id": "dhl2", "label": "DHL Paket 2kg", "maxKg": 2, "price": 7.19 },
    { "id": "dhl5", "label": "DHL Paket 5kg", "maxKg": 5, "price": 8.69 },
    { "id": "dhl10", "label": "DHL Paket 10kg", "maxKg": 10, "price": 11.49 },
    { "id": "dhl20", "label": "DHL Paket 20kg", "maxKg": 20, "price": 19.99 }
]

export const AVAILABLE_DATES = {
    ID_DE: [
        "2025-12-20",
        "2025-12-21",
        "2025-12-23",
        "2025-12-25",
        "2026-01-02"
    ],
    DE_ID: [
        "2025-12-25",
        "2025-12-26",
        "2025-12-27",
        "2026-01-01"
    ]
}
