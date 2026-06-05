
export function formatRouteDate(dateStr) {
    if (!dateStr) return "";
    const [year, month, day] = String(dateStr).split("-");
    if (!year || !month || !day) return String(dateStr);
    return `${day}-${month}-${year}`;
}

export function buildRouteName({ fromCountry, toCountry }) {
    return `${fromCountry}_${toCountry}`;
}

async function listAllChildBlocks({ notion, blockId }) {
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

async function findChildPageByTitle({ notion, parentPageId, title }) {
    const children = await listAllChildBlocks({
        notion,
        blockId: parentPageId,
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

async function createChildPage({ notion, parentPageId, title }) {
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

export async function findOrCreateChildPage({ notion, parentPageId, title }) {
    const existing = await findChildPageByTitle({ notion, parentPageId, title });
    if (existing) {
        return {
            page: existing,
            created: false,
        };
    }

    const created = await createChildPage({ notion, parentPageId, title });
    return {
        page: created,
        created: true,
    };
}

async function createDatabaseInPage({ notion, pageId, title, properties }) {
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

export async function findChildDatabaseByTitle({ notion, parentPageId, title }) {
    const children = await listAllChildBlocks({
        notion,
        blockId: parentPageId,
    });

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
                                                     notion,
                                                     pageId,
                                                     title,
                                                     properties,
                                                 }) {
    const existingBlock = await findChildDatabaseByTitle({
        notion,
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
        notion,
        pageId,
        title,
        properties,
    });

    return {
        database: created,
        created: true,
    };
}
