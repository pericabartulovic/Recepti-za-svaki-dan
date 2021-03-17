import { elements } from './base';

export const getInput = () => elements.searchInput.value;

export const clearInput = () => {      //ovdje omatamo tijelo funkcije da nam odmah implicitno ne vrati return
    elements.searchInput.value = '';
}
export const clearResults = () => {
    elements.searchResList.innerHTML = '';
    elements.searchResPages.innerHTML = '';
}

export const highlightSelected = id => {
    const resultsArr = Array.from(document.querySelectorAll('.results__link'));
    resultsArr.forEach(el => {
        el.classList.remove('results__link--active');
    });
    document.querySelector(`.results__link[href="#${id}"]`).classList.add('results__link--active');
    //kad dodajem classList 'atribut' ide bez točke naprijed (NE '.atribut'!)
}

/*
//'Pasta with tomato and spinach'
acc: 0 / acc + cur.length = 5 /newTitle = ['Pasta'] 
acc: 5 / acc + cur.length = 9 /newTitle = ['Pasta', 'with'] 
acc: 9 / acc + cur.length = 15 /newTitle = ['Pasta', 'with', 'tomato'] 
acc: 15 / acc + cur.length = 18 /newTitle = ['Pasta', 'with', 'tomato'] 
acc: 18 / acc + cur.length = 24 /newTitle = ['Pasta', 'with', 'tomato'] 
*/

export const limitRecipeTitle = (title, limit = 17) => {
    const newTitle = [];
    if (title.length > limit) {
        title.split(' ').reduce((acc, cur) => {
            if (acc + cur.length <= limit) {
                newTitle.push(cur);
            }
            return acc + cur.length;
        }, 0);  //inicijalna vrijednost accumulatora 0

        //return the result
        return `${newTitle.join(' ')} ...`;
    }
    return title;
}


const renderRecipe = recipe => {
    const markup = `
        <li>
            <a class="results__link" href="#${recipe.recipe_id}">
                <figure class="results__fig">
                    <img src="${recipe.image_url}" alt="Test">
                </figure>
                <div class="results__data">
                    <h4 class="results__name">${limitRecipeTitle(recipe.title)}</h4>  
                    <p class="results__author">${recipe.publisher}</p>
                </div>
            </a>
        </li>
    `;  // ovdje ne moram proslijediti argument *limit* jer je defaultni
    elements.searchResList.insertAdjacentHTML('beforeend', markup);
};

//type: 'prev' or ' next'
const createButton = (page, type) => `
    <button class="btn-inline results__btn--${type}" data-goto=${type === 'prev' ? page - 1 : page + 1}>
        <span>${type === 'prev' ? page - 1 : page + 1}. str.</span>
        <svg class="search__icon">
            <use href="img/icons.svg#icon-triangle-${type === 'prev' ? 'left' : 'right'}"></use>
        </svg>
    </button>
`;

const renderButtons = (page, numResults, resPerPage) => {
    const pages = Math.ceil(numResults / resPerPage);

    let button;
    if (page === 1 && pages > 1) {
        //Samo gumb za sljedeću stranicu
        button = createButton(page, 'next');
    }
    else if (page < pages) {
        //Oba gumba
        button = `
            ${createButton(page, 'prev')}
            ${createButton(page, 'next')}
        `;
    }
    else if (page === pages && pages > 1) {
        //Samo gumb za prethodnu stranicu
        button = createButton(page, 'prev');
    }

    elements.searchResPages.insertAdjacentHTML('afterbegin', button);
};

export const renderResults = (recepies, page = 1, resPerPage = 10) => {
    //render results of current page
    const start = (page - 1) * 10;
    const end = page * resPerPage;

    recepies.slice(start, end).forEach(renderRecipe);   //ne treba "el => renenderRecipe(el)" jer automatski baca el u funkciju!

    //render pagination buttons
    renderButtons(page, recepies.length, resPerPage);
};