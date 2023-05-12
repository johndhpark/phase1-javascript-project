document.addEventListener("DOMContentLoaded", async () => {
	const storeList = document.querySelector("ul#store-list");
	const tripList = document.querySelector("ul#trip-list");
	const cartList = document.querySelector("ul#cart-list");

	const cartForm = document.querySelector("form#cart-form");
	const tripForm = document.querySelector("form#trip-form");
	const storeForm = document.querySelector("form#store-form");

	displayStores();

	// Add the submit event listeners to forms
	cartForm.addEventListener("submit", submitItem);
	tripForm.addEventListener("submit", submitTrip);
	storeForm.addEventListener("submit", submitStore);

	/* ===========================================================
		
	EVENT HANDLERS
	
	=========================================================== */

	async function displayStores() {
		// Then, make a fetch request to http://localhost:3000/stores.
		const res = await fetch("http://localhost:3000/stores");
		const data = await res.json();

		// Iterate through each store and create an list item element to display
		const stores = data.map((store) => createNewStore(store));

		// Append the stores to ul
		cartList.replaceChildren();
		storeList.replaceChildren(...stores);
	}

	async function displayTrips(storeId) {
		const res = await fetch("http://localhost:3000/trips");
		const data = await res.json();

		// Iterate through each store trip and create a list element
		const trips = data
			.filter((trip) => parseInt(trip.storeId) === storeId)
			.map((trip) => createNewTrip(trip));

		// Update the trip list
		cartList.replaceChildren();
		tripList.replaceChildren(...trips);
		tripList.dataset.storeId = storeId;
	}

	async function displayCartItems(tripId) {
		const res = await fetch("http://localhost:3000/items");
		const items = await res.json();

		// Iterate throgh each cart item and create a list element
		const cartItems = items
			.filter((item) => parseInt(item.tripId) === tripId)
			.map((item) => createNewItem(item));

		// Update the cart list
		cartList.replaceChildren(...cartItems);
		cartList.dataset.tripId = tripId;
	}

	async function submitItem(e) {
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

			const item = await res.json();
			const listEl = createNewItem(item);
			cartList.append(listEl);

			e.target.reset();
		} catch (error) {
			console.error(error);
		}
	}

	async function submitTrip(e) {
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

			const newTrip = await res.json();
			const listEl = createNewTrip(newTrip);
			tripList.append(listEl);
		} catch (error) {
			console.error(error);
		}
	}

	async function submitStore(e) {
		e.preventDefault();

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

			const newStore = await res.json();
			const listEl = createNewStore(newStore);
			storeList.append(listEl);

			console.log("Store has been successfully created: ", data);
		} catch (error) {}
	}

	// Creates a new list element for cart item
	function createNewItem({ id, description }) {
		console.log(id);

		const li = document.createElement("li");
		const delBtn = document.createElement("button");
		delBtn.textContent = "delete";
		delBtn.addEventListener("click", async (e) => {
			e.preventDefault();

			try {
				await fetch(`http://localhost:3000/items/${id}`, {
					method: "DELETE",
					headers: {
						"Content-Type": "application/json",
					},
				});

				filterRemovedItem(li);
			} catch (error) {
				console.error(error);
			}
		});

		li.textContent = description;
		li.appendChild(delBtn);

		return li;
	}

	// Create a new list element for a trip
	function createNewTrip({ id, date }) {
		const li = document.createElement("li");
		li.textContent = date;

		li.addEventListener("click", () => displayCartItems(id));
		return li;
	}

	// Create a new list eleemnt for store
	function createNewStore({ id, name }) {
		const li = document.createElement("li");
		li.textContent = name;

		li.addEventListener("click", () => displayTrips(id));
		return li;
	}

	// Filter the removed item from the cart list
	function filterRemovedItem(li) {
		cartList.removeChild(li);
	}
});
