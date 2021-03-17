import axios from 'axios';

export default class Recipe {
    constructor(id) {
        this.id = id;
    }

    async getRecipe() {
        try {
            const res = await axios (`https://forkify-api.herokuapp.com/api/get?rId=${this.id}`);
            this.title = res.data.recipe.title;
            this.author = res.data.recipe.publisher;
            this.img = res.data.recipe.image_url;
            this.url = res.data.recipe.source_url;
            this.ingredients = res.data.recipe.ingredients;
        } catch (error) {
            console.error();
            alert('Nešto je pošlo po krivu :(')
        }
    }

    calcTime() {
        //pod pretpostavkom da nam za primjenu svaka 3 sastojka treba 15-ak minuta
        const numIng = this.ingredients.length;
        const periods = Math.ceil(numIng / 3);
        this.time = periods * 3;
    }

    calcServings() {
        this.servings = 4;
    }

    parseIngredients() {
        const newIgredients = this.ingredients.map(el => {
            const unitsLong = ['tablespoons', 'tablespoon', 'ounces', 'ounce', 'teaspoons', 'teaspoon', 'cups', 'pounds'];
            const unitsShort = ['tbsp', 'tbsp', 'oz', 'oz', 'tsp', 'tsp', 'cup', 'pound'];
            const units = [...unitsShort, 'kg', 'g'];  //ovo je samo da ih prepozna kao unit a ne treba ih konveratati kao mjere gore

            // 1) Uskladiti mjere (da ne budu malo jednina, malo množina i sl.)
            let ingredient = el.toLowerCase();
            unitsLong.forEach((unit, i) => { 
                ingredient = ingredient.replace(unit, unitsShort[i]);
            });

            // 2) Ukloniti zagrade iz povučenih podataka
            ingredient = ingredient.replace(/ *\([^)]*\) */g, ' ');

            // 3) Parse ingredients into count, unit and ingredient
            const arrIng =  ingredient.split(' ');
            const unitIndex = arrIng.findIndex(el2 => units.includes(el2));

            let objIng;
            if (unitIndex > -1) {
                // U izvornom stringu postoji mjerna jedinica
                // Npr. 4 1/2 šalice, arrCount je [4, 1/2] --> eval("4+1/2") --> 4.5
                // primjer 2: 4 šalice, arrCount je [4]
                const arrCount = arrIng.slice(0, unitIndex);      //slice do ali ne i uključujući (unitIndex)

                let count;
                if(arrCount.length === 1) {
                    count = eval(arrIng[0].replace('-', '+'));    //kad imamo mjeru 1-1/2 (- je ovdje 'do') jedna do jedna i pol šalica npr.
                } else {
                    count = eval(arrIng.slice(0, unitIndex).join('+'));
                }

                objIng = {
                    count,
                    unit: arrIng[unitIndex],
                    ingredient: arrIng.slice(unitIndex + 1).join(' ')
                };

            } else if (parseInt(arrIng[0], 10)) {
                // U stringu nema mjerne j., ali je broj na 1. mjestu! arrIng[0]
                objIng = {
                    count: (parseInt(arrIng[0], 10)),
                    unit: '',
                    ingredient: arrIng.slice(1).join(' ')   //slice od prve pozicije nadalje... ako nema drugog arg ide do kraja; join spaja nazad
                }


            } else if (unitIndex === -1) {
                // Nema m. jedinice niti broja na 1. mjestu u stringu
                objIng = {
                    count: 1, 
                    unit: '',  //ako nema mj.jed. onda će staviti količinu 1 (count: 1)
                    ingredient  //u ES6 ne treba ponavljati ingredient: ingredient dosta je napisati samo igredient i on će sam kreirati vrijednost
                }
            }

            return objIng;
        });
        this.ingredients = newIgredients;
    }

    updateServings (type) {  //ova je na rubu da ide u recipeView ali kako manipulira PODACIMA, a ne IZGLEDOM mjesto joj je tu
        //Servings
        const newServings = type === 'dec' ? this.servings - 1 : this.servings + 1;

        //Igredients
        this.ingredients.forEach(ing => {
            ing.count *= (newServings / this.servings);
        });

        this.servings = newServings;
    }
}