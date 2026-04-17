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

export const penerimaanBarangSchema = {
    "Order ID (WEB)": { rich_text: {} },
    "Nama Pembeli (WEB)": { title: {} },
    "Telepon (WEB)": { phone_number: {} },
    "Email (WEB)": { email: {} },
    "Jenis Item (WEB)": {
        select: {
            options: jenisItemOptions,
        },
    },
    "Jumlah Pembelian per Unit (WEB)": { number: { format: "number" } },
    "Penerimaan Barang (M)": {
        select: {
            options: penerimaanBarangOptions,
        },
    },
    "Kesesuaian Barang (M)": { checkbox: {} },
    "Berat Asli (P)": { number: { format: "number" } },
    "Request Khusus (WEB)": { rich_text: {} },
    "Tanggal Bongkar (M)": { date: {} },
};

export const pembayaranSchema = {
    "Order ID (WEB)": { rich_text: {} },
    "Nama Pembeli (WEB)": { title: {} },
    "Telepon (WEB)": { phone_number: {} },
    "Email (WEB)": { email: {} },
    "Alamat Tagihan (WEB)": { rich_text: {} },
    "Jenis Item (WEB)": {
        select: {
            options: jenisItemOptions,
        },
    },
    "Jumlah Pembelian per Unit (WEB)": { number: { format: "number" } },
    "Total Harga (WEB)": { number: { format: "euro" } },
    "Price Breakdown (WEB)": { rich_text: {} },
    "Bukti Pembelian Barang (WEB)": { files: {} },
    "Status Pembayaran (WEB)": {
        select: {
            options: statusPembayaranOptions,
        },
    },
    "Tanggal Pembayaran (WEB)": { date: {} },
    "Bukti Pembayaran (WEB)": { files: {} },
    "Confirmasi Pembayaran (WEB)": { checkbox: {} },
};

export const pengirimanLokalSchema = {
    "Order ID (WEB)": { rich_text: {} },
    "Nama Pembeli (WEB)": { title: {} },
    "Telepon (WEB)": { phone_number: {} },
    "Email (WEB)": { email: {} },
    "Alamat Tujuan (WEB)": { rich_text: {} },
    "Pengiriman di Indo (WEB)": {
        select: {
            options: pengirimanDiIndoOptions,
        },
    },
    "Status Pengiriman (M)": { status: {} },
    "Pembayaran Ongkir (M)": { checkbox: {} },
    "Total Ongkir (M)": { number: { format: "rupiah" } },
};
