document.addEventListener("DOMContentLoaded", async () => {
	const storeList = document.querySelector("ul#store-list");
	const tripList = document.querySelector("ul#trip-list");
	const cartList = document.querySelector("ul#cart-list");

	const cartForm = document.querySelector("form#cart-form");
	const tripForm = document.querySelector("form#trip-form");
	const storeForm = document.querySelector("form#store-form");

	// Then, make a fetch request to http://localhost:3000/stores.
	const res = await fetch("http://localhost:3000/stores");
	const data = await res.json();

	// Iterate through each store and create an list item element to display
	const stores = data.map(({ id, name }) => {
		const store = document.createElement("li");
		store.textContent = name;

		// Clicking on the store name will display the list of trips
		store.addEventListener("click", (e) => displayTrips(id));
		return store;
	});

	// Append the stores to ul
	cartList.replaceChildren();
	storeList.replaceChildren(...stores);

	// Add the submit event listeners to forms
	cartForm.addEventListener("submit", addItem);
	tripForm.addEventListener("submit", addTrip);
	storeForm.addEventListener("submit", addStore);

	/*
		EVENT HANDLERS
	*/

	async function displayTrips(storeId) {
		const res = await fetch("http://localhost:3000/trips");
		const data = await res.json();

		// Iterate through each store trip and create a list element
		const trips = data
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
		cartList.replaceChildren();
		tripList.replaceChildren(...trips);
		tripList.dataset.storeId = storeId;
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
		cartList.replaceChildren(...cartItems);
		cartList.dataset.tripId = tripId;
	}

	async function addItem(e) {
		e.preventDefault();

		// Get the form data
		const description = e.target.elements["description"].value;
		const memo = e.target.elements["memo"].value;
		const quantity = e.target.elements["quantity"].value;
		const price = parseFloat(e.target.elements["price"].value).toFixed(2);
		const tripId = cartList.dataset.tripId;
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
			console.error(error);
		}
	}

	async function addTrip(e) {
		e.preventDefault();

		const date = e.target.elements["date"].value;
		const storeId = tripList.dataset.storeId;

		try {
			const res = await fetch("http://localhost:3000/trips", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
				},
				body: JSON.stringify({
					date,
					storeId,
				}),
			});

			const data = await res.json();

			console.log("trip has been successfully created ", data);
		} catch (error) {
			console.error(error);
		}
	}

	async function addStore(e) {
		e.preventDefault();

		console.log("store form submitted");

		const name = e.target.elements["name"].value;

		try {
			const res = await fetch("http://localhost:3000/stores", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
				},
				body: JSON.stringify({
					name,
				}),
			});

			const data = await res.json();

			console.log("Store has been successfully created: ", data);
		} catch (error) {}
	}
});
