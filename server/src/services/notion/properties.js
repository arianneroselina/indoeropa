export function notionTitle(value) {
    return {
        title: [{ text: { content: String(value || "") } }],
    };
}

export function notionText(value) {
    return {
        rich_text: [{ text: { content: String(value || "") } }],
    };
}

export function notionEmail(value) {
    return {
        email: value ? String(value) : null,
    };
}

export function notionPhone(value) {
    return {
        phone_number: value ? String(value) : null,
    };
}

export function notionSelect(value) {
    return {
        select: value ? { name: String(value) } : null,
    };
}

export function notionNumber(value) {
    return {
        number: Number(value) || 0,
    };
}

export function notionDate(value) {
    return {
        date: value ? { start: String(value) } : null,
    };
}

export function notionFiles(files) {
    return {
        files: files || [],
    };
}

export function notionRelation(pageId) {
    return {
        relation: pageId ? [{ id: pageId }] : [],
    };
}
