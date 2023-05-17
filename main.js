document.addEventListener("DOMContentLoaded", () => {
	const newStoreModal = document.getElementById("newStoreModal");
	const newTripModal = document.getElementById("newTripModal");
	const newCartModal = document.getElementById("newCartModal");

	const alertPlaceholder = document.getElementById("liveAlertPlaceholder");

	const storeList = document.querySelector("#store-list");
	const tripList = document.querySelector("#trip-list");
	const cartTable = document.querySelector("#cart-table");
	const cartBody = cartTable.querySelector("tbody");

	const storeForm = document.querySelector("form#storeForm");
	const tripForm = document.querySelector("form#tripForm");
	const cartForm = document.querySelector("form#cartForm");

	const appendAlert = (message, type) => {
		const wrapper = document.createElement("div");
		wrapper.classList.add(
			"alert",
			`alert-${type}`,
			"d-flex",
			"align-items-center",
			"alert-dismissible",
			"mt-2"
		);
		wrapper.setAttribute("role", "alert");

		const iconSpan = document.createElement("span");
		iconSpan.classList.add("bi", "bi-exclamation-triangle-fill", "me-2");
		wrapper.appendChild(iconSpan);

		const messageDiv = document.createElement("div");
		messageDiv.textContent = message;

		wrapper.appendChild(messageDiv);

		const closeBtn = document.createElement("button");
		closeBtn.classList.add("btn-close");
		closeBtn.setAttribute("type", "button");
		closeBtn.setAttribute("aria-label", "Close");
		closeBtn.dataset.bsDismiss = "alert";

		wrapper.appendChild(closeBtn);

		alertPlaceholder.append(wrapper);
	};

	// Add event listeners to new store modal
	newStoreModal.addEventListener("shown.bs.modal", () => {
		const storeNameInput = document.getElementById("storeNameInput");
		storeNameInput.focus();
	});

	newStoreModal.addEventListener("hide.bs.modal", () => {
		const newStoreForm = document.getElementById("storeForm");
		newStoreForm.reset();
	});

	const showNewTripBtn = document.querySelector("#showNewTripModal");

	// Shows an alert when trying to add a new trip with no store selected
	showNewTripBtn.addEventListener("click", () => {
		const { activeStoreId } = storeList.dataset;

		if (!activeStoreId) {
			appendAlert(
				"Must select a store first in order to add a new trip.",
				"danger"
			);
		} else {
			const newTripInstance = bootstrap.Modal.getOrCreateInstance(newTripModal);
			newTripInstance.show();
		}
	});

	const showNewCartBtn = document.querySelector("#showNewCartModal");

	// Shows an alert when trying to add a new cart item with no trip selected
	showNewCartBtn.addEventListener("click", () => {
		const { activeTripId } = tripList.dataset;

		if (!activeTripId) {
			appendAlert(
				"Must select a trip first in order to add a new cart item.",
				"danger"
			);
		} else {
			const newCartFormInstance =
				bootstrap.Modal.getOrCreateInstance(newCartModal);

			newCartFormInstance.show();
		}
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
	newCartModal.addEventListener("shown.bs.modal", () => {
		const descriptionInput = document.getElementById("descriptionInput");

		descriptionInput.focus();
	});

	newCartModal.addEventListener("hide.bs.modal", () => {
		const newCartItemForm = document.getElementById("cartForm");
		newCartItemForm.reset();
	});

	// Add the submit event listeners to forms

	storeForm.addEventListener("submit", submitStore);
	tripForm.addEventListener("submit", submitTrip);
	cartForm.addEventListener("submit", submitItem);

	displayStores();

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
			storeList.replaceChildren(...storeItems);
			storeList.dataset.storeCount = storeItems.length;
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
			tripList.dataset.tripCount = tripItems.length;
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
			cartBody.replaceChildren(...cartItems);
			cartTable.dataset.cartCount = cartItems.length;
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
			cartBody.replaceChildren();

			delete tripList.dataset.activeTripId;

			// Clear the new store form
			e.target.reset();

			// Close the new store modal
			const newStoreModalBSInstance =
				bootstrap.Modal.getOrCreateInstance(newStoreModal);
			newStoreModalBSInstance.hide();

			// Append the new store to the store list
			storeList.append(listEl);
			storeList.dataset.storeCount = parseInt(storeList.dataset.storeCount) + 1;
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
			const newTripInstance = bootstrap.Modal.getInstance(newTripModal);
			newTripInstance.hide();

			// Append the new trip to the trip list
			tripList.append(listEl);
			tripList.dataset.tripCount = parseInt(tripList.dataset.tripCount) + 1;
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
			const newCartItemBSInstance = bootstrap.Modal.getInstance(newCartModal);
			newCartItemBSInstance.hide();

			// Append the new cart to the cart list
			cartBody.append(listEl);
			cartTable.dataset.cartCount = parseInt(cartTable.dataset.cartCount) + 1;
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
				cartBody.removeChild(tr);
			} else {
				updateCartItemQuantity(cartItemId, quantity);

				quantityContentSpan.textContent = quantity;
			}
		});

		const incBtn = document.createElement("button");
		incBtn.classList.add("btn", "align-middle");
		incBtn.textContent = "+";
		incBtn.addEventListener("click", async (e) => {
			quantity = parseInt(quantity) + 1;

			updateCartItemQuantity(cartItemId, quantity);

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
			cartBody.removeChild(tr);
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
		cartBody.replaceChildren();
	}

	async function deleteStore(storeId) {
		const tripCount = parseInt(tripList.dataset.tripCount);

		if (tripCount > 0) {
			appendAlert(
				"Trip list must be empty before deleting the store.",
				"danger"
			);
		}

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
			storeList.dataset.storeCount = storeList.dataset.storeCount - 1;
		} catch (error) {
			console.error(error);
		}
	}

	async function deleteTrip(tripId) {
		const cartCount = parseInt(cartTable.dataset.cartCount);

		if (cartCount > 0) {
			appendAlert("Cart must be empty before deleting the trip.", "danger");

			return;
		}

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
			tripList.dataset.tripCount = tripList.dataset.tripCount - 1;
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

	async function updateCartItemQuantity(itemId, quantity) {
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
