import "dotenv/config";
import { migrateOrderRouteDate } from "../src/services/notion/orderRoute/migrationService.js";
import { formatRouteDate } from "../src/utils/formatters.js";

const [fromCountry, toCountry, shipmentDate] = process.argv.slice(2);

if (!fromCountry || !toCountry || !shipmentDate) {
	console.error(
		"Usage: node scripts/migrate-order-route-date.js <fromCountry> <toCountry> <shipmentDate>",
	);
	console.error(
		"Example: node scripts/migrate-order-route-date.js ID DE 2026-06-12",
	);
	process.exit(1);
}

try {
	const result = await migrateOrderRouteDate({
		fromCountry,
		toCountry,
		shipmentDate,
		dateTitle: formatRouteDate(shipmentDate),
	});

	console.log("Migration finished:");
	console.dir(result, { depth: null });
} catch (err) {
	console.error("Migration failed:");
	console.error(err);
	process.exit(1);
}
