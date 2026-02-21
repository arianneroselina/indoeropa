import {
    FaBoxOpen,
    FaTv,
    FaCouch,
    FaShoppingBag,
    FaHatCowboy,
    FaShoePrints,
    FaFileAlt,
    FaTableTennis,
} from "react-icons/fa";

export const COUNTRIES = [
    { id: "ID", name: "Indonesia" },
    { id: "DE", name: "Germany" },
    { id: "NL", name: "Netherland" },
    { id: "ES", name: "Spain" },
    { id: "AT", name: "Austria" },
    { id: "PL", name: "Poland" },
    { id: "SE", name: "Sweden" },
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
        pricing: { type: "perKg", price: 18 },
    },
    {
        id: "pkg_1_super",
        label: "1 kg Super Volume",
        description: "Very large items requiring special handling (e.g. large furniture, baby stroller).",
        icon: FaCouch,
        pricing: { type: "perKg", price: 20 },
    },
    {
        id: "bag",
        label: "Bag",
        description: "Handbags, backpacks, travel bags.",
        icon: FaShoppingBag,
        pricing: { type: "perKgAddon", price: 18 },
    },
    {
        id: "hat",
        label: "Hat",
        description: "Caps, structured hats.",
        icon: FaHatCowboy,
        pricing: { type: "perPiece", price: 4 },
    },
    {
        id: "shoes",
        label: "Shoes",
        description: "Sneakers, boots, sandals.",
        icon: FaShoePrints,
        pricing: { type: "perKgAddon", price: 18 },
    },
    {
        id: "racket",
        label: "Racket",
        description: "Tennis or badminton rackets.",
        icon: FaTableTennis,
        pricing: { type: "perKgAddon", price: 18 },
    },
    {
        id: "document",
        label: "Documents",
        description: "Printed documents only.",
        icon: FaFileAlt,
        pricing: {
            type: "document",
            price: {
                1_10: 10,
                11_50: 20,
                51_100: 50,
            }
        },
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
    ],
    ES_ID: [
        "2025-12-20",
        "2025-12-21",
        "2025-12-23",
        "2025-12-25",
        "2026-01-02",
        "2026-02-15",
        "2026-02-22"
    ],
    ID_ES: [
        "2025-12-25",
        "2025-12-26",
        "2025-12-27",
        "2026-01-01",
        "2026-02-15",
        "2026-02-22"
    ]
}
