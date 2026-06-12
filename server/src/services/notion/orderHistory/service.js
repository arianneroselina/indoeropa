import { badRequest } from "../../../utils/http.js";
import { uploadNotionFile } from "../core/fileService.js";
import { upsertPageByTitle } from "../core/pageService.js";
import {
	notionDate,
	notionEmail,
	notionFiles,
	notionNumber,
	notionPhone,
	notionRelation,
	notionSelect,
	notionText,
	notionTitle,
} from "../core/properties.js";

function parseShipments(shipments) {
	try {
		return JSON.parse(shipments || "[]");
	} catch {
		throw badRequest("shipments must be valid JSON");
	}
}

function getInvoiceProofFileMap(files) {
	return Object.fromEntries(
		(files || [])
			.filter((file) => file.fieldname.startsWith("invoiceProof:"))
			.map((file) => [file.fieldname.replace("invoiceProof:", ""), file]),
	);
}

function buildOrderProperties({
	orderId,
	buyerFullName,
	buyerEmail,
	buyerPhone,
	buyerAddress,
	deliveryFullName,
	deliveryEmail,
	deliveryPhone,
	deliveryAddress,
	dhlAddon,
	dhlAddonPriceEUR,
	totalAmountEUR,
	totalAmountIDR,
	paymentStatus,
	submittedAt,
	specialRequest,
}) {
	return {
		"Order ID": notionTitle(orderId),
		"Submitted At": notionDate(submittedAt),
		"Buyer Full Name": notionText(buyerFullName),
		"Buyer Email": notionEmail(buyerEmail),
		"Buyer Phone": notionPhone(buyerPhone),
		"Buyer Address": notionText(buyerAddress),
		"Delivery Full Name": notionText(deliveryFullName),
		"Delivery Email": notionEmail(deliveryEmail),
		"Delivery Phone": notionPhone(deliveryPhone),
		"Delivery Address": notionText(deliveryAddress),
		"DHL Addon": notionSelect(dhlAddon),
		"DHL Addon Price (EUR)": notionNumber(dhlAddonPriceEUR),
		"Total (EUR)": notionNumber(totalAmountEUR),
		"Total (IDR)": notionNumber(totalAmountIDR),
		"Payment Status": notionSelect(paymentStatus),
		"Special Request": notionText(specialRequest),
	};
}

function buildShipmentProperties({ shipment, shipmentId, orderPageId }) {
	return {
		"Shipment ID": notionTitle(shipmentId),
		"From Country": notionSelect(shipment.fromCountry),
		"To Country": notionSelect(shipment.toCountry),
		"Shipment Date": notionDate(shipment.shipmentDate),
		"Package Type": notionSelect(shipment.packageType),
		Quantity: notionNumber(shipment.quantity),
		Unit: notionSelect(shipment.unit),
		"Price (EUR)": notionNumber(shipment.priceEUR),
		"Duty Price (EUR)": notionNumber(shipment.dutyPriceEUR),
		Order: notionRelation(orderPageId),
	};
}

export async function saveOrderHistory({ body, files }) {
	const { orderId, shipments } = body;

	const orderHistoryDataSourceId = process.env.NOTION_DB_ORDER_HISTORY;
	const shipmentsDataSourceId = process.env.NOTION_DB_SHIPMENTS;

	if (!orderHistoryDataSourceId) {
		throw new Error("NOTION_DB_ORDER_HISTORY is not set");
	}

	if (!shipmentsDataSourceId) {
		throw new Error("NOTION_DB_SHIPMENTS is not set");
	}

	if (!orderId) {
		throw badRequest("orderId is required");
	}

	const parsedShipments = parseShipments(shipments);

	const paymentProof = files?.find(
		(file) => file.fieldname === "paymentProof",
	);
	const paymentProofFiles = await uploadNotionFile(paymentProof);
	const invoiceProofFileMap = getInvoiceProofFileMap(files);

	const orderProperties = buildOrderProperties(body);

	if (paymentProofFiles.length > 0) {
		orderProperties["Payment Proof"] = notionFiles(paymentProofFiles);
	}

	const orderResult = await upsertPageByTitle({
		dataSourceId: orderHistoryDataSourceId,
		titleProperty: "Order ID",
		titleValue: orderId,
		properties: orderProperties,
		propertiesOnCreate: {
			"Payment Proof": notionFiles(paymentProofFiles),
		},
	});

	const orderPageId = orderResult.page.id;
	const upsertedShipments = [];

	for (const shipment of parsedShipments) {
		const shipmentId = shipment.shipmentId;
		const invoiceProofFile = invoiceProofFileMap[shipment.itemKey];
		const invoiceProofFiles = await uploadNotionFile(invoiceProofFile);

		const shipmentProperties = buildShipmentProperties({
			shipment,
			shipmentId,
			orderPageId,
		});

		if (invoiceProofFiles.length > 0) {
			shipmentProperties["Invoice Proof"] =
				notionFiles(invoiceProofFiles);
		}

		const shipmentResult = await upsertPageByTitle({
			dataSourceId: shipmentsDataSourceId,
			titleProperty: "Shipment ID",
			titleValue: shipmentId,
			properties: shipmentProperties,
			propertiesOnCreate: {
				"Invoice Proof": notionFiles(invoiceProofFiles),
			},
		});

		upsertedShipments.push({
			id: shipmentResult.page.id,
			shipmentId,
			action: shipmentResult.action,
		});
	}

	return {
		ok: true,
		action: orderResult.action,
		orderPageId,
		shipmentPageIds: upsertedShipments.map((shipment) => shipment.id),
		shipments: upsertedShipments,
	};
}
