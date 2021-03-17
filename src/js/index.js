//index.js je ujedno i CONTROLLER

import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import { elements, renderLoader, clearLoader } from './views/base';

/** Global state of the app
* - Search object
* - Current recipe object
* - Shopping list object
* - Liked recipes
*/

const state = {};
//elements.searchInput.focus();


/**
 * SEARCH CONTROLLER
 */
const controlSearch = async () => {
    // 1) Get query from view
    const query = searchView.getInput();

    if (query) {
        // 2) New search object and add to state
        state.search = new Search(query);

        // 3) Prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);

        try {
            // 4) Search for recipes
            await state.search.getResults();

            // 5) Render results on UI
            clearLoader();
            searchView.renderResults(state.search.result);  //ovdje se ne passaju page = 1 i resPerPage = 10 jer su defaultne i ne treba ih navoditi
        } catch (error) {
            alert('Nešto nije u redu s pretraživanjem recepata...');
            clearLoader();
        }
    }
}

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});

elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);   // ovdje goToPage prosljeđuje vrijednost iz data-goto (searchView/createButton(page, 'prev' ili 'next'))
        // i overwrita defaultnu vrijednost (page = 1)
    }
});

/**
 * RECIPE CONTROLLER
 */
const controlRecipe = async () => {
    //dohvati ID iz url-a
    const id = window.location.hash.replace('#', '');
    //console.log(id);

    if (id) {
        //Pripremi UI za promjene
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        //Highlight selected search item
        if (state.search) searchView.highlightSelected(id);

        //Kreiraj novi recipe objekt
        state.recipe = new Recipe(id);

        //Dohvati recipe data i/and parse ingredients
        try {
            await state.recipe.getRecipe();
            //console.log(state.recipe.ingredients);
            state.recipe.parseIngredients();

            //Izračunaj serving time
            state.recipe.calcTime();
            state.recipe.calcServings();

            //Render recept
            clearLoader();
            recipeView.renderRecipe(
                state.recipe,
                state.likes.isLiked(id)
            );
        } catch (error) {
            console.log(error);
            alert('Dogodila se pogreška prilikom dohvata recepta!');
        }

    }
}

//window.addEventListener('hashchange', controlRecipe);
//window.addEventListener('load', controlRecipe);

//tu umjesto gore dvije linije koda imam jedan i jedan event listener je dodijeljen više različitih evenata
['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

/**
 * LIST CONTROLLER
 */
const controlList = () => {
    // Create new list if there is none yet
    if (!state.list) state.list = new List();

    //obriši prethodnu šoping listu (jer se u izvornom programu ne brinše nego ponavlja i niže ispod)
    listView.deletShoppingList();

    // Add each ingredient to the list and UI
    // const listaNamirnica = [];
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item)
        // listaNamirnica.push(item);
    });
    // listaNamirnica.forEach (el => listView.renderItem(el));
};


// Upravljanje listom --> brisanje i update stavki popisa
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    //Rukovanje delete gumbom
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        //briši stavku iz state
        state.list.deleteItem(id);

        //briši stavku iz UI-a
        listView.deleteItem(id);

        // Upravljanje ažuriranjem brojača (count update)
    } else if (e.target.matches('.shopping__count-value')) {
        const val = parseFloat(e.target.value, 10);
        if (val >= 0) {   //ovo nije toliko potrebno jer se vrijednost broja u html može postaviti na *min="0"*
            state.list.updateCount(id, val);
        }
    }
});


/**
 * LIKE CONTROLLER
 */
const controlLike = () => {
    if (!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;

    // Korisnik još NIJE lajkao trenutni recept
    if (!state.likes.isLiked(currentID)) {
        // Dodaj like u state
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );
        // Toggle like gumb
        likesView.toggleLikeBtn(true);

        // Dodaj like u UI listu
        likesView.renderLike(newLike);
        console.log(state.likes);
        
        // Korisnik JE lajkao trenutni recept
    } else {
        // Ukloni like iz state
        state.likes.deleteLike(currentID);
        
        // Toggle like gumb
        likesView.toggleLikeBtn(false);

        // Ukloni like iz UI liste
        likesView.deleteLike(currentID);
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
};

// Obnovi lajkane recepte tijekom punjenja stranice (on load)
window.addEventListener('load', () => {
    state.likes = new Likes();

    //Obnovi lajkove
    state.likes.readStorage();

    // Toggle like menu button
    likesView.toggleLikeMenu(state.likes.getNumLikes());

    // Render postojeće lajkove
    state.likes.likes.forEach(like => likesView.renderLike(like));
})


// Upravljanje klikovima gumbova recepta u središnjem dijelu
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) { //"*"" bilo koji child element (css)
        //Decrease button is clicked
        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        //Increase button is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        // Dodaj sastojke u shopping listu
        controlList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        // Like controller
        controlLike();
    }
});