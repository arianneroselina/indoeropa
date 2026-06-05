import {
    mapCountries,
    mapDhlTiers,
    mapPackageTypes,
    mapRouteDates,
    mapSettings,
    mapSizePresets,
} from "./mappers.js";
import { queryAllDataSourceRows } from "./pageService.js";

export async function getShippingData() {
    const [
        countryRows,
        packageTypeRows,
        sizePresetRows,
        dhlTierRows,
        routeDateRows,
        settingsRows,
    ] = await Promise.all([
        queryAllDataSourceRows(process.env.NOTION_DB_COUNTRIES),
        queryAllDataSourceRows(process.env.NOTION_DB_PACKAGE_TYPES),
        queryAllDataSourceRows(process.env.NOTION_DB_SIZE_PRESETS),
        queryAllDataSourceRows(process.env.NOTION_DB_DHL_TIERS),
        queryAllDataSourceRows(process.env.NOTION_DB_ROUTE_DATES),
        queryAllDataSourceRows(process.env.NOTION_DB_SETTINGS),
    ]);

    const settings = mapSettings(settingsRows);

    return {
        COUNTRIES: mapCountries(countryRows),
        PACKAGE_TYPES: mapPackageTypes(packageTypeRows),
        SIZE_PRESETS: mapSizePresets(sizePresetRows),
        DHL_TIERS: mapDhlTiers(dhlTierRows),
        ROUTE_DATES: mapRouteDates(routeDateRows),
        EUR_TO_IDR_RATE: settings.EUR_TO_IDR_RATE ?? null,
    };
}
