import express from "express";

import { upload } from "../middleware/upload.js";
import { requireFields, sendError } from "../utils/http.js";
import { upsertPageByTitle } from "../services/notion/core/pageService.js";
import { uploadNotionFile } from "../services/notion/core/fileService.js";
import { createOrGetOrderRouteDatabase } from "../services/notion/orderRoute/service.js";
import { saveOrderHistory } from "../services/notion/orderHistory/service.js";
import { getShippingData } from "../services/notion/shippingData/service.js";
import {
	notionDate,
	notionEmail,
	notionFiles,
	notionNumber,
	notionPhone,
	notionSelect,
	notionText,
	notionTitle,
} from "../services/notion/core/properties.js";

const router = express.Router();

router.post("/order-route-database", async (req, res) => {
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

		const result = await createOrGetOrderRouteDatabase(req.body);
		return res.json(result);
	} catch (err) {
		return sendError(
			res,
			err,
			"Order Route Database",
			"Failed to create/find route database in Notion",
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

		if (
			!requireFields(res, req.body, [
				"dataSourceId",
				"shipmentId",
				"buyerFullName",
			])
		) {
			return;
		}

		const result = await upsertPageByTitle({
			dataSourceId,
			titleProperty: "Shipment ID (WEB)",
			titleValue: shipmentId,
			properties: {
				"Shipment ID (WEB)": notionTitle(shipmentId),
				"Nama Pembeli (WEB)": notionText(buyerFullName),
				"Telepon Pembeli (WEB)": notionPhone(buyerPhone),
				"Email Pembeli (WEB)": notionEmail(buyerEmail),
				"Jumlah Pembelian per Unit (WEB)": notionNumber(quantity),
				"Jenis Item (WEB)": notionSelect(packageType),
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

			if (
				!requireFields(res, req.body, [
					"dataSourceId",
					"shipmentId",
					"buyerFullName",
				])
			) {
				return;
			}

			const paymentProof = req.files?.paymentProof?.[0];
			const invoiceProof = req.files?.invoiceProof?.[0];

			const paymentProofFiles = await uploadNotionFile(paymentProof);
			const invoiceProofFiles = await uploadNotionFile(invoiceProof);

			const properties = {
				"Shipment ID (WEB)": notionTitle(shipmentId),
				"Nama Pembayar (WEB)": notionText(buyerFullName),
				"Telepon Pembayar (WEB)": notionPhone(buyerPhone),
				"Email Pembayar (WEB)": notionEmail(buyerEmail),
				"Alamat Tagihan (WEB)": notionText(buyerAddress),
				"Jumlah Pembelian per Unit (WEB)": notionNumber(quantity),
				"Jenis Item (WEB)": notionSelect(packageType),
				"Price Breakdown (WEB)": notionText(priceBreakdown),
				"Total Harga (WEB)": notionNumber(totalEUR),
				"Status Pembayaran (WEB)": notionSelect(paymentStatus),
				"Tanggal Pembayaran (WEB)": notionDate(paymentDate),
			};

			if (paymentProofFiles.length > 0) {
				properties["Bukti Pembayaran (WEB)"] =
					notionFiles(paymentProofFiles);
			}

			if (invoiceProofFiles.length > 0) {
				properties["Bukti Pembelian Barang (WEB)"] =
					notionFiles(invoiceProofFiles);
			}

			const result = await upsertPageByTitle({
				dataSourceId,
				titleProperty: "Shipment ID (WEB)",
				titleValue: shipmentId,
				properties,
				propertiesOnCreate: {
					...(paymentProofFiles.length > 0
						? {
								"Bukti Pembayaran (WEB)":
									notionFiles(paymentProofFiles),
							}
						: {}),
					...(invoiceProofFiles.length > 0
						? {
								"Bukti Pembelian Barang (WEB)":
									notionFiles(invoiceProofFiles),
							}
						: {}),
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
			indoLocalDelivery,
		} = req.body;

		if (
			!requireFields(res, req.body, [
				"dataSourceId",
				"shipmentId",
				"deliveryFullName",
			])
		) {
			return;
		}

		const properties = {
			"Shipment ID (WEB)": notionTitle(shipmentId),
			"Nama Penerima (WEB)": notionText(deliveryFullName),
			"Alamat Tujuan (WEB)": notionText(deliveryAddress),
			"Email Penerima (WEB)": notionEmail(deliveryEmail),
			"Telepon Penerima (WEB)": notionPhone(deliveryPhone),
		};

		if (dhlAddon) {
			properties["DHL Package (WEB)"] = notionSelect(dhlAddon);
		}

		if (indoLocalDelivery) {
			properties["Pengiriman di Indo (WEB)"] =
				notionSelect(indoLocalDelivery);
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
