const VIEW_WIDTHS = {
	"Shipment ID (WEB)": 220,

	"Nama Pembeli (WEB)": 180,
	"Nama Pembayar (WEB)": 180,
	"Nama Penerima (WEB)": 180,

	"Telepon Pembeli (WEB)": 160,
	"Telepon Pembayar (WEB)": 170,
	"Telepon Penerima (WEB)": 160,

	"Email Pembeli (WEB)": 220,
	"Email Pembayar (WEB)": 220,
	"Email Penerima (WEB)": 220,

	"Alamat Tujuan (WEB)": 280,
	"Alamat Tagihan (WEB)": 280,

	"Berat Asli (P)": 130,
	"Jenis Item (WEB)": 150,
	"Price Breakdown (WEB)": 160,
	"Request Khusus (WEB)": 260,
	"Total Harga (WEB)": 150,
	"DHL Package (WEB)": 160,
};

const PENERIMAAN_BARANG_COLUMNS = [
	"Nama Pembeli (WEB)",
	"Telepon Pembeli (WEB)",
	"Jumlah Pembelian per Unit (WEB)",
	"Berat Asli (P)",
	"Penerimaan Barang (M)",
	"Jenis Item (WEB)",
	"Tanggal Bongkar (M)",
	"Kesesuaian Barang (M)",
	"Request Khusus (WEB)",
	"Email Pembeli (WEB)",
	"Shipment ID (WEB)",
];

const PEMBAYARAN_COLUMNS = [
	"Nama Pembayar (WEB)",
	"Telepon Pembayar (WEB)",
	"Jumlah Pembelian per Unit (WEB)",
	"Price Breakdown (WEB)",
	"Total Harga (WEB)",
	"Bukti Pembayaran (WEB)",
	"Status Pembayaran (WEB)",
	"Bukti Pembelian Barang (WEB)",
	"Jenis Item (WEB)",
	"Tanggal Pembayaran (WEB)",
	"Email Pembayar (WEB)",
	"Alamat Tagihan (WEB)",
	"Shipment ID (WEB)",
];

const PENGIRIMAN_LOKAL_COMMON_START_COLUMNS = [
	"Nama Penerima (WEB)",
	"Alamat Tujuan (WEB)",
	"Email Penerima (WEB)",
	"Berat Asli (P)",
];

const PENGIRIMAN_LOKAL_COMMON_END_COLUMNS = [
	"Telepon Penerima (WEB)",
	"Shipment ID (WEB)",
];

const PENGIRIMAN_LOKAL_DE_COLUMNS = [
	...PENGIRIMAN_LOKAL_COMMON_START_COLUMNS,
	"DHL Package (WEB)",
	"Status Pengiriman (M)",
	...PENGIRIMAN_LOKAL_COMMON_END_COLUMNS,
];

const PENGIRIMAN_LOKAL_ID_COLUMNS = [
	...PENGIRIMAN_LOKAL_COMMON_START_COLUMNS,
	"Total Ongkir (M)",
	"Pembayaran Ongkir (M)",
	"Pengiriman di Indo (WEB)",
	"Status Pengiriman (M)",
	...PENGIRIMAN_LOKAL_COMMON_END_COLUMNS,
];

function getPengirimanLokalColumns(toCountry) {
	if (toCountry === "DE") {
		return PENGIRIMAN_LOKAL_DE_COLUMNS;
	}
	if (toCountry === "ID") {
		return PENGIRIMAN_LOKAL_ID_COLUMNS;
	}
	throw new Error(
		`Unsupported destination country for view config: ${toCountry}`,
	);
}

function buildTableViewConfiguration(visibleColumns) {
	return {
		type: "table",
		properties: visibleColumns.map((columnName) => ({
			property_id: columnName,
			visible: true,
			...(VIEW_WIDTHS[columnName]
				? { width: VIEW_WIDTHS[columnName] }
				: {}),
		})),
		wrap_cells: false,
		frozen_column_index: 1,
		show_vertical_lines: true,
	};
}

export function getOrderRouteViewConfigs(toCountry) {
	const viewConfigs = [
		{
			name: "Penerimaan Barang",
			columns: PENERIMAAN_BARANG_COLUMNS,
			sorts: [
				{
					property: "Shipment ID (WEB)",
					direction: "descending",
				},
			],
		},
		{
			name: "Pembayaran",
			columns: PEMBAYARAN_COLUMNS,
			sorts: [
				{
					property: "Tanggal Pembayaran (WEB)",
					direction: "descending",
				},
				{
					property: "Shipment ID (WEB)",
					direction: "descending",
				},
			],
		},
		{
			name: "Pengiriman Lokal",
			columns: getPengirimanLokalColumns(toCountry),
			sorts: [
				{
					property: "Shipment ID (WEB)",
					direction: "descending",
				},
			],
		},
	];

	return viewConfigs.map((viewConfig) => ({
		...viewConfig,
		configuration: buildTableViewConfiguration(viewConfig.columns),
	}));
}

export function getOrderRouteViewNames(toCountry) {
	return getOrderRouteViewConfigs(toCountry).map((view) => view.name);
}
