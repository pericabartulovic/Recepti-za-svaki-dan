import uniqid from 'uniqid';

export default class List {
    constructor(){
        this.items = [];
    }

    addItem (count, unit, ingredient) {
        const item =  {
            id: uniqid(),
            count,
            unit,
            ingredient
        }
        this.items.push(item);
        return item;
    }

    deleteItem(id) {
        const index = this.items.findIndex(el => el.id === id);
        //[2, 4, 8]
        //.splice(1, 1) krenut će na poziciji, vratiti tražiti element na tom indexu,
        // jedan element obrisati jedan el. (drugi argument) i promijeniti orginalni array --> [2, 8]
        // .slice(1, 2) vraća traženi/e el, i ima početnu i završnu poziciju kao parametre te ne mijenja početni array!
        this.items.splice(index, 1);
    }

    updateCount(id, newCount) {
        this.items.find(el => el.id === id).count = newCount;
    }
}