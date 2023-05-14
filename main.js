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
		delete tripList.dataset.selectedTripId;
		tripList.replaceChildren(...trips);
		cartList.replaceChildren();
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

		const name = e.target.elements.name.value;

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

		const date = e.target.elements.date.value;
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
		const description = e.target.elements.description.value;
		const memo = e.target.elements.memo.value;
		const quantity = parseInt(e.target.elements.quantity.value);
		const price = parseFloat(e.target.elements.price.value).toFixed(2);
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
	function createNewStore({ id: storeId, name: storeName }) {
		console.log(storeId, storeName);
		const li = document.createElement("li");

		li.classList.add("nav-item");
		li.dataset.storeId = storeId;
		li.dataset.storeName = storeName;
		li.setAttribute("title", `Select ${storeName}`);

		const containerLink = document.createElement("a");
		containerLink.classList.add(
			"nav-link",
			"link-body-emphasis",
			"d-flex",
			"justify-content-between",
			"align-items-center"
		);

		const textContainerSpan = document.createElement("span");
		textContainerSpan.classList.add("d-flex", "justify-content-left");

		const shopIconSpan = document.createElement("span");
		shopIconSpan.classList.add("bi-shop", "margin-right-1");
		textContainerSpan.appendChild(shopIconSpan);

		containerLink.appendChild(textContainerSpan);

		containerLink.addEventListener("click", () => {
			displayTrips(storeId);
			selectStore(storeId, storeName);
		});

		const storeNameSpan = document.createElement("span");
		storeNameSpan.textContent = storeName;
		textContainerSpan.appendChild(storeNameSpan);

		const delBtn = document.createElement("button");
		delBtn.classList.add("btn", "btn-sm");
		delBtn.setAttribute("title", `delete ${name}`);

		const trashIconSpan = document.createElement("span");
		trashIconSpan.classList.add("bi", "bi-trash3", "text-danger");
		delBtn.appendChild(trashIconSpan);

		delBtn.addEventListener("click", (e) => {
			deleteStore(id);
			storeList.removeChild(li);
		});

		containerLink.appendChild(delBtn);

		li.appendChild(containerLink);

		return li;
	}

	// Create a new list element for a trip
	function createNewTrip({ id, date }) {
		const li = document.createElement("li");

		li.classList.add(
			"nav-link",
			"link-body-emphasis",
			"d-flex",
			"justify-content-between",
			"align-items-center"
		);
		li.dataset.tripId = id;
		li.setAttribute("title", `Select trip to {storename} on ${date}`);

		li.addEventListener("click", (e) => {
			displayCartItems(id);

			storeList.dataset.selectedStoreId = id;

			// Iterate through each trip list item and see if its id
			// matches the selected store id. If true, add class of "active".
			// If not, remove class of "active".
			for (const trip of tripList.children) {
				if (trip.dataset.tripId != id) trip.classList.remove("active");
				else trip.classList.add("active");
			}
		});

		const textContainerSpan = document.createElement("span");
		textContainerSpan.classList.add("d-flex", "justify-content-left");

		const tripIconSpan = document.createElement("span");
		tripIconSpan.classList.add("bi", "bi-calendar", "margin-right-1");
		textContainerSpan.appendChild(tripIconSpan);

		const tripDateSpan = document.createElement("span");
		tripDateSpan.textContent = date;
		textContainerSpan.appendChild(tripDateSpan);

		li.appendChild(textContainerSpan);

		const delBtn = document.createElement("button");
		delBtn.classList.add("btn", "btn-sm");
		delBtn.setAttribute("title", `delete ${date} trip`);

		const iconSpan = document.createElement("span");
		iconSpan.classList.add("bi", "bi-trash3", "text-danger");
		delBtn.appendChild(iconSpan);

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
		li.classList.add(
			"list-group-item",
			"d-flex",
			"justify-content-between",
			"align-items-center"
		);
		li.dataset.itemId = id;

		const descSpan = document.createElement("span");

		descSpan.textContent = description;

		li.appendChild(descSpan);

		const memoSpan = document.createElement("span");
		memoSpan.textContent = memo;
		li.appendChild(memoSpan);

		const quantityContainerSpan = document.createElement("span");
		const quantityContentSpan = document.createElement("span");
		quantityContentSpan.classList.add("align-middle");
		quantityContentSpan.textContent = quantity;

		const decBtn = document.createElement("button");
		decBtn.classList.add("btn", "align-middle");
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
		incBtn.classList.add("btn");
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
		delBtn.classList.add("btn", "btn-small");

		const iconSpan = document.createElement("span");
		iconSpan.classList.add("bi", "bi-trash3", "text-danger");
		delBtn.appendChild(iconSpan);

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

	function selectStore(storeId, storeName) {
		storeList.dataset.selectedStoreId = storeId;
		storeList.dataset.selectedStoreName = storeName;

		// Iterate through each store list item and see if its id
		// matches the selected store id. If true, add class of "active".
		// If not, remove class of "active".
		for (const store of storeList.children) {
			const anchor = store.querySelector("a");

			if (store.dataset.storeId != storeId) {
				anchor.classList.remove("active");
			} else {
				anchor.classList.add("active");
			}
		}
	}

	async function deleteStore(storeId) {
		try {
			const res = await fetch(`http://localhost:3000/stores/${storeId}`, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
			});

			const data = await res.json();
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
