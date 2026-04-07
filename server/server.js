import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import { Client } from "@notionhq/client";
import {
    mapRouteDates,
    mapCountries,
    mapDhlTiers,
    mapPackageTypes,
    mapSettings,
    mapSizePresets
} from "./utils/notionMappers.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const notion = new Client({
    auth: process.env.NOTION_API_TOKEN,
    notionVersion: "2026-03-11",
});

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 20 * 1024 * 1024, // 20 MB
    },
});

app.get("/", (req, res) => {
    res.send("Server is running ✅");
});

app.get("/api/health", (req, res) => {
    res.json({ ok: true });
});

app.listen("3001", () =>
    console.log(`Server running on port 3001`)
);

/**
 * Post data to Notion
 */
app.post("/api/notion/penerimaan-barang", async (req, res) => {
    try {
        const { orderId, fullName, email, phone, packageType, quantity, request } = req.body;
        if (!fullName) return res.status(400).json({ error: "fullName is required" });

        const created = await notion.pages.create({
            parent: {
                type: "data_source_id",
                data_source_id: process.env.NOTION_DB_PENERIMAAN_BARANG,
            },
            properties: {
                "Order ID (WEB)": {
                    rich_text: [{ text: { content: String(orderId || "") } }],
                },
                "Nama Pembeli (WEB)": {
                    title: [{ text: { content: String(fullName) } }],
                },
                "Email (WEB)": {
                    email: email ? String(email) : null,
                },
                "Telepon (WEB)": {
                    phone_number: phone ? String(phone) : null,
                },
                "Jenis Item (WEB)": {
                    select: packageType ? { name: String(packageType) } : null,
                },
                "Jumlah Pembelian per Unit (WEB)": {
                    number: Number(quantity) || 0,
                },
                "Request Khusus (WEB)": {
                    rich_text: [{ text: { content: String(request || "") } }],
                },
            },
        });

        res.json({ ok: true, notionPageId: created.id });
    } catch (err) {
        const code = err?.cause?.code || err?.code;
        const message = err?.message || String(err);
        console.error("Notion error (Penerimaan Barang):", { code, message });
        res.status(500).json({ error: "Failed to write to Notion", code, message });
    }
});

app.post("/api/notion/pembayaran", upload.single("paymentProof"), async (req, res) => {
    try {
        const {
            orderId,
            fullName,
            email,
            phone,
            billingAddress,
            packageType,
            totalEur,
            priceBreakdown,
            quantity,
            paymentStatus,
            paymentDate,
        } = req.body;

        const paymentProof = req.file;

        if (!fullName) {
            return res.status(400).json({ error: "fullName is required" });
        }

        let buktiPembayaranFiles = [];

        if (paymentProof) {
            const fileUpload = await notion.fileUploads.create({
                mode: "single_part",
                filename: paymentProof.originalname,
                content_type: paymentProof.mimetype,
            });

            const uploadedFile = await notion.fileUploads.send({
                file_upload_id: fileUpload.id,
                file: {
                    filename: paymentProof.originalname,
                    data: new Blob([paymentProof.buffer], {
                        type: paymentProof.mimetype,
                    }),
                },
            });

            console.log("Uploaded file status:", uploadedFile.status);

            buktiPembayaranFiles = [
                {
                    type: "file_upload",
                    file_upload: {
                        id: fileUpload.id,
                    },
                    name: paymentProof.originalname,
                },
            ];
        }

        const created = await notion.pages.create({
            parent: {
                type: "data_source_id",
                data_source_id: process.env.NOTION_DB_PEMBAYARAN,
            },
            properties: {
                "Order ID (WEB)": {
                    rich_text: [{ text: { content: String(orderId || "") } }],
                },
                "Nama Pembeli (WEB)": {
                    title: [{ text: { content: String(fullName) } }],
                },
                "Email (WEB)": {
                    email: email ? String(email) : null,
                },
                "Telepon (WEB)": {
                    phone_number: phone ? String(phone) : null,
                },
                "Alamat Tagihan (WEB)": {
                    rich_text: [{ text: { content: String(billingAddress || "") } }],
                },
                "Jenis Item (WEB)": {
                    select: packageType ? { name: String(packageType) } : null,
                },
                "Total Harga (WEB)": {
                    number: Number(totalEur) || 0,
                },
                "Price Breakdown (WEB)": {
                    rich_text: [{ text: { content: String(priceBreakdown || "") } }],
                },
                "Jumlah Pembelian per Unit (WEB)": {
                    number: Number(quantity) || 0,
                },
                "Status Pembayaran (WEB)": {
                    multi_select: paymentStatus ? [{ name: String(paymentStatus) }] : [],
                },
                "Tanggal Pembayaran (WEB)": {
                    date: paymentDate ? { start: String(paymentDate) } : null,
                },
                "Bukti Pembayaran (WEB)": {
                    files: buktiPembayaranFiles,
                },
            },
        });

        res.json({ ok: true, notionPageId: created.id });
    } catch (err) {
        const code = err?.cause?.code || err?.code;
        const message = err?.message || String(err);
        console.error("Notion error (Pembayaran):", { code, message });

        res.status(500).json({
            error: "Failed to write to Notion (Pembayaran)",
            code,
            message,
        });
    }
});

app.post("/api/notion/pengiriman-lokal", async (req, res) => {
    try {
        const { orderId, fullName, address } = req.body;

        if (!fullName) return res.status(400).json({ error: "fullName is required" });

        const created = await notion.pages.create({
            parent: {
                type: "data_source_id",
                data_source_id: process.env.NOTION_DB_PENGIRIMAN_LOKAL,
            },
            properties: {
                "Order ID (WEB)": {
                    rich_text: [{ text: { content: String(orderId || "") } }],
                },
                "Nama Pembeli (WEB)": {
                    title: [{ text: { content: String(fullName) } }],
                },
                "Alamat Tujuan (WEB)": {
                    rich_text: [{ text: { content: String(address || "") } }],
                },
            },
        });

        res.json({ ok: true, notionPageId: created.id });
    } catch (err) {
        const code = err?.cause?.code || err?.code;
        const message = err?.message || String(err);
        console.error("Notion error (Pengiriman Lokal):", { code, message });

        res.status(500).json({
            error: "Failed to write to Notion (Pengiriman Lokal)",
            code,
            message,
        });
    }
});

/**
 * Get data from Notion
 */

async function queryAllDataSourceRows(dataSourceId) {
    let results = [];
    let hasMore = true;
    let startCursor = undefined;

    while (hasMore) {
        const response = await notion.dataSources.query({
            data_source_id: dataSourceId,
            page_size: 100,
            start_cursor: startCursor,
        });

        results.push(...response.results);
        hasMore = response.has_more;
        startCursor = response.next_cursor ?? undefined;
    }

    return results;
}

app.get("/api/notion/shipping-data", async (req, res) => {
    try {
        const [
            countryRows,
            packageTypeRows,
            sizePresetRows,
            dhlTierRows,
            routeDateRows,
            settingsRows,
        ] = await Promise.all([
            queryAllDataSourceRows(process.env.NOTION_DB_COUNTRIES),
            queryAllDataSourceRows(process.env.NOTION_DB_PACKAGE_TYPES),
            queryAllDataSourceRows(process.env.NOTION_DB_SIZE_PRESETS),
            queryAllDataSourceRows(process.env.NOTION_DB_DHL_TIERS),
            queryAllDataSourceRows(process.env.NOTION_DB_ROUTE_DATES),
            queryAllDataSourceRows(process.env.NOTION_DB_SETTINGS),
        ]);

        const settings = mapSettings(settingsRows);

        res.json({
            COUNTRIES: mapCountries(countryRows),
            PACKAGE_TYPES: mapPackageTypes(packageTypeRows),
            SIZE_PRESETS: mapSizePresets(sizePresetRows),
            DHL_TIERS: mapDhlTiers(dhlTierRows),
            ROUTE_DATES: mapRouteDates(routeDateRows),
            EUR_TO_IDR_RATE: settings.EUR_TO_IDR_RATE ?? null,
        });
    } catch (err) {
        const code = err?.cause?.code || err?.code;
        const message = err?.message || String(err);

        console.error("Notion error (shipping-data):", { code, message });

        res.status(500).json({
            error: "Failed to read shipping data from Notion",
            code,
            message,
        });
    }
});
