
export function formatRouteDate(dateStr) {
    if (!dateStr) return "";
    const [year, month, day] = String(dateStr).split("-");
    if (!year || !month || !day) return String(dateStr);
    return `${day}-${month}-${year}`;
}

export function buildRouteName({ fromCountry, toCountry }) {
    return `${fromCountry}_${toCountry}`;
}

export function extractPageTitle(page) {
    const prop = page?.properties?.title || page?.properties?.Name;
    return prop?.title?.[0]?.plain_text || "";
}

export async function findChildPageByTitle({ notion, parentPageId, title }) {
    const searchResponse = await notion.search({
        query: title,
        filter: {
            property: "object",
            value: "page",
        },
    });

    return (
        searchResponse.results.find((page) => {
            if (page.parent?.type !== "page_id") return false;
            if (page.parent.page_id !== parentPageId) return false;
            return extractPageTitle(page) === title;
        }) || null
    );
}

export async function createChildPage({ notion, parentPageId, title }) {
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
