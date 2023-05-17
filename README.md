# phase1-javascript-project

A SPA (Single Page Application) using HTML, CSS, and JS to communicate with a public API.
<br><br>

## Background

Recently I have been trying to be more health conscious. However, due to the rising inflation, this has been very difficult to do. Each week, I go to several markets to get the best deals on organic products. Unfortunately, this task has become more and more arduous due to my busy schedule and the sheer number of items that I need to keep track of. For awhile, I been searching for an app that would make this process much easier. I thought it would be a great idea to take this opportunity to create my own app that will take care of this problem.
<br><br>

## Getting Started


1. Fork the project.
2. Clone the project to local directory.
3. Go to the project directory from the terminal.
4. Run the command `npm install` to install dependencies.
5. Lastly, run `npm start` to start the application.

## How It Works

Currently the app contains three columns. The first column displays the list of stores that one would visit. The second column shows the past and future trips that are associated to a particular store. The last column represents products put in the cart for each trip. At the moment, the cart items have a description, memo, quantity and unit price. <br><br>
We can add more stores and trips, as well as cart items. In order for us to add a store, trip, or a cart item, we will click the big ⊕ icon at the top right of each column. The user must first select a store in order to create a trip. If no store is selected when create trip button is pressed, then an alert will pop up. If a store has been selected, then a modal will display a new trip form. The user can input in the necessary information and submit the form. If successful, the new trip will show up immediately in the trip list. The same logic applies to the cart. The user must first select a trip in order to add a cart item.<br><br>
The user can delete any of the items in the three lists by clicking the trash can icon linked to each item. However, a trip cannot be deleted unless all the cart are removed. In the same vein, a store cannot be deleted unless the trip list is empty. There are several reasons for this restriction. With the current database, if a trip is deleted and if that trip had cart items, those items will no longer be associated with a trip. Furthermore, if a new trip is created and if the last deleted trip is the most recent created one, the new trip will have the same id as the deleted trip (this is just the characteristics of the json server). The previous cart items will then incorrectly associated with the new trip and show up in its cart. Therefore, we must implement these restrictions in order to properly add and delete.
<br><br>

## Future Plans

Due to the time constraints, there are many features that I was not able to add, but plan to add in the future. Some of them include:

- [ ] Search
- [ ] Sorting
- [ ] Tags
- [ ] Group trips by dates
- [ ] Scrape websites for cheapest products for that week and add them to cart.
