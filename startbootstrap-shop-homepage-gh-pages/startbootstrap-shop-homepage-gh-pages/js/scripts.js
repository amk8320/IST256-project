/*!
* Start Bootstrap - Shop Homepage v5.0.6 (https://startbootstrap.com/template/shop-homepage)
* Copyright 2013-2023 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-shop-homepage/blob/master/LICENSE)
*/
// This file is intentionally blank
// Use this file to add JavaScript to your project
const searchBox = document.getElementById('searchBox');
const cards = document.querySelectorAll(".card.h-100");

searchBox.addEventListener("input", () => {
    const query = searchBox.value.toLocaleLowerCase().trim();

    cards.forEach(card => {
        const name = card.querySelector("h5").textContent.toLowerCase();
        card.closest(".col").style.display = name.includes(query) ? "" : "none";
    });
});

    