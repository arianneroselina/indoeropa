import express from "express";

import { upload } from "../middleware/upload.js";
import { requireFields, sendError } from "../utils/http.js";
import { upsertPageByTitle } from "../services/notion/pageService.js";
import { uploadNotionFile } from "../services/notion/fileService.js";
import {
    createOrGetOrderRouteDatabases,
    createOrGetOrderRoutePage,
} from "../services/notion/orderRouteService.js";
import { saveOrderHistory } from "../services/notion/orderHistoryService.js";
import { getShippingData } from "../services/notion/shippingDataService.js";
import {
    notionDate,
    notionEmail,
    notionFiles,
    notionNumber,
    notionPhone,
    notionSelect,
    notionText,
    notionTitle,
} from "../services/notion/properties.js";

const router = express.Router();

router.post("/order-route-page", async (req, res) => {
    try {
        if (
            !requireFields(res, req.body, [
                "fromCountry",
                "toCountry",
                "shipmentDate",
            ])
        ) {
            return;
        }

        const result = await createOrGetOrderRoutePage(req.body);
        return res.json(result);
    } catch (err) {
        return sendError(
            res,
            err,
            "Order Route Tree",
            "Failed to create/find nested route pages in Notion",
        );
    }
});

router.post("/order-route-databases", async (req, res) => {
    try {
        if (!requireFields(res, req.body, [
            "datePageId",
            "toCountry",
            ])
        ) {
            return;
        }

        const result = await createOrGetOrderRouteDatabases(req.body);
        return res.json(result);
    } catch (err) {
        return sendError(
            res,
            err,
            "Order Route Databases",
            "Failed to create/find route databases in Notion",
        );
    }
});

router.post("/penerimaan-barang", async (req, res) => {
    try {
        const {
            dataSourceId,
            shipmentId,
            buyerFullName,
            buyerEmail,
            buyerPhone,
            packageType,
            quantity,
            request,
        } = req.body;

        if (!requireFields(res, req.body, ["dataSourceId", "buyerFullName"])) {
            return;
        }

        const result = await upsertPageByTitle({
            dataSourceId,
            titleProperty: "Shipment ID (WEB)",
            titleValue: shipmentId,
            properties: {
                "Shipment ID (WEB)": notionTitle(shipmentId),
                "Nama Pembeli (WEB)": notionText(buyerFullName),
                "Email Pembeli (WEB)": notionEmail(buyerEmail),
                "Telepon Pembeli (WEB)": notionPhone(buyerPhone),
                "Jenis Item (WEB)": notionSelect(packageType),
                "Jumlah Pembelian per Unit (WEB)": notionNumber(quantity),
                "Request Khusus (WEB)": notionText(request),
            },
        });

        return res.json({
            ok: true,
            action: result.action,
            notionPageId: result.page.id,
        });
    } catch (err) {
        return sendError(
            res,
            err,
            "Penerimaan Barang",
            "Failed to write to Notion",
        );
    }
});

router.post(
    "/pembayaran",
    upload.fields([
        { name: "paymentProof", maxCount: 1 },
        { name: "invoiceProof", maxCount: 1 },
    ]),
    async (req, res) => {
        try {
            const {
                dataSourceId,
                shipmentId,
                buyerFullName,
                buyerEmail,
                buyerPhone,
                buyerAddress,
                packageType,
                totalEUR,
                priceBreakdown,
                quantity,
                paymentStatus,
                paymentDate,
            } = req.body;

            if (!requireFields(res, req.body, ["dataSourceId", "buyerFullName"])) {
                return;
            }

            const paymentProof = req.files?.paymentProof?.[0];
            const invoiceProof = req.files?.invoiceProof?.[0];

            const paymentProofFiles = await uploadNotionFile(paymentProof);
            const invoiceProofFiles = await uploadNotionFile(invoiceProof);

            const properties = {
                "Shipment ID (WEB)": notionTitle(shipmentId),
                "Nama Pembayar (WEB)": notionText(buyerFullName),
                "Email Pembayar (WEB)": notionEmail(buyerEmail),
                "Telepon Pembayar (WEB)": notionPhone(buyerPhone),
                "Alamat Tagihan (WEB)": notionText(buyerAddress),
                "Jenis Item (WEB)": notionSelect(packageType),
                "Total Harga (WEB)": notionNumber(totalEUR),
                "Price Breakdown (WEB)": notionText(priceBreakdown),
                "Jumlah Pembelian per Unit (WEB)": notionNumber(quantity),
                "Status Pembayaran (WEB)": notionSelect(paymentStatus),
                "Tanggal Pembayaran (WEB)": notionDate(paymentDate),
            };

            if (invoiceProofFiles.length > 0) {
                properties["Bukti Pembelian Barang (WEB)"] =
                    notionFiles(invoiceProofFiles);
            }

            if (paymentProofFiles.length > 0) {
                properties["Bukti Pembayaran (WEB)"] =
                    notionFiles(paymentProofFiles);
            }

            const result = await upsertPageByTitle({
                dataSourceId,
                titleProperty: "Shipment ID (WEB)",
                titleValue: shipmentId,
                properties,
                propertiesOnCreate: {
                    "Bukti Pembelian Barang (WEB)": notionFiles(invoiceProofFiles),
                    "Bukti Pembayaran (WEB)": notionFiles(paymentProofFiles),
                },
            });

            return res.json({
                ok: true,
                action: result.action,
                notionPageId: result.page.id,
            });
        } catch (err) {
            return sendError(
                res,
                err,
                "Pembayaran",
                "Failed to write to Notion (Pembayaran)",
            );
        }
    },
);

router.post("/pengiriman-lokal", async (req, res) => {
    try {
        const {
            dataSourceId,
            shipmentId,
            deliveryFullName,
            deliveryEmail,
            deliveryPhone,
            deliveryAddress,
            dhlAddon,
        } = req.body;

        if (!requireFields(res, req.body, ["dataSourceId", "deliveryFullName"])) {
            return;
        }

        const properties = {
            "Shipment ID (WEB)": notionTitle(shipmentId),
            "Nama Penerima (WEB)": notionText(deliveryFullName),
            "Email Penerima (WEB)": notionEmail(deliveryEmail),
            "Telepon Penerima (WEB)": notionPhone(deliveryPhone),
            "Alamat Tujuan (WEB)": notionText(deliveryAddress),
        };

        if (dhlAddon) {
            properties["DHL Package (WEB)"] = notionSelect(dhlAddon);
        }

        const result = await upsertPageByTitle({
            dataSourceId,
            titleProperty: "Shipment ID (WEB)",
            titleValue: shipmentId,
            properties,
        });

        return res.json({
            ok: true,
            action: result.action,
            notionPageId: result.page.id,
        });
    } catch (err) {
        return sendError(
            res,
            err,
            "Pengiriman Lokal",
            "Failed to write to Notion (Pengiriman Lokal)",
        );
    }
});

router.post("/order-history", upload.any(), async (req, res) => {
    try {
        const result = await saveOrderHistory({
            body: req.body,
            files: req.files || [],
        });

        return res.json(result);
    } catch (err) {
        return sendError(
            res,
            err,
            "Order + Shipments",
            "Failed to save Order History / Shipments",
        );
    }
});

router.get("/shipping-data", async (req, res) => {
    try {
        const data = await getShippingData();
        return res.json(data);
    } catch (err) {
        return sendError(
            res,
            err,
            "shipping-data",
            "Failed to read shipping data from Notion",
        );
    }
});

export default router;
