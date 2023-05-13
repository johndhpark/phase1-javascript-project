document.addEventListener("DOMContentLoaded", async () => {
	const storeList = document.querySelector("#store-list");
	const tripList = document.querySelector("#trip-list");
	const cartList = document.querySelector("#cart-list");

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
		storeList.dataset.selectedStoreId = storeId;
	}

	async function displayCartItems(tripId) {
		const res = await fetch("http://localhost:3000/items");
		const items = await res.json();

		// Iterate throgh each cart item and create a list element
		const cartItems = items
			.filter((item) => parseInt(item.tripId) === tripId)
			.map((item) => createNewCartItem(item));

		// Update the cart list
		cartList.replaceChildren(...cartItems);
		tripList.dataset.selectedTripId = tripId;
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

			storeList.dataset.selectedStoreId = newStore.id;

			tripList.replaceChildren();
			cartList.replaceChildren();

			delete tripList.dataset.selectedTripId;

			storeList.append(listEl);

			e.target.reset();
		} catch (error) {
			console.error(error);
		}
	}

	async function submitTrip(e) {
		e.preventDefault();

		const date = e.target.elements["date"].value;
		const storeId = parseInt(storeList.dataset.selectedStoreId);

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
			e.target.reset();
		} catch (error) {
			console.error(error);
		}
	}

	async function submitItem(e) {
		e.preventDefault();

		// Get the form data
		const description = e.target.elements["description"].value;
		const memo = e.target.elements["memo"].value;
		const quantity = parseInt(e.target.elements["quantity"].value);
		const price = parseFloat(e.target.elements["price"].value).toFixed(2);
		const tripId = parseInt(tripList.dataset.selectedTripId);
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
			const listEl = createNewCartItem(item);
			cartList.append(listEl);
			e.target.reset();
		} catch (error) {
			console.error(error);
		}
	}

	// Create a new list eleemnt for store
	function createNewStore({ id, name }) {
		const li = document.createElement("li");
		li.textContent = name;
		li.classList.add("list-group-item", "list-group-item-action");

		li.addEventListener("click", () => displayTrips(id));

		const delBtn = document.createElement("button");
		delBtn.textContent = "delete store";

		delBtn.addEventListener("click", (e) => {
			deleteStore(id);
			storeList.removeChild(li);
		});

		li.appendChild(delBtn);

		return li;
	}

	// Create a new list element for a trip
	function createNewTrip({ id, date }) {
		const li = document.createElement("li");
		li.textContent = date;

		li.addEventListener("click", (e) => {
			displayCartItems(id);
		});

		const delBtn = document.createElement("button");
		delBtn.textContent = "delete trip";

		delBtn.addEventListener("click", (e) => {
			deleteTrip(id);
			tripList.remove(li);
		});

		li.appendChild(delBtn);

		return li;
	}

	// Creates a new list element for cart item
	function createNewCartItem({ id, description, memo, quantity, price }) {
		const li = document.createElement("li");

		li.dataset.itemId = id;

		const descSpan = document.createElement("span");

		descSpan.textContent = memo;

		li.appendChild(descSpan);

		const memoSpan = document.createElement("span");
		memoSpan.textContent = description;
		li.appendChild(memoSpan);

		const quantityContainerSpan = document.createElement("span");
		const quantityContentSpan = document.createElement("span");
		quantityContentSpan.textContent = quantity;

		const decBtn = document.createElement("button");
		decBtn.textContent = "-";
		decBtn.addEventListener("click", async (e) => {
			quantity -= 1;

			// If the quantity is zero, we just delete the cart item
			if (quantity === 0) {
				deleteCartItem(id);
				cartList.removeChild(li);
			} else {
				updateItemQuantity(id, quantity);

				quantityContentSpan.textContent = quantity;
			}
		});

		const incBtn = document.createElement("button");
		incBtn.textContent = "+";
		incBtn.addEventListener("click", async (e) => {
			quantity = parseInt(quantity) + 1;

			updateItemQuantity(id, quantity);

			quantityContentSpan.textContent = quantity;
		});

		quantityContainerSpan.appendChild(decBtn);
		quantityContainerSpan.appendChild(quantityContentSpan);
		quantityContainerSpan.appendChild(incBtn);

		li.appendChild(quantityContainerSpan);

		const delBtn = document.createElement("button");
		delBtn.textContent = "delete item";
		delBtn.addEventListener("click", (e) => {
			deleteCartItem(id);
			cartList.removeChild(li);
		});

		const priceSpan = document.createElement("span");
		priceSpan.textContent = `$${price}`;
		li.appendChild(priceSpan);

		li.appendChild(delBtn);

		return li;
	}

	async function deleteCartItem(itemId) {
		try {
			await fetch(`http://localhost:3000/items/${itemId}`, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
			});
		} catch (error) {
			console.error(error);
		}
	}

	async function deleteTrip(tripId) {
		try {
			await fetch(`http://localhost:3000/trips/${tripId}`, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
			});
		} catch (error) {
			console.error(error);
		}
	}

	async function deleteStore(storeId) {
		try {
			await fetch(`http://localhost:3000/stores/${storeId}`, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
			});
		} catch (error) {
			console.error(error);
		}
	}

	async function updateItemQuantity(itemId, quantity) {
		try {
			await fetch(`http://localhost:3000/items/${itemId}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
				},
				body: JSON.stringify({
					quantity,
				}),
			});
		} catch (error) {
			console.error(error);
		}
	}
});
