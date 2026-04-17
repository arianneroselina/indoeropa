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
        const { dataSourceId, orderId, fullName, email, phone, packageType, quantity, request } = req.body;
        if (!dataSourceId) {
            return res.status(400).json({ error: "dataSourceId is required" });
        }
        if (!fullName) return res.status(400).json({ error: "fullName is required" });

        const created = await notion.pages.create({
            parent: {
                type: "data_source_id",
                data_source_id: dataSourceId,
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
            dataSourceId,
            orderId,
            fullName,
            email,
            phone,
            billingAddress,
            packageType,
            totalEUR,
            priceBreakdown,
            quantity,
            paymentStatus,
            paymentDate,
        } = req.body;

        const paymentProof = req.file;

        if (!dataSourceId) {
            return res.status(400).json({ error: "dataSourceId is required" });
        }
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
                data_source_id: dataSourceId,
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
                    number: Number(totalEUR) || 0,
                },
                "Price Breakdown (WEB)": {
                    rich_text: [{ text: { content: String(priceBreakdown || "") } }],
                },
                "Jumlah Pembelian per Unit (WEB)": {
                    number: Number(quantity) || 0,
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
    }
});

app.post("/api/notion/pengiriman-lokal", async (req, res) => {
    try {
        const { dataSourceId, orderId, fullName, address } = req.body;
        if (!dataSourceId) {
            return res.status(400).json({ error: "dataSourceId is required" });
        }
        if (!fullName) return res.status(400).json({ error: "fullName is required" });

        const created = await notion.pages.create({
            parent: {
                type: "data_source_id",
                data_source_id: dataSourceId,
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

app.post("/api/notion/order-history", upload.fields([{ name: "paymentProof", maxCount: 1 }]), async (req, res) => {
    try {
        const {
            orderId,
            fullName,
            email,
            phone,
            billingAddress,
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

        const paymentProof = req.files?.paymentProof?.[0];

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

        function buildOrderProperties({
                                          orderId,
                                          submittedAt,
                                          fullName,
                                          email,
                                          phone,
                                          billingAddress,
                                          totalAmountEUR,
                                          totalAmountIDR,
                                          paymentStatus,
                                          paymentProofFiles,
                                          specialRequest,
                                      }) {
            return {
                "Order ID": {
                    title: [{ text: { content: String(orderId) } }],
                },
                "Submitted At": {
                    date: submittedAt ? { start: String(submittedAt) } : null,
                },
                "Full Name": {
                    rich_text: [{ text: { content: String(fullName || "") } }],
                },
                "Email": {
                    email: email ? String(email) : null,
                },
                "Phone": {
                    phone_number: phone ? String(phone) : null,
                },
                "Billing Address": {
                    rich_text: [{ text: { content: String(billingAddress || "") } }],
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
            };
        }

        function buildShipmentProperties(shipment, orderPageId) {
            return {
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
                "Order": {
                    relation: [{ id: orderPageId }],
                },
            };
        }

        const paymentProofFiles = await uploadNotionFile(paymentProof);

        const createdOrder = await notion.pages.create({
            parent: {
                type: "data_source_id",
                data_source_id: orderHistoryDataSourceId,
            },
            properties: buildOrderProperties({
                orderId,
                submittedAt,
                fullName,
                email,
                phone,
                billingAddress,
                totalAmountEUR,
                totalAmountIDR,
                paymentStatus,
                paymentProofFiles,
                specialRequest,
            }),
        });

        const orderPageId = createdOrder.id;

        const createdShipments = [];

        for (const shipment of parsedShipments) {
            const createdShipment = await notion.pages.create({
                parent: {
                    type: "data_source_id",
                    data_source_id: shipmentsDataSourceId,
                },
                properties: buildShipmentProperties(shipment, orderPageId),
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
