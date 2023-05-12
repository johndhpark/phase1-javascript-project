document.addEventListener("DOMContentLoaded", async () => {
	// First, get the reference to the html ul element with the id "stores"
	const ul = document.querySelector("ul#stores");

	// Then, make a fetch request to http://localhost:3000/stores.
	const res = await fetch("http://localhost:3000/stores");
	const stores = await res.json();

	// Iterate through each store and create an list item element
	const listItems = stores.map(({ name }) => {
		const li = document.createElement("li");
		li.textContent = name;

		return li;
	});

	// Append the stores to ul
	ul.append(...listItems);
});
