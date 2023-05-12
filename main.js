document.addEventListener("DOMContentLoaded", async () => {
	const storeContainer = document.querySelector("ul#store-list");
	const tripContainer = document.querySelector("ul#trip-list");
	const cartContainer = document.querySelector("ul#cart-list");

	const cartForm = document.querySelector("form#cart-form");

	// Then, make a fetch request to http://localhost:3000/stores.
	const res = await fetch("http://localhost:3000/stores");
	const stores = await res.json();

	// Iterate through each store and create an list item element to display
	const tripList = stores.map(({ id, name }) => {
		const storeEl = document.createElement("li");
		storeEl.textContent = name;

		// Clicking on the store name will display the list of trips
		storeEl.addEventListener("click", (e) => {
			displayStoreTrips(id);
		});
		return storeEl;
	});

	// Append the stores to ul
	cartContainer.replaceChildren();
	storeContainer.replaceChildren(...tripList);

	cartForm.addEventListener("submit", addNewCartItem);

	/*
		EVENT HANDLERS
	*/

	async function displayStoreTrips(storeId) {
		const res = await fetch("http://localhost:3000/trips");
		const trips = await res.json();

		// Iterate through each store trip and create a list element
		const storeTrips = trips
			.filter((trip) => parseInt(trip.storeId) === storeId)
			.map(({ id, date }) => {
				const tripEl = document.createElement("li");
				tripEl.textContent = date;

				tripEl.addEventListener("click", (e) => {
					displayCartItems(id);
				});

				return tripEl;
			});

		// Update the trip list
		cartContainer.replaceChildren();
		tripContainer.replaceChildren(...storeTrips);
	}

	async function displayCartItems(tripId) {
		const res = await fetch("http://localhost:3000/items");
		const items = await res.json();

		console.log(items);

		// Iterate throgh each cart item and create a list element
		const cartItems = items
			.filter((item) => parseInt(item.tripId) === tripId)
			.map(({ description }) => {
				const cartEl = document.createElement("li");
				cartEl.textContent = description;
				return cartEl;
			});

		// Update the cart list
		console.log(cartItems);
		cartContainer.replaceChildren(...cartItems);
	}

	async function addNewCartItem(e) {
		e.preventDefault();

		// Get the form data
		const description = e.target.elements["description"].value;
		const memo = e.target.elements["memo"].value;
		const quantity = e.target.elements["quantity"].value;
		const price = parseFloat(e.target.elements["price"].value).toFixed(2);
		const tripId = tripContainer.dataset.storeId;
		const purchased = false;

		try {
			const res = await fetch("http://localhost:3000/items", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
				},
				body: JSON.stringify({
					description,
					tripId,
					memo,
					quantity,
					price,
					purchased,
				}),
			});

			const data = await res.json();
			console.log("item has successfully been added to the cart ", data);

			e.target.reset();
		} catch (error) {
			console.log(error);
		}
	=}
});
