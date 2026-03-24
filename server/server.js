import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import { Client } from "@notionhq/client";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const notion = new Client({
    auth: process.env.NOTION_API_TOKEN,
    notionVersion: "2025-09-03",
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

app.post("/api/notion/penerimaan-barang", async (req, res) => {
    try {
        const { fullName, packageType, qtyPerUnit, request } = req.body;
        if (!fullName) return res.status(400).json({ error: "fullName is required" });

        const created = await notion.pages.create({
            parent: {
                type: "data_source_id",
                data_source_id: process.env.NOTION_DB_PENERIMAAN_BARANG,
            },
            properties: {
                "Nama Pembeli (WEB)": {
                    title: [{ text: { content: String(fullName) } }],
                },
                "Jenis Item (WEB)": {
                    select: packageType ? { name: String(packageType) } : null,
                },
                "Jumlah Pembelian per Unit (WEB)": {
                    number: Number(qtyPerUnit) || 0,
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
        console.error("Notion error:", { code, message });
        res.status(500).json({ error: "Failed to write to Notion", code, message });
    }
});

app.post("/api/notion/pembayaran", upload.single("paymentProof"), async (req, res) => {
    try {
        const {
            fullName,
            packageType,
            pricePerUnitEur,
            qtyPerUnit,
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
                "Nama Pembeli (WEB)": {
                    title: [{ text: { content: String(fullName) } }],
                },
                "Jenis Item (WEB)": {
                    select: packageType ? { name: String(packageType) } : null,
                },
                "Harga per Unit (WEB)": {
                    number: Number(pricePerUnitEur) || 0,
                },
                "Jumlah Pembelian per Unit (WEB)": {
                    number: Number(qtyPerUnit) || 0,
                },
                "Status Pembayaran (WEB)": {
                    // multi-select -> array of { name }
                    multi_select: paymentStatus ? [{ name: String(paymentStatus) }] : [],
                },
                "Tanggal Pembayaran (WEB)": {
                    // date property expects YYYY-MM-DD
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
        const {
            fullName,
            address
        } = req.body;

        if (!fullName) return res.status(400).json({ error: "fullName is required" });

        const created = await notion.pages.create({
            parent: {
                type: "data_source_id",
                data_source_id: process.env.NOTION_DB_PENGIRIMAN_LOKAL,
            },
            properties: {
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

app.listen("3001", () =>
    console.log(`Server running on port 3001`)
);
