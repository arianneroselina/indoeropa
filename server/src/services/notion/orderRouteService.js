import {
    buildRouteName,
    formatRouteDate,
} from "../../utils/helper.js";
import {
    pembayaranSchema,
    penerimaanBarangSchema,
    pengirimanLokalDestDESchema,
    pengirimanLokalDestIDSchema
} from "./databaseSchema.js";
import { findOrCreateChildPage, findOrCreateDatabaseInPage, lockNotionPage } from "./pageService.js";

export async function createOrGetOrderRoutePage({
                                                    fromCountry,
                                                    toCountry,
                                                    shipmentDate,
                                                }) {
    const routeTitle = buildRouteName({ fromCountry, toCountry });
    const dateTitle = formatRouteDate(shipmentDate);

    const routeResult = await findOrCreateChildPage({
        parentPageId: process.env.NOTION_PAGE_ORDERS,
        title: routeTitle,
    });

    if (routeResult.created) {
        await lockNotionPage(routeResult.page.id)
    }

    const dateResult = await findOrCreateChildPage({
        parentPageId: routeResult.page.id,
        title: dateTitle,
    });

    if (dateResult.created) {
        await lockNotionPage(dateResult.page.id)
    }

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

export async function createOrGetOrderRouteDatabases({ datePageId,
                                                         toCountry,
                                                     }) {
    const penerimaan = await findOrCreateDatabaseInPage({
        pageId: datePageId,
        title: "Penerimaan Barang",
        properties: penerimaanBarangSchema,
    });

    const pembayaran = await findOrCreateDatabaseInPage({
        pageId: datePageId,
        title: "Pembayaran",
        properties: pembayaranSchema,
    });

    const pengiriman = await findOrCreateDatabaseInPage({
        pageId: datePageId,
        title: "Pengiriman Lokal",
        properties: toCountry === "DE" ? pengirimanLokalDestDESchema : pengirimanLokalDestIDSchema,
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
