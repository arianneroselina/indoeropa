import { notion } from "../core/client.js";
import {
	findChildPageByTitle,
	findChildDatabaseByTitle,
	queryAllDataSourceRows,
	upsertPageByTitle,
} from "../core/pageService.js";
import { buildRouteName } from "../../../utils/formatters.js";
import { createOrGetOrderRouteDatabase } from "./service.js";

const OLD_DATABASE_TITLES = {
	penerimaanBarang: "Penerimaan Barang",
	pengirimanLokal: "Pengiriman Lokal",
	pembayaran: "Pembayaran",
};

const PROPERTY_MAPPINGS = {
	penerimaanBarang: {
		"Shipment ID (WEB)": "Shipment ID (WEB)",
		"01 Nama Pembeli (WEB)": "Nama Pembeli (WEB)",
		"02 Telepon Pembeli (WEB)": "Telepon Pembeli (WEB)",
		"03 Jumlah Pembelian per Unit (WEB)": "Jumlah Pembelian per Unit (WEB)",
		"04 Berat Asli (P)": "Berat Asli (P)",
		"05 Penerimaan Barang (M)": "Penerimaan Barang (M)",
		"06 Jenis Item (WEB)": "Jenis Item (WEB)",
		"07 Tanggal Bongkar (M)": "Tanggal Bongkar (M)",
		"08 Kesesuaian Barang (M)": "Kesesuaian Barang (M)",
		"09 Request Khusus (WEB)": "Request Khusus (WEB)",
		"10 Email Pembeli (WEB)": "Email Pembeli (WEB)",
	},

	pembayaran: {
		"Shipment ID (WEB)": "Shipment ID (WEB)",
		"01 Nama Pembayar (WEB)": "Nama Pembayar (WEB)",
		"02 Telepon Pembayar (WEB)": "Telepon Pembayar (WEB)",
		"03 Jumlah Pembelian per Unit (WEB)": "Jumlah Pembelian per Unit (WEB)",
		"04 Price Breakdown (WEB)": "Price Breakdown (WEB)",
		"05 Total Harga (WEB)": "Total Harga (WEB)",
		"06 Bukti Pembayaran (WEB)": "Bukti Pembayaran (WEB)",
		"07 Status Pembayaran (WEB)": "Status Pembayaran (WEB)",
		"08 Bukti Pembelian Barang (WEB)": "Bukti Pembelian Barang (WEB)",
		"09 Jenis Item (WEB)": "Jenis Item (WEB)",
		"10 Tanggal Pembayaran (WEB)": "Tanggal Pembayaran (WEB)",
		"11 Email Pembayar (WEB)": "Email Pembayar (WEB)",
		"12 Alamat Tagihan (WEB)": "Alamat Tagihan (WEB)",
	},

	pengirimanLokal: {
		"Shipment ID (WEB)": "Shipment ID (WEB)",
		"01 Nama Penerima (WEB)": "Nama Penerima (WEB)",
		"02 Alamat Tujuan (WEB)": "Alamat Tujuan (WEB)",
		"03 Email Penerima (WEB)": "Email Penerima (WEB)",

		// DE
		"04 DHL Package (WEB)": "DHL Package (WEB)",

		// ID
		"04 Total Ongkir (M)": "Total Ongkir (M)",
		"05 Pembayaran Ongkir (M)": "Pembayaran Ongkir (M)",
		"06 Pengiriman di Indo (WEB)": "Pengiriman di Indo (WEB)",

		"07 Status Pengiriman (M)": "Status Pengiriman (M)",
		"08 Telepon Penerima (WEB)": "Telepon Penerima (WEB)",
	},
};

function readTitleProperty(page, propertyName) {
	return (
		page.properties?.[propertyName]?.title
			?.map((part) => part.plain_text || "")
			.join("")
			.trim() || ""
	);
}

function isEmptyProperty(property) {
	if (!property?.type) return true;

	const value = property[property.type];

	if (value === null || value === undefined) return true;
	if (Array.isArray(value)) return value.length === 0;
	if (typeof value === "string") return value.trim() === "";

	return false;
}

function toWritablePropertyValue(property) {
	if (!property?.type || isEmptyProperty(property)) return null;

	const value = property[property.type];

	switch (property.type) {
		case "title":
			return {
				title: value.map((part) => ({
					type: "text",
					text: {
						content: part.plain_text || "",
					},
				})),
			};

		case "rich_text":
			return {
				rich_text: value.map((part) => ({
					type: "text",
					text: {
						content: part.plain_text || "",
					},
				})),
			};

		case "select":
			return value?.name
				? {
						select: {
							name: value.name,
						},
					}
				: null;

		case "status":
			return value?.name
				? {
						status: {
							name: value.name,
						},
					}
				: null;

		case "multi_select":
			return {
				multi_select: value.map((option) => ({
					name: option.name,
				})),
			};

		case "date":
			return {
				date: value,
			};

		case "number":
			return {
				number: value,
			};

		case "checkbox":
			return {
				checkbox: value,
			};

		case "email":
			return {
				email: value,
			};

		case "phone_number":
			return {
				phone_number: value,
			};

		case "url":
			return {
				url: value,
			};

		case "files":
			return {
				files: value,
			};

		default:
			console.warn(
				`Skipping unsupported property type: ${property.type}`,
			);
			return null;
	}
}

function mapRowProperties(row, mapping) {
	const mapped = {};

	for (const [oldName, newName] of Object.entries(mapping)) {
		const oldProperty = row.properties?.[oldName];
		const writableValue = toWritablePropertyValue(oldProperty);

		if (writableValue) {
			mapped[newName] = writableValue;
		}
	}

	return mapped;
}

async function getDataSourceIdFromDatabaseBlock(databaseBlock) {
	if (!databaseBlock) return null;

	const database = await notion.databases.retrieve({
		database_id: databaseBlock.id,
	});

	return database.data_sources?.[0]?.id ?? null;
}

async function findOldDatabaseDataSourceId({ datePageId, title }) {
	const databaseBlock = await findChildDatabaseByTitle({
		parentPageId: datePageId,
		title,
	});

	return getDataSourceIdFromDatabaseBlock(databaseBlock);
}

async function migrateRowsFromOldDatabase({
	oldDataSourceId,
	newDataSourceId,
	mapping,
	sourceName,
}) {
	if (!oldDataSourceId) {
		return {
			sourceName,
			skipped: true,
			reason: "Old database not found",
			migrated: 0,
		};
	}

	const rows = await queryAllDataSourceRows(oldDataSourceId);

	let migrated = 0;
	let missingShipmentId = 0;

	for (const row of rows) {
		const shipmentId = readTitleProperty(row, "Shipment ID (WEB)");

		if (!shipmentId) {
			missingShipmentId += 1;
			continue;
		}

		const properties = mapRowProperties(row, mapping);

		await upsertPageByTitle({
			dataSourceId: newDataSourceId,
			titleProperty: "Shipment ID (WEB)",
			titleValue: shipmentId,
			properties,
		});

		migrated += 1;
	}

	return {
		sourceName,
		skipped: false,
		totalRows: rows.length,
		migrated,
		missingShipmentId,
	};
}

export async function migrateOrderRouteDate({
	fromCountry,
	toCountry,
	shipmentDate,
	dateTitle,
}) {
	const routeTitle = buildRouteName({
		fromCountry,
		toCountry,
	});

	const routePage = await findChildPageByTitle({
		parentPageId: process.env.NOTION_PAGE_ORDERS,
		title: routeTitle,
	});

	if (!routePage) {
		throw new Error(`Route page not found: ${routeTitle}`);
	}

	const oldDatePage = await findChildPageByTitle({
		parentPageId: routePage.id,
		title: dateTitle,
	});

	if (!oldDatePage) {
		throw new Error(`Old date page not found: ${dateTitle}`);
	}

	const newRouteDatabase = await createOrGetOrderRouteDatabase({
		fromCountry,
		toCountry,
		shipmentDate,
	});

	const newDataSourceId = newRouteDatabase.dataSourceId;

	const oldDataSources = {
		penerimaanBarang: await findOldDatabaseDataSourceId({
			datePageId: oldDatePage.id,
			title: OLD_DATABASE_TITLES.penerimaanBarang,
		}),
		pengirimanLokal: await findOldDatabaseDataSourceId({
			datePageId: oldDatePage.id,
			title: OLD_DATABASE_TITLES.pengirimanLokal,
		}),
		pembayaran: await findOldDatabaseDataSourceId({
			datePageId: oldDatePage.id,
			title: OLD_DATABASE_TITLES.pembayaran,
		}),
	};

	const results = [];

	results.push(
		await migrateRowsFromOldDatabase({
			oldDataSourceId: oldDataSources.penerimaanBarang,
			newDataSourceId,
			mapping: PROPERTY_MAPPINGS.penerimaanBarang,
			sourceName: "Penerimaan Barang",
		}),
	);

	results.push(
		await migrateRowsFromOldDatabase({
			oldDataSourceId: oldDataSources.pengirimanLokal,
			newDataSourceId,
			mapping: PROPERTY_MAPPINGS.pengirimanLokal,
			sourceName: "Pengiriman Lokal",
		}),
	);

	results.push(
		await migrateRowsFromOldDatabase({
			oldDataSourceId: oldDataSources.pembayaran,
			newDataSourceId,
			mapping: PROPERTY_MAPPINGS.pembayaran,
			sourceName: "Pembayaran",
		}),
	);

	return {
		ok: true,
		routeTitle,
		oldDatePageId: oldDatePage.id,
		newDatabaseId: newRouteDatabase.databaseId,
		newDataSourceId,
		results,
	};
}
