import { notion } from "./client.js";

export async function createNotionPage(dataSourceId, properties) {
    return notion.pages.create({
        parent: {
            type: "data_source_id",
            data_source_id: dataSourceId,
        },
        properties,
    });
}

export async function updateNotionPage(pageId, properties) {
    return notion.pages.update({
        page_id: pageId,
        properties,
    });
}

export async function findPageByTitle({ dataSourceId, propertyName, value }) {
    const response = await notion.dataSources.query({
        data_source_id: dataSourceId,
        page_size: 1,
        filter: {
            property: propertyName,
            title: {
                equals: String(value),
            },
        },
    });

    return response.results?.[0] ?? null;
}

export async function upsertPageByTitle({
                                            dataSourceId,
                                            titleProperty,
                                            titleValue,
                                            properties,
                                            propertiesOnCreate = {},
                                        }) {
    const existingPage = await findPageByTitle({
        dataSourceId,
        propertyName: titleProperty,
        value: titleValue,
    });

    if (existingPage) {
        const page = await updateNotionPage(existingPage.id, properties);

        return {
            action: "updated",
            page,
        };
    }

    const page = await createNotionPage(dataSourceId, {
        ...properties,
        ...propertiesOnCreate,
    });

    return {
        action: "created",
        page,
    };
}

export async function queryAllDataSourceRows(dataSourceId) {
    let results = [];
    let hasMore = true;
    let startCursor = undefined;

    while (hasMore) {
        const response = await notion.dataSources.query({
            data_source_id: dataSourceId,
            page_size: 100,
            start_cursor: startCursor,
        });

        results.push(...response.results);
        hasMore = response.has_more;
        startCursor = response.next_cursor ?? undefined;
    }

    return results;
}
