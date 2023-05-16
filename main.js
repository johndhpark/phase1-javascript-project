document.addEventListener("DOMContentLoaded", () => {
	const storeList = document.querySelector("#store-list");
	const tripList = document.querySelector("#trip-list");
	const cartTable = document.querySelector("#cart-table tbody");

	const storeForm = document.querySelector("form#storeForm");
	const tripForm = document.querySelector("form#tripForm");
	const cartForm = document.querySelector("form#cartForm");

	const newStoreModal = document.getElementById("newStoreModal");
	const newTripModal = document.getElementById("newTripModal");
	const newCartItemModal = document.getElementById("newCartItemModal");

	displayStores();

	// Add event listeners to new store modal
	newStoreModal.addEventListener("shown.bs.modal", () => {
		const storeNameInput = document.getElementById("storeNameInput");
		storeNameInput.focus();
	});

	newStoreModal.addEventListener("hide.bs.modal", () => {
		const newStoreForm = document.getElementById("storeForm");
		newStoreForm.reset();
	});

	// Add event listeners to new trip modal
	newTripModal.addEventListener("shown.bs.modal", () => {
		const tripDateInput = document.getElementById("tripDateInput");

		tripDateInput.focus();
	});

	newTripModal.addEventListener("hide.bs.modal", () => {
		const newTripForm = document.getElementById("tripForm");
		newTripForm.reset();
	});

	// Add event listeners to new trip modal
	newCartItemModal.addEventListener("shown.bs.modal", () => {
		const descriptionInput = document.getElementById("descriptionInput");

		descriptionInput.focus();
	});

	newCartItemModal.addEventListener("hide.bs.modal", () => {
		const newCartItemForm = document.getElementById("cartForm");
		newCartItemForm.reset();
	});

	// Add the submit event listeners to forms

	storeForm.addEventListener("submit", submitStore);
	tripForm.addEventListener("submit", submitTrip);
	cartForm.addEventListener("submit", submitItem);

	/* ===========================================================
		
	EVENT HANDLERS
	
	=========================================================== */
	async function displayStores() {
		try {
			// Then, make a fetch request to http://localhost:3000/stores.
			const res = await fetch("http://localhost:3000/stores");
			const stores = await res.json();

			// Iterate through each store and create an list item element to display
			const storeItems = stores.map((store) => createNewStore(store));

			// Append the stores to ul
			// cartTable.replaceChildren();
			storeList.replaceChildren(...storeItems);
		} catch (error) {
			console.error(error);
		}
	}

	async function displayTrips(storeId) {
		try {
			const res = await fetch("http://localhost:3000/trips");
			const trips = await res.json();

			// Iterate through each store trip and create a list element
			const tripItems = trips
				.filter((trip) => parseInt(trip.storeId) === storeId)
				.map((trip) => createNewTrip(trip));

			tripList.replaceChildren(...tripItems);
		} catch (error) {
			console.error(error);
		}
	}

	async function displayCart(tripId) {
		try {
			const res = await fetch("http://localhost:3000/items");
			const items = await res.json();

			// Iterate throgh each cart item and create a list element
			const cartItems = items
				.filter((item) => parseInt(item.tripId) === tripId)
				.map((item) => createNewCartItem(item));

			// Update the cart list
			cartTable.replaceChildren(...cartItems);
		} catch (error) {
			console.error(error);
		}
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
			const { id } = newStore;

			const listEl = createNewStore(newStore);

			storeList.dataset.activeStoreId = newStore.id;

			tripList.replaceChildren();
			cartTable.replaceChildren();

			delete tripList.dataset.activeTripId;

			// Clear the new store form
			e.target.reset();

			// Close the new store modal
			const newStoreModalBSInstance =
				bootstrap.Modal.getInstance(newStoreModal);
			newStoreModalBSInstance.hide();

			// Append the new store to the store list
			storeList.append(listEl);

			selectStore(id, name);
		} catch (error) {
			console.error(error);
		}
	}

	async function submitTrip(e) {
		e.preventDefault();

		const date = e.target.elements.date.value;
		const storeId = parseInt(storeList.dataset.activeStoreId);

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
			const { id } = newTrip;

			const listEl = createNewTrip(newTrip);

			e.target.reset();

			// Close the new trip modal
			const newTripBSInstance = bootstrap.Modal.getInstance(newTripModal);
			newTripBSInstance.hide();

			// Append the new trip to the trip list
			tripList.append(listEl);
			selectTrip(id, date);
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
		const unitPrice = parseFloat(e.target.elements.unitPrice.value).toFixed(2);
		const tripId = parseInt(tripList.dataset.activeTripId);
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
					unitPrice,
					purchased,
				}),
			});

			const item = await res.json();
			const listEl = createNewCartItem(item);

			e.target.reset();

			// Close the new cart item modal
			const newCartItemBSInstance =
				bootstrap.Modal.getInstance(newCartItemModal);
			newCartItemBSInstance.hide();

			// Append the new cart to the cart list
			cartTable.append(listEl);
		} catch (error) {
			console.error(error);
		}
	}

	// Create a new list eleemnt for store
	function createNewStore({ id: storeId, name: storeName }) {
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

		containerLink.appendChild(textContainerSpan);

		containerLink.addEventListener("click", () => {
			selectStore(storeId, storeName);
			displayTrips(storeId);
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

		delBtn.addEventListener("click", (e) => deleteStore(storeId));

		containerLink.appendChild(delBtn);

		li.appendChild(containerLink);

		return li;
	}

	// Create a new list element for a trip
	function createNewTrip({ id: tripId, date: tripDate }) {
		const storeName = storeList.dataset.activeStoreName;

		const li = document.createElement("li");
		li.classList.add("nav-item");
		li.dataset.tripId = tripId;

		const containerLink = document.createElement("a");
		containerLink.classList.add(
			"nav-link",
			"link-body-emphasis",
			"d-flex",
			"justify-content-between",
			"align-items-center"
		);

		containerLink.setAttribute(
			"title",
			`Select trip to ${storeName} on ${tripDate}`
		);

		containerLink.addEventListener("click", (e) => {
			selectTrip(tripId, tripDate);
			displayCart(tripId);
		});

		const textContainerSpan = document.createElement("span");
		textContainerSpan.classList.add("d-flex", "justify-content-left");

		const tripDateSpan = document.createElement("span");
		tripDateSpan.textContent = tripDate;
		textContainerSpan.appendChild(tripDateSpan);

		containerLink.appendChild(textContainerSpan);

		const delBtn = document.createElement("button");
		delBtn.classList.add("btn", "btn-sm");
		delBtn.setAttribute("title", `delete trip to ${storeName} on ${tripDate}`);

		const iconSpan = document.createElement("span");
		iconSpan.classList.add("bi", "bi-trash3", "text-danger");
		delBtn.appendChild(iconSpan);

		delBtn.addEventListener("click", (e) => deleteTrip(tripId));

		containerLink.appendChild(delBtn);

		li.appendChild(containerLink);
		return li;
	}

	// Creates a new list element for cart item
	function createNewCartItem({
		id: cartItemId,
		description,
		memo,
		quantity,
		unitPrice,
	}) {
		const tr = document.createElement("tr");

		const descTD = document.createElement("td");

		descTD.textContent = description;

		tr.appendChild(descTD);

		const memoTD = document.createElement("td");

		memoTD.textContent = memo;

		tr.appendChild(memoTD);

		const quantityTD = document.createElement("td");
		const quantityContentSpan = document.createElement("span");
		quantityContentSpan.classList.add(
			"text-center",
			"align-middle",
			"cart-item-quantity"
		);
		quantityContentSpan.textContent = quantity;

		const decBtn = document.createElement("button");
		decBtn.classList.add("btn");
		decBtn.textContent = "-";

		decBtn.addEventListener("click", async (e) => {
			quantity -= 1;

			// If the quantity is zero, we just delete the cart item
			if (quantity === 0) {
				deleteCartItem(cartItemId);
				cartTable.removeChild(tr);
			} else {
				updateItemQuantity(cartItemId, quantity);

				quantityContentSpan.textContent = quantity;
			}
		});

		const incBtn = document.createElement("button");
		incBtn.classList.add("btn", "align-middle");
		incBtn.textContent = "+";
		incBtn.addEventListener("click", async (e) => {
			quantity = parseInt(quantity) + 1;

			updateItemQuantity(cartItemId, quantity);

			quantityContentSpan.textContent = quantity;
		});

		quantityTD.appendChild(decBtn);
		quantityTD.appendChild(quantityContentSpan);
		quantityTD.appendChild(incBtn);

		tr.appendChild(quantityTD);

		const priceTD = document.createElement("td");
		priceTD.textContent = `$${unitPrice}`;
		tr.appendChild(priceTD);

		const delTD = document.createElement("td");
		delTD.classList.add("text-center");

		const delBtn = document.createElement("button");
		delBtn.classList.add("btn", "btn-small");

		const iconSpan = document.createElement("span");
		iconSpan.classList.add("bi", "bi-trash3", "text-danger");
		delBtn.appendChild(iconSpan);

		delBtn.addEventListener("click", (e) => {
			deleteCartItem(cartItemId);
			cartTable.removeChild(tr);
		});

		delTD.appendChild(delBtn);

		tr.appendChild(delTD);

		return tr;
	}

	function selectStore(storeId, storeName) {
		clearTrips();
		clearCart();

		storeList.dataset.activeStoreId = storeId;
		storeList.dataset.activeStoreName = storeName;

		// Iterate through each store list item and see if its id
		// matches the active store id. If true, add class of "active".
		// If not, remove class of "active".
		for (const store of storeList.children) {
			const anchor = store.querySelector("a");

			if (store.dataset.storeId != storeId) {
				anchor.classList.remove("active");
			} else {
				anchor.classList.add("active");
				displayTrips(storeId);
			}
		}
	}

	function selectTrip(tripId, tripDate) {
		clearCart();

		tripList.dataset.activeTripId = tripId;
		tripList.dataset.activeTripDate = tripDate;

		// Iterate through each trip list item and see if its id
		// matches the active trip id. If true, add class of "active".
		// If not, remove class of "active".
		for (const trip of tripList.children) {
			const anchor = trip.querySelector("a");

			if (trip.dataset.tripId != tripId) {
				anchor.classList.remove("active");
			} else {
				anchor.classList.add("active");
				displayCart(tripId);
			}
		}
	}

	function clearTrips() {
		delete tripList.dataset.activeTripId;
		delete tripList.dataset.tripDate;

		tripList.replaceChildren();
	}

	function clearCart() {
		cartTable.replaceChildren();
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
			const storeEl = storeList.querySelector(`[data-store-id=
				'${storeId}']`);
			storeList.removeChild(storeEl);
		} catch (error) {
			console.error(error);
		}
	}

	async function deleteTrip(tripId) {
		try {
			const res = await fetch(`http://localhost:3000/trips/${tripId}`, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
			});

			const data = await res.json();
			const tripEl = tripList.querySelector(`[data-trip-id='${tripId}']`);
			tripList.removeChild(tripEl);
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
