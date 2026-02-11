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
