const jenisItemOptions = [
	{ name: "Documents" },
	{ name: "Racket" },
	{ name: "Shoes" },
	{ name: "Hat" },
	{ name: "Bag" },
	{ name: "1 kg Volume" },
	{ name: "1 kg Super Volume" },
	{ name: "Standard items" },
];

const penerimaanBarangOptions = [
	{ name: "Belum dikirim" },
	{ name: "Masih di jalan" },
	{ name: "Sudah diterima" },
	{ name: "PERLENGKAPAN KIRIM" },
	{ name: "Sudah Diterima Sebagian" },
];

const pengirimanDiIndoOptions = [
	{ name: "Pickup ke Warehouse" },
	{ name: "PAXEL" },
	{ name: "Gojek / Grab / Online Taxi" },
	{ name: "JNE" },
	{ name: "TRAVEL" },
	{ name: "JNT" },
	{ name: "LALAMOVE" },
	{ name: "Susulan next kiriman" },
	{ name: "COD" },
];

const statusPembayaranOptions = [
	{ name: "BELUM BAYAR" },
	{ name: "Terbayar (N26)" },
	{ name: "Terbayar (IBAN)" },
	{ name: "Terbayar (Bank BCA)" },
	{ name: "Terbayar (CASH COD)" },
	{ name: "Terbayar (Paypal)" },
	{ name: "Terbayar (Bank Revolut)" },
	{ name: "Terbayar (Bank Jenius)" },
	{ name: "Pengiriman Lokal" },
];

const dhlPackageOptions = [
	{ name: "cod" },
	{ name: "dhl_2kg" },
	{ name: "dhl_5kg" },
	{ name: "dhl_10kg" },
	{ name: "dhl_20kg" },
];

export const orderRouteBaseSchema = {
	"Shipment ID (WEB)": { title: {} },

	// Penerimaan Barang
	"Nama Pembeli (WEB)": { rich_text: {} },
	"Telepon Pembeli (WEB)": { phone_number: {} },
	"Email Pembeli (WEB)": { email: {} },
	"Jumlah Pembelian per Unit (WEB)": { number: { format: "number" } },
	"Berat Asli (P)": { number: { format: "number" } },
	"Penerimaan Barang (M)": {
		select: {
			options: penerimaanBarangOptions,
		},
	},
	"Jenis Item (WEB)": {
		select: {
			options: jenisItemOptions,
		},
	},
	"Tanggal Bongkar (M)": { date: {} },
	"Kesesuaian Barang (M)": { checkbox: {} },
	"Request Khusus (WEB)": { rich_text: {} },

	// Pembayaran
	"Nama Pembayar (WEB)": { rich_text: {} },
	"Telepon Pembayar (WEB)": { phone_number: {} },
	"Email Pembayar (WEB)": { email: {} },
	"Alamat Tagihan (WEB)": { rich_text: {} },
	"Price Breakdown (WEB)": { rich_text: {} },
	"Total Harga (WEB)": { number: { format: "euro" } },
	"Bukti Pembayaran (WEB)": { files: {} },
	"Status Pembayaran (WEB)": {
		select: {
			options: statusPembayaranOptions,
		},
	},
	"Bukti Pembelian Barang (WEB)": { files: {} },
	"Tanggal Pembayaran (WEB)": { date: {} },

	// Pengiriman Lokal - common
	"Nama Penerima (WEB)": { rich_text: {} },
	"Alamat Tujuan (WEB)": { rich_text: {} },
	"Email Penerima (WEB)": { email: {} },
	"Telepon Penerima (WEB)": { phone_number: {} },
	"Status Pengiriman (M)": { status: {} },
};

export const pengirimanLokalDestDESchemaPart = {
	"DHL Package (WEB)": {
		select: {
			options: dhlPackageOptions,
		},
	},
};

export const pengirimanLokalDestIDSchemaPart = {
	"Total Ongkir (M)": { number: { format: "rupiah" } },
	"Pembayaran Ongkir (M)": { checkbox: {} },
	"Pengiriman di Indo (WEB)": {
		select: {
			options: pengirimanDiIndoOptions,
		},
	},
};

export function buildOrderRouteDatabaseSchema({ toCountry }) {
	if (toCountry === "DE") {
		return {
			...orderRouteBaseSchema,
			...pengirimanLokalDestDESchemaPart,
		};
	}

	if (toCountry === "ID") {
		return {
			...orderRouteBaseSchema,
			...pengirimanLokalDestIDSchemaPart,
		};
	}

	throw new Error(
		`Unsupported destination country for order route: ${toCountry}`,
	);
}
