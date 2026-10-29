
document.addEventListener("DOMContentLoaded", function () {
    const cartItems = document.getElementById("cartItems");
    const cartTotal = document.getElementById("cartTotal");
    const cartCount = document.getElementById("cartCount");
    const checkoutButton = document.getElementById("checkoutButton");

    // Get the saved cart from localStorage
    let cart = [];

    try {
        cart = JSON.parse(localStorage.getItem("shoppingCart")) || [];
    } catch (error) {
        console.error("Could not load the shopping cart:", error);
    }

    function displayCart() {
        cartItems.innerHTML = "";
        let total = 0;

        if (cart.length === 0) {
            cartItems.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">
                        Your cart is empty.
                    </td>
                </tr>
            `;
        }

        cart.forEach((item, index) => {
            const quantity = Number(item.quantity) || 1;
            const price = Number(item.price) || 0;
            const subtotal = price * quantity;

            total += subtotal;

            const row = document.createElement("tr");

            const productId = document.createElement("td");
            productId.textContent = item.productId || "";

            const shoeName = document.createElement("td");
            shoeName.textContent = item.productName || "";

            const quantityCell = document.createElement("td");
            quantityCell.textContent = quantity;

            const priceCell = document.createElement("td");
            priceCell.textContent = "$" + subtotal.toFixed(2);

            const actions = document.createElement("td");
            const removeButton = document.createElement("button");

            removeButton.textContent = "Remove";
            removeButton.className = "btn btn-outline-danger btn-sm";

            removeButton.addEventListener("click", function () {
                cart.splice(index, 1);
                localStorage.setItem("shoppingCart", JSON.stringify(cart));
                displayCart();
            });

            actions.appendChild(removeButton);

            row.append(productId, shoeName, quantityCell, priceCell, actions);
            cartItems.appendChild(row);
        });

        cartTotal.textContent = total.toFixed(2);
        cartCount.textContent = cart.length;
        checkoutButton.disabled = cart.length === 0;
    }

    displayCart();
});
