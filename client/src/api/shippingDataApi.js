import { API_BASE } from "../utils/constants";

let shippingDataPromise = null;

export async function fetchShippingData() {
	if (!shippingDataPromise) {
		shippingDataPromise = fetch(
			`${API_BASE}/api/notion/shipping-data`,
		).then((res) => {
			if (!res.ok) {
				throw new Error("Failed to fetch shipping data");
			}
			return res.json();
		});
	}

	return shippingDataPromise;
}
