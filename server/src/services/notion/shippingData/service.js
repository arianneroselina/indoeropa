import {
	mapCountries,
	mapDhlTiers,
	mapPackageTypes,
	mapPaymentMethods,
	mapRouteDates,
	mapSettings,
	mapSizePresets,
} from "./mappers.js";
import { queryAllDataSourceRows } from "../core/pageService.js";

export async function getShippingData() {
	const [
		countryRows,
		packageTypeRows,
		sizePresetRows,
		dhlTierRows,
		routeDateRows,
		paymentMethodRows,
		settingsRows,
	] = await Promise.all([
		queryAllDataSourceRows(process.env.NOTION_DB_COUNTRIES),
		queryAllDataSourceRows(process.env.NOTION_DB_PACKAGE_TYPES),
		queryAllDataSourceRows(process.env.NOTION_DB_SIZE_PRESETS),
		queryAllDataSourceRows(process.env.NOTION_DB_DHL_TIERS),
		queryAllDataSourceRows(process.env.NOTION_DB_ROUTE_DATES),
		queryAllDataSourceRows(process.env.NOTION_DB_PAYMENT_METHODS),
		queryAllDataSourceRows(process.env.NOTION_DB_SETTINGS),
	]);

	const settings = mapSettings(settingsRows);

	return {
		COUNTRIES: mapCountries(countryRows),
		PACKAGE_TYPES: mapPackageTypes(packageTypeRows),
		SIZE_PRESETS: mapSizePresets(sizePresetRows),
		DHL_TIERS: mapDhlTiers(dhlTierRows),
		ROUTE_DATES: mapRouteDates(routeDateRows),
		PAYMENTS_METHODS: mapPaymentMethods(paymentMethodRows),
		EUR_TO_IDR_RATE: settings.EUR_TO_IDR_RATE ?? null,
	};
}
