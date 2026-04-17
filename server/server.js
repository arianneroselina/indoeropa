import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import { Client } from "@notionhq/client";
import {
    mapRouteDates,
    mapCountries,
    mapDhlTiers,
    mapPackageTypes,
    mapSettings,
    mapSizePresets
} from "./src/notionMappers.js";
import { buildRouteName, findOrCreateChildPage, findOrCreateDatabaseInPage, formatRouteDate } from "./src/helper.js";
import { pembayaranSchema, penerimaanBarangSchema, pengirimanLokalSchema } from "./src/databaseSchema.js";
import orderConfirmationRoutes from "./src/routes/orderConfirmationRoutes.js";
import contactRoutes from "./src/routes/contactRoutes.js";

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
 * Create a new route page
 */
app.post("/api/notion/order-route-page", async (req, res) => {
    try {
        const { fromCountry, toCountry, shipmentDate } = req.body;

        if (!fromCountry || !toCountry || !shipmentDate) {
            return res.status(400).json({
                error: "fromCountry, toCountry, and shipmentDate are required",
            });
        }

        const routeTitle = buildRouteName({ fromCountry, toCountry });
        const dateTitle = formatRouteDate(shipmentDate);

        const routeResult = await findOrCreateChildPage({
            notion,
            parentPageId: process.env.NOTION_PAGE_ORDERS,
            title: routeTitle,
        });

        const dateResult = await findOrCreateChildPage({
            notion,
            parentPageId: routeResult.page.id,
            title: dateTitle,
        });

        return res.json({
            ok: true,
            routePageId: routeResult.page.id,
            routeTitle,
            routeCreated: routeResult.created,
            datePageId: dateResult.page.id,
            dateTitle,
            dateCreated: dateResult.created,
        });
    } catch (err) {
        const code = err?.cause?.code || err?.code;
        const message = err?.message || String(err);

        console.error("Notion error (Order Route Tree):", { code, message });

        return res.status(500).json({
            error: "Failed to create/find nested route pages in Notion",
            code,
            message,
        });
    }
});

/**
 * Create a new route database in a page
 */
app.post("/api/notion/order-route-databases", async (req, res) => {
    try {
        const { datePageId } = req.body;

        if (!datePageId) {
            return res.status(400).json({ error: "datePageId is required" });
        }

        const penerimaan = await findOrCreateDatabaseInPage({
            notion,
            pageId: datePageId,
            title: "Penerimaan Barang",
            properties: penerimaanBarangSchema,
        });

        const pembayaran = await findOrCreateDatabaseInPage({
            notion,
            pageId: datePageId,
            title: "Pembayaran",
            properties: pembayaranSchema,
        });

        const pengiriman = await findOrCreateDatabaseInPage({
            notion,
            pageId: datePageId,
            title: "Pengiriman Lokal",
            properties: pengirimanLokalSchema,
        });

        return res.json({
            ok: true,
            databases: {
                penerimaanBarang: {
                    id: penerimaan.database.id,
                    dataSourceId: penerimaan.database.data_sources?.[0]?.id ?? null,
                    created: penerimaan.created,
                },
                pembayaran: {
                    id: pembayaran.database.id,
                    dataSourceId: pembayaran.database.data_sources?.[0]?.id ?? null,
                    created: pembayaran.created,
                },
                pengirimanLokal: {
                    id: pengiriman.database.id,
                    dataSourceId: pengiriman.database.data_sources?.[0]?.id ?? null,
                    created: pengiriman.created,
                },
            },
        });
    } catch (err) {
        const code = err?.cause?.code || err?.code;
        const message = err?.message || String(err);

        console.error("Notion error (Order Route Databases):", {
            code,
            message,
        });

        return res.status(500).json({
            error: "Failed to create/find route databases in Notion",
            code,
            message,
        });
    }
});

/**
 * Post data to Notion
 */
app.post("/api/notion/penerimaan-barang", async (req, res) => {
    try {
        const { dataSourceId, orderId, buyerFullName, buyerPhone, buyerEmail, packageType, quantity, request } = req.body;
        if (!dataSourceId) {
            return res.status(400).json({ error: "dataSourceId is required" });
        }
        if (!buyerFullName) return res.status(400).json({ error: "buyerFullName is required" });

        const created = await notion.pages.create({
            parent: {
                type: "data_source_id",
                data_source_id: dataSourceId,
            },
            properties: {
                "Order ID (WEB)": {
                    title: [{ text: { content: String(orderId) } }],
                },
                "Nama Pembeli (WEB)": {
                    rich_text: [{ text: { content: String(buyerFullName || "") } }],
                },
                "Telepon Pembeli (WEB)": {
                    phone_number: buyerPhone ? String(buyerPhone) : null,
                },
                "Email Pembeli (WEB)": {
                    email: buyerEmail ? String(buyerEmail) : null,
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

app.post("/api/notion/pembayaran",
    upload.fields([
        { name: "paymentProof", maxCount: 1 },
        { name: "invoiceProof", maxCount: 1 },
    ]), async (req, res) => {
    try {
        const {
            dataSourceId,
            orderId,
            billingFullName,
            billingPhone,
            billingAddress,
            packageType,
            totalEUR,
            priceBreakdown,
            quantity,
            paymentStatus,
            paymentDate,
        } = req.body;

        const paymentProof = req.files?.paymentProof?.[0];
        const invoiceProof = req.files?.invoiceProof?.[0];

        if (!dataSourceId) {
            return res.status(400).json({ error: "dataSourceId is required" });
        }
        if (!billingFullName) {
            return res.status(400).json({ error: "billingFullName is required" });
        }

        async function uploadNotionFile(file) {
            if (!file) return [];

            const fileUpload = await notion.fileUploads.create({
                mode: "single_part",
                filename: file.originalname,
                content_type: file.mimetype,
            });

            const uploadedFile = await notion.fileUploads.send({
                file_upload_id: fileUpload.id,
                file: {
                    filename: file.originalname,
                    data: new Blob([file.buffer], {
                        type: file.mimetype,
                    }),
                },
            });

            console.log("Uploaded file status:", uploadedFile.status);

            return [
                {
                    type: "file_upload",
                    file_upload: {
                        id: fileUpload.id,
                    },
                    name: file.originalname,
                },
            ];
        }

        const buktiPembayaranFiles = await uploadNotionFile(paymentProof);
        const buktiPembelianBarangFiles = await uploadNotionFile(invoiceProof);

        const created = await notion.pages.create({
            parent: {
                type: "data_source_id",
                data_source_id: dataSourceId,
            },
            properties: {
                "Order ID (WEB)": {
                    title: [{ text: { content: String(orderId) } }],
                },
                "Nama Pembayar (WEB)": {
                    rich_text: [{ text: { content: String(billingFullName || "") } }],
                },
                "Telepon Pembayar (WEB)": {
                    phone_number: billingPhone ? String(billingPhone) : null,
                },
                "Alamat Tagihan (WEB)": {
                    rich_text: [{ text: { content: String(billingAddress || "") } }],
                },
                "Jenis Item (WEB)": {
                    select: packageType ? { name: String(packageType) } : null,
                },
                "Total Harga (WEB)": {
                    number: Number(totalEUR) || 0,
                },
                "Price Breakdown (WEB)": {
                    rich_text: [{ text: { content: String(priceBreakdown || "") } }],
                },
                "Jumlah Pembelian per Unit (WEB)": {
                    number: Number(quantity) || 0,
                },
                "Bukti Pembelian Barang (WEB)": {
                    files: buktiPembelianBarangFiles,
                },
                "Status Pembayaran (WEB)": {
                    select: paymentStatus ? { name: String(paymentStatus) } : null,
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
    }},
);

app.post("/api/notion/pengiriman-lokal", async (req, res) => {
    try {
        const { dataSourceId, orderId, deliveryRecipientFullName, deliveryRecipientPhone, deliveryAddress } = req.body;
        if (!dataSourceId) {
            return res.status(400).json({ error: "dataSourceId is required" });
        }
        if (!deliveryRecipientFullName) return res.status(400).json({ error: "deliveryRecipientFullName is required" });

        const created = await notion.pages.create({
            parent: {
                type: "data_source_id",
                data_source_id: dataSourceId,
            },
            properties: {
                "Order ID (WEB)": {
                    title: [{ text: { content: String(orderId) } }],
                },
                "Nama Penerima (WEB)": {
                    rich_text: [{ text: { content: String(deliveryRecipientFullName || "") } }],
                },
                "Telepon Penerima (WEB)": {
                    phone_number: deliveryRecipientPhone ? String(deliveryRecipientPhone) : null,
                },
                "Alamat Tujuan (WEB)": {
                    rich_text: [{ text: { content: String(deliveryAddress || "") } }],
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

app.post("/api/notion/order-history", upload.any(), async (req, res) => {
    try {
        const {
            orderId,
            buyerFullName,
            buyerPhone,
            buyerEmail,
            deliveryRecipientFullName,
            deliveryRecipientPhone,
            deliveryAddress,
            billingFullName,
            billingPhone,
            billingAddress,
            selectedDhlAddon,
            dhlAddonPriceEUR,
            totalAmountEUR,
            totalAmountIDR,
            paymentStatus,
            submittedAt,
            specialRequest,
            shipments,
        } = req.body;

        const orderHistoryDataSourceId = process.env.NOTION_DB_ORDER_HISTORY;
        const shipmentsDataSourceId = process.env.NOTION_DB_SHIPMENTS;

        if (!orderHistoryDataSourceId) {
            return res.status(500).json({
                error: "NOTION_DB_ORDER_HISTORY is not set",
            });
        }

        if (!shipmentsDataSourceId) {
            return res.status(500).json({
                error: "NOTION_DB_SHIPMENTS is not set",
            });
        }

        if (!orderId) {
            return res.status(400).json({ error: "orderId is required" });
        }

        let parsedShipments = [];

        try {
            parsedShipments = JSON.parse(shipments || "[]");
        } catch {
            return res.status(400).json({
                error: "shipments must be valid JSON",
            });
        }

        const paymentProof = req.files?.find((f) => f.fieldname === "paymentProof");

        const invoiceProofFileMap = Object.fromEntries(
            (req.files || [])
                .filter((f) => f.fieldname.startsWith("invoiceProof:"))
                .map((f) => [f.fieldname.replace("invoiceProof:", ""), f]),
        );

        async function uploadNotionFile(file) {
            if (!file) return [];

            const fileUpload = await notion.fileUploads.create({
                mode: "single_part",
                filename: file.originalname,
                content_type: file.mimetype,
            });

            await notion.fileUploads.send({
                file_upload_id: fileUpload.id,
                file: {
                    filename: file.originalname,
                    data: new Blob([file.buffer], {
                        type: file.mimetype,
                    }),
                },
            });

            return [
                {
                    type: "file_upload",
                    file_upload: {
                        id: fileUpload.id,
                    },
                    name: file.originalname,
                },
            ];
        }

        const paymentProofFiles = await uploadNotionFile(paymentProof);

        const createdOrder = await notion.pages.create({
            parent: {
                type: "data_source_id",
                data_source_id: orderHistoryDataSourceId,
            },
            properties: {
                "Order ID": {
                    title: [{ text: { content: String(orderId) } }],
                },
                "Submitted At": {
                    date: submittedAt ? { start: String(submittedAt) } : null,
                },
                "Buyer Full Name": {
                    rich_text: [{ text: { content: String(buyerFullName || "") } }],
                },
                "Buyer Email": {
                    email: buyerEmail ? String(buyerEmail) : null,
                },
                "Buyer Phone": {
                    phone_number: buyerPhone ? String(buyerPhone) : null,
                },
                "Delivery Recipient Full Name": {
                    rich_text: [{ text: { content: String(deliveryRecipientFullName || "") } }],
                },
                "Delivery Recipient Phone": {
                    phone_number: deliveryRecipientPhone ? String(deliveryRecipientPhone) : null,
                },
                "Delivery Address": {
                    rich_text: [{ text: { content: String(deliveryAddress || "") } }],
                },
                "Billing Full Name": {
                    rich_text: [{ text: { content: String(billingFullName || "") } }],
                },
                "Billing Phone": {
                    phone_number: billingPhone ? String(billingPhone) : null,
                },
                "Billing Address": {
                    rich_text: [{ text: { content: String(billingAddress || "") } }],
                },
                "Selected DHL Addon": {
                    select: selectedDhlAddon ? { name: String(selectedDhlAddon) } : null,
                },
                "DHL Addon Price (EUR)": {
                    number: Number(dhlAddonPriceEUR) || 0,
                },
                "Total (EUR)": {
                    number: Number(totalAmountEUR) || 0,
                },
                "Total (IDR)": {
                    number: Number(totalAmountIDR) || 0,
                },
                "Payment Status": {
                    select: paymentStatus ? { name: String(paymentStatus) } : null,
                },
                "Payment Proof": {
                    files: paymentProofFiles,
                },
                "Special Request": {
                    rich_text: [{ text: { content: String(specialRequest || "") } }],
                },
            },
        });

        const orderPageId = createdOrder.id;

        const createdShipments = [];

        for (const shipment of parsedShipments) {
            const invoiceProofFile = invoiceProofFileMap[shipment.itemKey];
            const invoiceProofFiles = await uploadNotionFile(invoiceProofFile);

            const createdShipment = await notion.pages.create({
                parent: {
                    type: "data_source_id",
                    data_source_id: shipmentsDataSourceId,
                },
                properties: {
                    "Shipment ID": {
                        title: [
                            {
                                text: {
                                    content: String(
                                        shipment.shipmentId || `${orderId}-1`,
                                    ),
                                },
                            },
                        ],
                    },
                    "From Country": {
                        select: shipment.fromCountry ? { name: String(shipment.fromCountry) } : null,
                    },
                    "To Country": {
                        select: shipment.toCountry ? { name: String(shipment.toCountry) } : null,
                    },
                    "Shipment Date": {
                        date: shipment.shipmentDate
                            ? { start: String(shipment.shipmentDate) }
                            : null,
                    },
                    "Package Type": {
                        select: shipment.packageType ? { name: String(shipment.packageType) } : null,
                    },
                    "Quantity":  {
                        number: Number(shipment.quantity) || 0,
                    },
                    "Unit": {
                        select: shipment.unit ? { name: String(shipment.unit) } : null,
                    },
                    "Price (EUR)": {
                        number: Number(shipment.priceEUR) || 0,
                    },
                    "Duty Price (EUR)": {
                        number: Number(shipment.dutyPriceEUR) || 0,
                    },
                    "Invoice Proof": {
                        files: invoiceProofFiles,
                    },
                    "Order": {
                        relation: [{ id: orderPageId }],
                    },
                },
            });

            createdShipments.push({
                id: createdShipment.id,
                shipmentId: shipment.shipmentId || null,
            });
        }

        return res.json({
            ok: true,
            orderPageId,
            shipmentPageIds: createdShipments.map((s) => s.id),
            createdShipments,
        });
    } catch (err) {
        const code = err?.cause?.code || err?.code;
        const message = err?.message || String(err);

        console.error("Notion error (Order + Shipments):", {
            code,
            message,
        });

        return res.status(500).json({
            error: "Failed to save Order History / Shipments",
            code,
            message,
        });
    }},
);

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

app.use("/api/order-confirmation", orderConfirmationRoutes);

app.use("/api/contact", contactRoutes);
