
const searchBox = document.getElementById('searchBox');
const cards = document.querySelectorAll(".card.h-100");

if (searchBox) {
    searchBox.addEventListener("input", () => {
        const query = searchBox.value.toLowerCase().trim();

        cards.forEach(card => {
            const name = card.querySelector("h5").textContent.toLowerCase();
            card.closest(".col").style.display = name.includes(query) ? "" : "none";
        });
    });
}