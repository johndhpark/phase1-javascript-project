document.addEventListener("DOMContentLoaded", async () => {
	// First, get the reference to the html ul element with the id "stores"
	const ul = document.querySelector("ul#stores");

	// Then, make a fetch request to http://localhost:3000/stores.
	const res = await fetch("http://localhost:3000/stores");
	const stores = await res.json();

	// Now display the store names in the ul element
	const listItems = stores.map(({ name }) => {
		// Create the list item element and add the name of the store
		const li = document.createElement("li");
		li.textContent = name;

		return li;
	});

	// Append the list items to ul
	ul.append(...listItems);
});
