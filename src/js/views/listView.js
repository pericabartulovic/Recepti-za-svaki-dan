import { elements } from './base';

export const renderItem = item =>  {
    const markup = `
        <li class="shopping__item" data-itemid=${item.id}>
            <div class="shopping__count">
                <input type="number" min="0" value="${item.count}" step="${item.count}" class="shopping__count-value"> 
                    <!--dodana klasa "shopping__count-value" da se kasnije lakše preko nje može dohvatiti unešeni value-->
                <p>${item.unit}</p>
            </div>
            <p class="shopping__description">${item.ingredient}</p>
            <button class="shopping__delete btn-tiny">
                <svg>
                    <use href="img/icons.svg#icon-circle-with-cross"></use>
                </svg>
            </button>
        </li>
    `;
    elements.shopping.insertAdjacentHTML('beforeend', markup); 
};

export const deletShoppingList = () => {
    elements.shopping.innerHTML = '';
}

export const deleteItem = id => {
    const item = document.querySelector(`[data-itemid="${id}"]`);
    item.parentElement.removeChild(item);   //treba micati cijeli element, a ne samo njegov sadržaj preko innerHTML

};