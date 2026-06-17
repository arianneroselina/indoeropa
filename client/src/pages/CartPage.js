import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowRight, FaCheck, FaTrash } from "react-icons/fa";
import { CART_KEY, CHECKOUT_CART_KEY } from "../utils/constants";
import { ShipmentMeta } from "../components/shipping/ShipmentMeta";
import { formatOptionalEUR } from "../utils/formatters";

const getItemRoute = (item) => {
	return `${item?.fromCountry}_${item?.toCountry}` ?? "";
};

const CartPage = () => {
	const navigate = useNavigate();
	const [cartItems, setCartItems] = useState([]);
	const [selectedItemKeys, setSelectedItemKeys] = useState([]);

	useEffect(() => {
		try {
			const saved = localStorage.getItem(CART_KEY);

			if (saved) {
				const parsedCart = JSON.parse(saved);
				setCartItems(parsedCart);

				const routes = [
					...new Set(parsedCart.map(getItemRoute).filter(Boolean)),
				];

				// If all cart items have the same route, preselect them.
				// If mixed routes exist, let the user choose manually.
				if (routes.length === 1) {
					setSelectedItemKeys(parsedCart.map((item) => item.key));
				}
			}
		} catch {
			// ignore
		}
	}, []);

	const selectedItems = useMemo(() => {
		return cartItems.filter((item) => selectedItemKeys.includes(item.key));
	}, [cartItems, selectedItemKeys]);

	const selectedRoute = useMemo(() => {
		if (!selectedItems.length) return null;
		return getItemRoute(selectedItems[0]);
	}, [selectedItems]);

	const uniqueRoutes = useMemo(() => {
		return [...new Set(cartItems.map(getItemRoute).filter(Boolean))];
	}, [cartItems]);

	const hasOnlyOneRoute = uniqueRoutes.length === 1;

	const allCartItemKeys = useMemo(() => {
		return cartItems.map((item) => item.key);
	}, [cartItems]);

	const allItemsSelected =
		cartItems.length > 0 &&
		allCartItemKeys.every((key) => selectedItemKeys.includes(key));

	const calculateTotalPrice = (items) => {
		return items.reduce(
			(total, item) => total + (Number(item.priceEUR) || 0),
			0,
		);
	};

	const handleToggleItem = (item, index) => {
		const itemRoute = getItemRoute(item);
		const isSelected = selectedItemKeys.includes(item.key);

		if (!isSelected && selectedRoute && itemRoute !== selectedRoute) {
			return;
		}

		setSelectedItemKeys((prev) =>
			isSelected
				? prev.filter((key) => key !== item.key)
				: [...prev, item.key],
		);
	};

	const handleToggleAllItems = () => {
		if (!hasOnlyOneRoute) return;

		if (allItemsSelected) {
			setSelectedItemKeys([]);
			return;
		}

		setSelectedItemKeys(allCartItemKeys);
	};

	const handleRemoveItem = (index) => {
		const updatedCart = cartItems.filter((_, i) => i !== index);

		setCartItems(updatedCart);
		setSelectedItemKeys((prev) =>
			prev.filter((key) => key !== cartItems[index].key),
		);

		localStorage.setItem(CART_KEY, JSON.stringify(updatedCart));
	};

	const goNext = () => {
		if (!selectedItems.length) return;

		localStorage.setItem(CHECKOUT_CART_KEY, JSON.stringify(selectedItems));

		navigate(
			selectedItems.some((item) => item?.duty === true)
				? "/invoices"
				: "/checkout",
		);
	};

	return (
		<section className="py-24 bg-white">
			<div className="max-w-screen-xl mx-auto px-4">
				<h2 className="text-4xl font-semibold text-center mb-6">
					YOUR CART
				</h2>

				{!cartItems.length ? (
					<div className="subtext text-center text-lg text-gray-600">
						Your cart is empty.{" "}
						<Link
							to="/shipment"
							className="text-secondary font-semibold"
						>
							Schedule a shipment
						</Link>{" "}
						to begin.
					</div>
				) : (
					<div className="space-y-8">
						<div className="rounded-2xl border bg-gray-50 p-4 text-sm text-gray-600">
							<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
								<div>
									{selectedRoute ? (
										<>
											Selected checkout route:{" "}
											<span className="font-semibold text-gray-900">
												{selectedRoute}
											</span>
											. You can only select items with the
											same route for one checkout.
										</>
									) : (
										<>
											Select the shipment items you want
											to bring to checkout. One checkout
											can only contain items from the same
											route.
										</>
									)}
								</div>

								{hasOnlyOneRoute && (
									<button
										type="button"
										onClick={handleToggleAllItems}
										className={`inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold transition ${
											allItemsSelected
												? "border-secondary bg-secondary text-white hover:bg-secondary/90"
												: "border-gray-300 bg-white text-gray-700 hover:border-secondary hover:text-secondary"
										}`}
									>
										{allItemsSelected
											? "Deselect all"
											: "Select all"}
									</button>
								)}
							</div>
						</div>

						<div className="space-y-4">
							{cartItems.map((item, index) => {
								const itemRoute = getItemRoute(item);
								const isSelected = selectedItemKeys.includes(
									item.key,
								);

								const isDifferentRoute =
									selectedRoute &&
									itemRoute !== selectedRoute &&
									!isSelected;

								return (
									<div
										key={item.key}
										onClick={() => {
											if (!isDifferentRoute) {
												handleToggleItem(item, index);
											}
										}}
										role="button"
										tabIndex={isDifferentRoute ? -1 : 0}
										onKeyDown={(e) => {
											if (isDifferentRoute) return;

											if (
												e.key === "Enter" ||
												e.key === " "
											) {
												e.preventDefault();
												handleToggleItem(item, index);
											}
										}}
										className={`rounded-2xl border bg-white shadow-sm p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition ${
											isSelected
												? "border-secondary ring-1 ring-secondary"
												: "border-gray-200"
										} ${
											isDifferentRoute
												? "opacity-40 bg-gray-50 cursor-not-allowed"
												: "cursor-pointer hover:shadow-md"
										}`}
									>
										{/* LEFT: Checkbox + Main info */}
										<div className="flex items-start gap-4">
											<button
												type="button"
												disabled={isDifferentRoute}
												onClick={(e) => {
													e.stopPropagation();
													handleToggleItem(
														item,
														index,
													);
												}}
												className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 ${
													isSelected
														? "border-secondary bg-secondary text-white shadow-sm"
														: "border-gray-300 bg-white text-transparent hover:border-secondary hover:bg-secondary/10"
												} ${
													isDifferentRoute
														? "cursor-not-allowed opacity-60 hover:border-gray-300 hover:bg-white"
														: "cursor-pointer"
												}`}
												aria-label={
													isSelected
														? "Deselect item"
														: "Select item"
												}
											>
												<FaCheck className="text-xs" />
											</button>

											<ShipmentMeta
												item={item}
												showDateChip={true}
												showDetailChip={true}
												compact={false}
											/>
										</div>

										{/* RIGHT: Price + Actions */}
										<div className="flex items-center justify-between md:justify-end gap-4">
											<div className="text-right">
												<div className="text-lg font-bold text-gray-900">
													{formatOptionalEUR(
														item.priceEUR,
													)}
												</div>
											</div>

											<button
												onClick={(e) => {
													e.stopPropagation();
													handleRemoveItem(index);
												}}
												className="w-9 h-9 flex items-center justify-center rounded-xl hover:text-secondary transition"
												title="Remove item"
											>
												<FaTrash className="text-sm" />
											</button>
										</div>
									</div>
								);
							})}
						</div>

						<div className="flex justify-end mt-6">
							<p className="text-xl font-semibold">
								Selected total:{" "}
								{formatOptionalEUR(
									calculateTotalPrice(selectedItems),
								)}
							</p>
						</div>

						<div className="mt-6 flex justify-end gap-4">
							<Link to="/shipment" className="button-secondary">
								Create another shipment
							</Link>

							<button
								type="button"
								onClick={goNext}
								disabled={!selectedItems.length}
								className={`button-primary font-semibold ${
									!selectedItems.length
										? "opacity-50 cursor-not-allowed"
										: ""
								}`}
							>
								Proceed to Checkout
								<FaArrowRight className="ml-2 text-sm" />
							</button>
						</div>
					</div>
				)}
			</div>
		</section>
	);
};

export default CartPage;
