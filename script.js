const search = document.querySelector(".search");
const main = document.getElementById("main");
const loader = document.getElementById("loader");
const errorBox = document.getElementById("error");
const modalRecipe = document.getElementById("modalRecipe");
const closeModal = document.getElementById("closeModal");
const modalImg = document.getElementById("modalImg");
const modalTitle = document.getElementById("modalTitle");
const modalText = document.getElementById("modalText");
const modalCuisine = document.getElementById("cuisine");
const modalCategory = document.getElementById("category");

let categories = [];

async function mealAPI(url) {
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Network error");
        const data = await res.json();
        return data.meals || [];
    } catch (err) {
        console.error(err);
        return [];
    }
}

async function searchMealsByName(name) {
    return await mealAPI(`https://www.themealdb.com/api/json/v1/1/search.php?s=${name}`);
}

async function getMealsByCategory(category) {
    return await mealAPI(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`);
}

async function searchMealsCategories() {
     try {
        const res = await fetch(`https://www.themealdb.com/api/json/v1/1/categories.php`);
        const data = await res.json();
        return data.categories || [];
    } catch (e) {
        console.error(e);
        return [];
    }
}

async function getMealDetails(id) {
    const meals = await mealAPI(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
    return meals[0];
}

async function searchMeals() {
    const query = search.value.trim();
    if (!query) return;
    
    main.classList.add("hidden");
    loader.classList.remove("hidden");
    errorBox.classList.add("hidden");

    const meals = await searchMealsByName(query);

    main.innerHTML = "";

    if (!meals.length) {
        errorBox.textContent = "Not found";
        errorBox.classList.remove("hidden");
    } else {
        showMeals(meals, `Results for "${query}"`, main);
    }

    loader.classList.add("hidden");
    main.classList.remove("hidden");
}

search.addEventListener("keydown", e => {
    if (e.key === "Enter") {
        e.preventDefault(); 
        searchMeals();
    }
});

search.addEventListener("input", () => {
    if (!search.value.trim()) {
        errorBox.classList.add("hidden");
        loadPage();
    }
});

async function loadPage(){
    categories = await searchMealsCategories(); 
    main.innerHTML = "";

    for (const category of categories) {
        const list = await getMealsByCategory(category.strCategory);
        showMeals(list, category.strCategory, main, 4);
    }
}

function showMeals(meals, category, container, limit = null){
    const section = document.createElement("section");
    section.classList.add("Category-section");

    const title = document.createElement("h2");
    title.textContent = category;
    title.classList.add('title');

    const row = document.createElement("div");
    row.classList.add("row");

    const items = limit ? meals.slice(0, limit) : meals;

    items.forEach(meal => {
        const card = document.createElement('div');
        card.classList.add('foodCard');
        card.innerHTML = `
            <img src="${meal.strMealThumb}" alt="foodPhoto">
            <div class="foodContent">
                <div class="foodInfo">
                    <h2 class="foodTitle">${meal.strMeal}</h2>
                </div>
                <button class="btnStyle">VIEW RECIPE</button>
            </div>
        `;

        card.querySelector(".btnStyle").addEventListener("click", async () => {
            const full = await getMealDetails(meal.idMeal);

            modalRecipe.classList.remove("hidden");
            modalTitle.textContent = meal.strMeal;
            modalText.textContent = full.strInstructions;
            modalCuisine.innerHTML = `
                <p><span>Cuisine:</span> ${full.strArea}</p>
            `;
            modalCategory.innerHTML = `
                <p><span>Category:</span> ${full.strCategory}</p>
            `;
        });
        
        row.appendChild(card);
    });

    section.appendChild(title);
    section.appendChild(row);
    container.appendChild(section);
}

closeModal.addEventListener("click", () => {
    modalRecipe.classList.add("hidden");
});

loadPage();



