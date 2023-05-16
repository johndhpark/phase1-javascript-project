document.addEventListener("DOMContentLoaded", () => {
	const storeList = document.querySelector("#store-list");
	const tripList = document.querySelector("#trip-list");
	const cartTable = document.querySelector("#cart-table tbody");

	const storeForm = document.querySelector("form#store-form");
	const tripForm = document.querySelector("form#trip-form");
	const cartForm = document.querySelector("form#cart-form");

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
		const newStoreForm = document.getElementById("store-form");
		newStoreForm.reset();
	});

	// Add event listeners to new trip modal
	newTripModal.addEventListener("shown.bs.modal", () => {
		const tripDateInput = document.getElementById("tripDateInput");

		tripDateInput.focus();
	});

	newTripModal.addEventListener("hide.bs.modal", () => {
		const newTripForm = document.getElementById("trip-form");
		newTripForm.reset();
	});

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
		// cartTable.replaceChildren();
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
		cartTable.replaceChildren();
	}

	async function displayCartItems(tripId) {
		const res = await fetch("http://localhost:3000/items");
		const items = await res.json();

		// Iterate throgh each cart item and create a list element
		const cartItems = items
			.filter((item) => parseInt(item.tripId) === tripId)
			.map((item) => createNewCartItem(item));

		// Update the cart list
		cartTable.replaceChildren(...cartItems);
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
			cartTable.replaceChildren();

			delete tripList.dataset.selectedTripId;

			// Clear the new store form
			e.target.reset();

			// Close the new store modal
			const newStoreModalBSInstance =
				bootstrap.Modal.getInstance(newStoreModal);
			newStoreModalBSInstance.hide();

			// Append the new store to the store list
			storeList.append(listEl);
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

			e.target.reset();

			// Close the new trip modal
			const newTripBSInstance = bootstrap.Modal.getInstance(newTripModal);
			newTripBSInstance.hide();

			// Append the new trip to the trip list
			tripList.append(listEl);
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
		// console.log(storeId, storeName);
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
		const storeName = storeList.dataset.selectedStoreName;

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
			displayCartItems(tripId);
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

		delBtn.addEventListener("click", (e) => deleteTrip(id));

		containerLink.appendChild(delBtn);

		li.appendChild(containerLink);
		return li;
	}

	// Creates a new list element for cart item
	function createNewCartItem({ id, description, memo, quantity, unitPrice }) {
		const tr = document.createElement("tr");

		// const descSpan = document.createElement("span");
		const descTD = document.createElement("td");
		// descTD.classList.add("align-middle");

		// descSpan.textContent = description;
		descTD.textContent = description;

		// li.appendChild(descSpan);
		tr.appendChild(descTD);

		// const memoSpan = document.createElement("span");
		const memoTD = document.createElement("td");
		// memoTD.classList.add("align-middle");

		// memoSpan.textContent = memo;
		memoTD.textContent = memo;

		// li.appendChild(memoSpan);
		tr.appendChild(memoTD);

		// const quantityContainerSpan = document.createElement("span");
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
				deleteCartItem(id);
				cartTable.removeChild(li);
			} else {
				updateItemQuantity(id, quantity);

				quantityContentSpan.textContent = quantity;
			}
		});

		const incBtn = document.createElement("button");
		incBtn.classList.add("btn", "align-middle");
		incBtn.textContent = "+";
		incBtn.addEventListener("click", async (e) => {
			quantity = parseInt(quantity) + 1;

			updateItemQuantity(id, quantity);

			quantityContentSpan.textContent = quantity;
		});

		// quantityContainerSpan.appendChild(decBtn);
		quantityTD.appendChild(decBtn);
		// quantityContainerSpan.appendChild(quantityContentSpan);
		quantityTD.appendChild(quantityContentSpan);
		// quantityContainerSpan.appendChild(incBtn);
		quantityTD.appendChild(incBtn);

		// li.appendChild(quantityContainerSpan);
		tr.appendChild(quantityTD);

		// const priceSpan = document.createElement("span");
		// priceSpan.textContent = `$${price}`;
		// li.appendChild(priceSpan);
		const priceTD = document.createElement("td");
		// priceTD.classList.add("align-middle");
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
			deleteCartItem(id);
			cartTable.removeChild(tr);
		});

		delTD.appendChild(delBtn);

		// li.appendChild(delBtn);
		tr.appendChild(delTD);

		// return li;
		return tr;
	}

	function selectStore(storeId, storeName) {
		storeList.dataset.selectedStoreId = storeId;
		storeList.dataset.selectedStoreName = storeName;

		// Iterate through each store list item and see if its id
		// matches the selected store id. If true, add class of "active".
		// If not, remove class of "active".
		for (const store of storeList.children) {
			const anchor = store.querySelector("a");

			if (store.dataset.storeId != storeId) anchor.classList.remove("active");
			else anchor.classList.add("active");
		}
	}

	function selectTrip(tripId, tripDate) {
		tripList.dataset.selectedTripId = tripId;
		tripList.dataset.selectTripDate = tripDate;

		// Iterate through each trip list item and see if its id
		// matches the selected trip id. If true, add class of "active".
		// If not, remove class of "active".
		for (const trip of tripList.children) {
			const anchor = trip.querySelector("a");

			if (trip.dataset.tripId != tripId) anchor.classList.remove("active");
			else anchor.classList.add("active");
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
