import { buildRouteName, formatRouteDate } from "../../../utils/formatters.js";
import { buildOrderRouteDatabaseSchema } from "./databaseSchema.js";
import { getOrderRouteViewConfigs } from "./viewConfig.js";
import {
	findOrCreateChildPage,
	findOrCreateDatabaseInPage,
	lockNotionPage,
} from "../core/pageService.js";
import { deleteViewsExcept, findOrCreateView } from "../core/viewService.js";

function getDataSourceId(database) {
	return database?.data_sources?.[0]?.id ?? null;
}

function getViewSummary({ viewConfig, result }) {
	return {
		id: result.view.id,
		name: viewConfig.name,
	};
}

async function createOrLockRoutePage({ fromCountry, toCountry }) {
	const routeTitle = buildRouteName({
		fromCountry,
		toCountry,
	});

	const routeResult = await findOrCreateChildPage({
		parentPageId: process.env.NOTION_PAGE_ORDERS,
		title: routeTitle,
	});

	if (routeResult.created) {
		await lockNotionPage(routeResult.page.id);
	}

	return {
		routeTitle,
		routePage: routeResult.page,
		routeCreated: routeResult.created,
	};
}

async function createOrGetDateDatabase({ routePageId, dateTitle, toCountry }) {
	const databaseResult = await findOrCreateDatabaseInPage({
		pageId: routePageId,
		title: dateTitle,
		properties: buildOrderRouteDatabaseSchema({
			toCountry,
		}),
	});

	const databaseId = databaseResult.database.id;
	const dataSourceId = getDataSourceId(databaseResult.database);

	if (!dataSourceId) {
		throw new Error(
			`No dataSourceId found for order route database "${dateTitle}".`,
		);
	}

	return {
		database: databaseResult.database,
		databaseId,
		dataSourceId,
		databaseCreated: databaseResult.created,
	};
}

async function ensureSingleView({
	databaseId,
	dataSourceId,
	viewConfig,
	position,
}) {
	return findOrCreateView({
		databaseId,
		dataSourceId,
		name: viewConfig.name,
		type: "table",
		position,
		sorts: viewConfig.sorts,
		configuration: viewConfig.configuration,
		updateIfExists: true,
	});
}

async function ensureOrderRouteViews({
	databaseId,
	dataSourceId,
	toCountry,
	cleanDefaultView = false,
}) {
	const viewConfigs = getOrderRouteViewConfigs(toCountry);
	const allowedNames = viewConfigs.map((viewConfig) => viewConfig.name);

	const created = [];
	const updated = [];

	for (const [index, viewConfig] of viewConfigs.entries()) {
		const result = await ensureSingleView({
			databaseId,
			dataSourceId,
			viewConfig,
			position: index === 0 ? { type: "start" } : { type: "end" },
		});

		if (result.created) {
			created.push(getViewSummary({ viewConfig, result }));
			continue;
		}

		if (result.updated) {
			updated.push(getViewSummary({ viewConfig, result }));
		}
	}

	const deleted = cleanDefaultView
		? await deleteViewsExcept({
				databaseId,
				dataSourceId,
				allowedNames,
			})
		: [];

	return {
		created,
		updated,
		deleted,
		names: allowedNames,
	};
}

export async function createOrGetOrderRouteDatabase({
	fromCountry,
	toCountry,
	shipmentDate,
}) {
	const dateTitle = formatRouteDate(shipmentDate);

	const { routeTitle, routePage, routeCreated } = await createOrLockRoutePage(
		{
			fromCountry,
			toCountry,
		},
	);

	const { databaseId, dataSourceId, databaseCreated } =
		await createOrGetDateDatabase({
			routePageId: routePage.id,
			dateTitle,
			toCountry,
		});

	const views = await ensureOrderRouteViews({
		databaseId,
		dataSourceId,
		toCountry,
		cleanDefaultView: databaseCreated,
	});

	return {
		ok: true,

		routePageId: routePage.id,
		routeTitle,
		routeCreated,

		databaseId,
		dataSourceId,
		databaseTitle: dateTitle,
		databaseCreated,

		views,
	};
}
