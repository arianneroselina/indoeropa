import { notion } from "./client.js";

export async function listViews({ databaseId, dataSourceId }) {
	const views = [];
	let startCursor = undefined;
	let hasMore = true;

	while (hasMore) {
		const response = await notion.views.list({
			...(databaseId ? { database_id: databaseId } : {}),
			...(dataSourceId ? { data_source_id: dataSourceId } : {}),
			page_size: 100,
			start_cursor: startCursor,
		});

		views.push(...(response.results || []));

		hasMore = response.has_more;
		startCursor = response.next_cursor ?? undefined;
	}

	return views;
}

export async function listFullViews({ databaseId, dataSourceId }) {
	const viewRefs = await listViews({
		databaseId,
		dataSourceId,
	});

	const fullViews = [];

	for (const viewRef of viewRefs) {
		const fullView = await notion.views.retrieve({
			view_id: viewRef.id,
		});
		fullViews.push(fullView);
	}

	return fullViews;
}

export async function createView({
	databaseId,
	dataSourceId,
	name,
	type = "table",
	position,
	filter,
	sorts,
	configuration,
}) {
	return notion.views.create({
		database_id: databaseId,
		data_source_id: dataSourceId,
		name,
		type,
		...(position ? { position } : {}),
		...(filter ? { filter } : {}),
		...(sorts ? { sorts } : {}),
		...(configuration ? { configuration } : {}),
	});
}

export async function findViewByName({ databaseId, dataSourceId, name }) {
	const views = await listFullViews({
		databaseId,
		dataSourceId,
	});

	return views.find((view) => view.name === name) ?? null;
}

export async function findOrCreateView({
	databaseId,
	dataSourceId,
	name,
	type = "table",
	position,
	filter,
	sorts,
	configuration,
	updateIfExists = true,
}) {
	const existing = await findViewByName({
		databaseId,
		dataSourceId,
		name,
	});

	if (existing) {
		const view = updateIfExists
			? await notion.views.update({
					view_id: existing.id,
					filter,
					sorts,
					configuration,
					...(name ? { name } : {}),
					...(filter !== undefined ? { filter } : {}),
					...(sorts !== undefined ? { sorts } : {}),
					...(configuration !== undefined ? { configuration } : {}),
				})
			: existing;

		return {
			view,
			created: false,
			updated: updateIfExists,
		};
	}

	const created = await createView({
		databaseId,
		dataSourceId,
		name,
		type,
		position,
		filter,
		sorts,
		configuration,
	});

	return {
		view: created,
		created: true,
		updated: false,
	};
}

export async function deleteViewsExcept({
	databaseId,
	dataSourceId,
	allowedNames,
}) {
	const views = await listFullViews({
		databaseId,
		dataSourceId,
	});

	const deleted = [];

	for (const view of views) {
		if (allowedNames.includes(view.name)) {
			continue;
		}

		await notion.views.delete({
			view_id: view.id,
		});

		deleted.push({
			id: view.id,
			name: view.name ?? null,
		});
	}

	return deleted;
}
