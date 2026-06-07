import { notion } from "./client.js";

async function listAllChildBlocks({ blockId }) {
    let results = [];
    let start_cursor = undefined;
    let has_more = true;

    while (has_more) {
        const response = await notion.blocks.children.list({
            block_id: blockId,
            start_cursor,
            page_size: 100,
        });

        results.push(...response.results);
        has_more = response.has_more;
        start_cursor = response.next_cursor ?? undefined;
    }

    return results;
}

async function findChildPageByTitle({ parentPageId, title }) {
    const children = await listAllChildBlocks({blockId: parentPageId,
    });

    return (
        children.find((block) => {
            return (
                block.type === "child_page" &&
                block.child_page?.title === title
            );
        }) || null
    );
}

async function createChildPage({ parentPageId, title }) {
    return notion.pages.create({
        parent: {
            type: "page_id",
            page_id: parentPageId,
        },
        properties: {
            title: [
                {
                    text: {
                        content: title,
                    },
                },
            ],
        },
    });
}

export async function findOrCreateChildPage({ parentPageId, title }) {
    const existing = await findChildPageByTitle({ parentPageId, title });
    if (existing) {
        return {
            page: existing,
            created: false,
        };
    }

    const created = await createChildPage({ parentPageId, title });
    return {
        page: created,
        created: true,
    };
}

async function createDatabaseInPage({ pageId, title, properties }) {
    return notion.databases.create({
        parent: {
            type: "page_id",
            page_id: pageId,
        },
        title: [
            {
                type: "text",
                text: {
                    content: title,
                },
            },
        ],
        initial_data_source: {
            properties,
        },
        is_inline: false,
    });
}

export async function findChildDatabaseByTitle({ parentPageId, title }) {
    const children = await listAllChildBlocks({blockId: parentPageId});

    return (
        children.find((block) => {
            return (
                block.type === "child_database" &&
                block.child_database?.title === title
            );
        }) || null
    );
}

export async function findOrCreateDatabaseInPage({
                                                     pageId,
                                                     title,
                                                     properties,
                                                 }) {
    const existingBlock = await findChildDatabaseByTitle({
        parentPageId: pageId,
        title,
    });

    if (existingBlock) {
        const existingDb = await notion.databases.retrieve({
            database_id: existingBlock.id,
        });

        return {
            database: existingDb,
            created: false,
        };
    }

    const created = await createDatabaseInPage({
        pageId,
        title,
        properties,
    });

    return {
        database: created,
        created: true,
    };
}

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

export async function lockNotionPage(pageId) {
    return notion.pages.update({
        page_id: pageId,
        is_locked: true,
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
