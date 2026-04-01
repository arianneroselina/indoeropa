import { useEffect, useState } from "react";
import { fetchShippingData } from "../api/shippingDataApi";

export function useShippingData() {
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		fetchShippingData()
			.then((result) => setData(result))
			.catch((err) =>
				setError(err.message || "Failed to load shipping data"),
			)
			.finally(() => setLoading(false));
	}, []);

	return { data, loading, error };
}
