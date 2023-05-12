document.addEventListener("DOMContentLoaded", async () => {
	// First, get the references to 3 ul lists.
	const storeContainer = document.querySelector("ul#store-list");
	const tripContainer = document.querySelector("ul#trip-list");
	const cartContainer = document.querySelector("ul#cart-list");

	// Then, make a fetch request to http://localhost:3000/stores.
	const res = await fetch("http://localhost:3000/stores");
	const stores = await res.json();

	// Iterate through each store and create an list item element to display
	const listItems = stores.map(({ id, name, trips }) => {
		const storeEl = document.createElement("li");
		storeEl.textContent = name;

		// Clicking on the store name will display the list of trips
		storeEl.addEventListener("click", (e) => {
			// Iterate through each store trip and create a list element
			const storeTrips = trips.map(({ date, items, total_spent }) => {
				const tripEl = document.createElement("li");
				tripEl.textContent = date;

				tripEl.addEventListener("click", (e) => {
					const cartItems = items.map(({ name }) => {
						const cartEl = document.createElement("li");

						cartEl.textContent = name;

						return cartEl;
					});

					// Update the cart list
					cartContainer.replaceChildren(...cartItems);
				});

				return tripEl;
			});

			// Update the trip list
			tripContainer.replaceChildren(...storeTrips);
		});

		return storeEl;
	});

	// Append the stores to ul
	storeContainer.append(...listItems);
});
