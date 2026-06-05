import {
    buildRouteName,
    findOrCreateChildPage,
    findOrCreateDatabaseInPage,
    formatRouteDate,
} from "../../utils/helper.js";
import {
    pembayaranSchema,
    penerimaanBarangSchema,
    pengirimanLokalSchema,
} from "./databaseSchema.js";
import { notion } from "./client.js";

export async function createOrGetOrderRoutePage({
                                                    fromCountry,
                                                    toCountry,
                                                    shipmentDate,
                                                }) {
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

    return {
        ok: true,
        routePageId: routeResult.page.id,
        routeTitle,
        routeCreated: routeResult.created,
        datePageId: dateResult.page.id,
        dateTitle,
        dateCreated: dateResult.created,
    };
}

export async function createOrGetOrderRouteDatabases({ datePageId }) {
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

    return {
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
    };
}
