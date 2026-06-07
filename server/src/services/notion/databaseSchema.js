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
    { name: "GOJEK" },
    { name: "JNE" },
    { name: "TRAVEL" },
    { name: "JNT" },
    { name: "LALAMOVE" },
    { name: "Susulan next kiriman" },
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
]

const dhlPackageOptions = [
    { name: "cod" },
    { name: "dhl_2kg" },
    { name: "dhl_5kg" },
    { name: "dhl_10kg" },
    { name: "dhl_20kg" },
];

export const penerimaanBarangSchema = {
    "Shipment ID (WEB)": { title: {} },
    "01 Nama Pembeli (WEB)": { rich_text: {} },
    "02 Telepon Pembeli (WEB)": { phone_number: {} },
    "03 Jumlah Pembelian per Unit (WEB)": { number: { format: "number" } },
    "04 Berat Asli (P)": { number: { format: "number" } },
    "05 Penerimaan Barang (M)": {
        select: {
            options: penerimaanBarangOptions,
        },
    },
    "06 Jenis Item (WEB)": {
        select: {
            options: jenisItemOptions,
        },
    },
    "07 Tanggal Bongkar (M)": { date: {} },
    "08 Kesesuaian Barang (M)": { checkbox: {} },
    "09 Request Khusus (WEB)": { rich_text: {} },
    "10 Email Pembeli (WEB)": { email: {} },
};

export const pembayaranSchema = {
    "Shipment ID (WEB)": { title: {} },
    "01 Nama Pembayar (WEB)": { rich_text: {} },
    "02 Telepon Pembayar (WEB)": { phone_number: {} },
    "03 Jumlah Pembelian per Unit (WEB)": { number: { format: "number" } },
    "04 Price Breakdown (WEB)": { rich_text: {} },
    "05 Total Harga (WEB)": { number: { format: "euro" } },
    "06 Bukti Pembayaran (WEB)": { files: {} },
    "07 Status Pembayaran (WEB)": {
        select: {
            options: statusPembayaranOptions,
        },
    },
    "08 Bukti Pembelian Barang (WEB)": { files: {} },
    "09 Jenis Item (WEB)": {
        select: {
            options: jenisItemOptions,
        },
    },
    "10 Tanggal Pembayaran (WEB)": { date: {} },
    "11 Email Pembayar (WEB)": { email: {} },
    "12 Alamat Tagihan (WEB)": { rich_text: {} },
};

export const pengirimanLokalDestDESchema = {
    "Shipment ID (WEB)": { title: {} },
    "01 Nama Penerima (WEB)": { rich_text: {} },
    "02 Alamat Tujuan (WEB)": { rich_text: {} },
    "03 Email Penerima (WEB)": { email: {} },
    "04 DHL Package (WEB)": {
        select: {
            options: dhlPackageOptions,
        },
    },
    "07 Status Pengiriman (M)": { status: {} },
    "08 Telepon Penerima (WEB)": { phone_number: {} },
};

export const pengirimanLokalDestIDSchema = {
    "Shipment ID (WEB)": { title: {} },
    "01 Nama Penerima (WEB)": { rich_text: {} },
    "02 Alamat Tujuan (WEB)": { rich_text: {} },
    "03 Email Penerima (WEB)": { email: {} },
    "04 Total Ongkir (M)": { number: { format: "rupiah" } },
    "05 Pembayaran Ongkir (M)": { checkbox: {} },
    "06 Pengiriman di Indo (WEB)": {
        select: {
            options: pengirimanDiIndoOptions,
        },
    },
    "07 Status Pengiriman (M)": { status: {} },
    "08 Telepon Penerima (WEB)": { phone_number: {} },
};
