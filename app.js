const business = {
  name: "MK'S Kitchen",
  email: "sbonsu03@gmail.com",
  phone: "+15717331957",
};

const menuItems = [
  {
    id: "jollof-plain",
    category: "Rice dishes",
    name: "Jollof (Plain)",
    description: "Ghana-style jollof rice prepared with MK'S Kitchen seasoning.",
    price: 130,
    image: "assets/mk-menu/food-jollof.jpg",
  },
  {
    id: "goat-jollof",
    category: "Rice dishes",
    name: "Goat Jollof",
    description: "Jollof rice served with rich goat meat.",
    price: 200,
    image: "assets/mk-menu/food-jollof.jpg",
  },
  {
    id: "fried-rice",
    category: "Rice dishes",
    name: "Fried Rice",
    description: "Seasoned fried rice with vegetables and MK'S Kitchen flavor.",
    price: 220,
    image: "assets/mk-menu/food-fried-rice.jpg",
  },
  {
    id: "waakye",
    category: "Rice dishes",
    name: "Waakye",
    description: "Rice and beans with classic Ghanaian sides and sauce.",
    price: 380,
    image: "assets/mk-menu/food-waakye.jpg",
  },
  {
    id: "fried-turkey",
    category: "Fried favorites",
    name: "Fried Turkey",
    description: "Crispy fried turkey, seasoned and cooked fresh.",
    price: 160,
    image: "assets/mk-menu/food-fried-yam.jpg",
  },
  {
    id: "spring-roll",
    category: "Fried favorites",
    name: "Spring Roll (1 pc)",
    description: "One crisp spring roll, perfect as an add-on.",
    price: 1.5,
    image: "assets/mk-menu/food-pastry.jpg",
  },
  {
    id: "fried-chicken",
    category: "Fried favorites",
    name: "Fried Chicken",
    description: "Seasoned fried chicken made fresh for your order.",
    price: 160,
    image: "assets/mk-menu/food-jollof.jpg",
  },
  {
    id: "palm-nut-soup",
    category: "Traditional soups",
    name: "Palm Nut Soup",
    description: "Traditional palm nut soup with deep Ghanaian flavor.",
    price: 150,
    image: "assets/mk-menu/food-kokonte.jpg",
  },
  {
    id: "peanut-butter-soup",
    category: "Traditional soups",
    name: "Peanut Butter Soup",
    description: "Creamy peanut butter soup prepared Ghana style.",
    price: 150,
    image: "assets/mk-menu/food-kokonte.jpg",
  },
  {
    id: "okra-soup-stew",
    category: "Traditional soups",
    name: "Okra Soup / Stew",
    description: "Rich okra soup or stew. Add preferences in notes.",
    price: 240,
    image: "assets/mk-menu/food-plate-fish.jpg",
  },
  {
    id: "light-soup",
    category: "Traditional soups",
    name: "Light Soup",
    description: "Comforting Ghanaian light soup, fresh and flavorful.",
    price: 120,
    image: "assets/mk-menu/food-kokonte.jpg",
  },
  {
    id: "salad",
    category: "Sides",
    name: "Salad",
    description: "Fresh salad side for plates and catering orders.",
    price: 100,
    image: "assets/mk-menu/food-plain-rice.jpg",
  },
];

const cart = new Map();
let orderType = "Pickup";

const menuGrid = document.querySelector("#menuGrid");
const cartItems = document.querySelector("#cartItems");
const subtotalEl = document.querySelector("#subtotal");
const totalEl = document.querySelector("#total");
const emailOrder = document.querySelector("#emailOrder");
const textOrder = document.querySelector("#textOrder");
const copyOrder = document.querySelector("#copyOrder");
const orderPreview = document.querySelector("#orderPreview");
const statusMessage = document.querySelector("#statusMessage");
const clearOrder = document.querySelector("#clearOrder");
const orderForm = document.querySelector("#orderForm");

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

function renderMenu() {
  const categories = [...new Set(menuItems.map((item) => item.category))];

  menuGrid.innerHTML = categories
    .map((category) => {
      const items = menuItems
        .filter((item) => item.category === category)
        .map(
          (item) => `
            <article class="menu-item">
              <img class="menu-item__image" src="${item.image}" alt="${item.name}" />
              <div class="menu-item__body">
                <div class="menu-item__top">
                  <h3>${item.name}</h3>
                  <span class="price">${money.format(item.price)}</span>
                </div>
                <p>${item.description}</p>
                <button class="add-button" type="button" data-add="${item.id}">Add to order</button>
              </div>
            </article>
          `,
        )
        .join("");

      return `
        <section class="menu-category" aria-label="${category}">
          <h3>${category}</h3>
          <div class="menu-category__grid">${items}</div>
        </section>
      `;
    })
    .join("");
}

function getSubtotal() {
  return [...cart.values()].reduce((sum, line) => sum + line.item.price * line.quantity, 0);
}

function renderCart() {
  if (cart.size === 0) {
    cartItems.innerHTML = '<p class="empty-state">No items selected yet.</p>';
  } else {
    cartItems.innerHTML = [...cart.values()]
      .map(
        ({ item, quantity }) => `
          <div class="cart-row">
            <div>
              <strong>${item.name}</strong>
              <span>${money.format(item.price)} each</span>
            </div>
            <div class="qty-controls" aria-label="${item.name} quantity">
              <button type="button" data-decrease="${item.id}" aria-label="Decrease ${item.name}">-</button>
              <b>${quantity}</b>
              <button type="button" data-increase="${item.id}" aria-label="Increase ${item.name}">+</button>
            </div>
          </div>
        `,
      )
      .join("");
  }

  const subtotal = getSubtotal();
  subtotalEl.textContent = money.format(subtotal);
  totalEl.textContent = money.format(subtotal);
  updateMessageLinks();
}

function changeQuantity(itemId, amount) {
  const existing = cart.get(itemId);
  const item = menuItems.find((menuItem) => menuItem.id === itemId);

  if (!item) return;

  const nextQuantity = (existing?.quantity || 0) + amount;
  if (nextQuantity <= 0) {
    cart.delete(itemId);
  } else {
    cart.set(itemId, { item, quantity: nextQuantity });
  }

  renderCart();
}

function getFormValue(selector) {
  return document.querySelector(selector).value.trim();
}

function buildOrderMessage() {
  const lines =
    cart.size > 0
      ? [...cart.values()].map(
          ({ item, quantity }) => `- ${quantity} x ${item.name} (${money.format(item.price * quantity)})`,
        )
      : ["- No items selected yet"];

  return [
    `New order for ${business.name}`,
    "",
    `Order type: ${orderType}`,
    `Requested time: ${getFormValue("#orderTime") || "Not provided"}`,
    "",
    "Customer",
    `Name: ${getFormValue("#customerName") || "Not provided"}`,
    `Phone: ${getFormValue("#customerPhone") || "Not provided"}`,
    `Email: ${getFormValue("#customerEmail") || "Not provided"}`,
    `Address: ${getFormValue("#customerAddress") || "Not provided"}`,
    "",
    "Items",
    ...lines,
    "",
    `Estimated total: ${money.format(getSubtotal())}`,
    "",
    "Payment",
    "CashApp: 571-733-1957",
    "Zelle: 571-733-1957",
    "",
    `Notes: ${getFormValue("#orderNotes") || "None"}`,
  ].join("\n");
}

function getMissingOrderFields() {
  const missing = [];

  if (cart.size === 0) missing.push("at least one item");
  if (!getFormValue("#customerName")) missing.push("your name");
  if (!getFormValue("#customerPhone")) missing.push("your phone number");
  if (!getFormValue("#orderTime")) missing.push("date and time");

  return missing;
}

function hasMinimumOrderInfo() {
  return getMissingOrderFields().length === 0;
}

function updateMessageLinks() {
  const message = buildOrderMessage();
  const ready = hasMinimumOrderInfo();
  const missing = getMissingOrderFields();
  const subject = encodeURIComponent(`New ${orderType} order for ${business.name}`);
  const body = encodeURIComponent(message);
  const smsSeparator = /iPad|iPhone|iPod/.test(navigator.userAgent) ? "&" : "?";

  orderPreview.value = message;
  emailOrder.href = `mailto:${business.email}?subject=${subject}&body=${body}`;
  textOrder.href = `sms:${business.phone}${smsSeparator}body=${body}`;
  emailOrder.classList.toggle("is-disabled", !ready);
  textOrder.classList.toggle("is-disabled", !ready);
  emailOrder.setAttribute("aria-disabled", String(!ready));
  textOrder.setAttribute("aria-disabled", String(!ready));

  statusMessage.textContent = ready
    ? "Your order is ready. Tap Email order or Text order to send it to MK'S Kitchen."
    : `Add ${missing.join(", ")} to prepare your order message.`;
}

function showMissingFields() {
  const missing = getMissingOrderFields();
  statusMessage.textContent = `Please add ${missing.join(", ")} first.`;
}

function guardSendAction(event) {
  if (!hasMinimumOrderInfo()) {
    event.preventDefault();
    showMissingFields();
    orderPreview.focus();
  }
}

function sendByEmail(event) {
  guardSendAction(event);
  if (!event.defaultPrevented) {
    statusMessage.textContent = "Opening your email app with the order addressed to sbonsu03@gmail.com.";
  }
}

function sendByText(event) {
  if (!hasMinimumOrderInfo()) {
    event.preventDefault();
    showMissingFields();
    orderPreview.focus();
    return;
  }

  statusMessage.textContent = "Opening your text app with the order addressed to 571-733-1957.";
}

function copyTextFallback(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.left = "-9999px";
  document.body.appendChild(textArea);
  textArea.select();
  const copied = document.execCommand("copy");
  textArea.remove();
  return copied;
}

async function copyOrderMessage() {
  if (!hasMinimumOrderInfo()) {
    showMissingFields();
  }

  const message = buildOrderMessage();

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(message);
    } else if (!copyTextFallback(message)) {
      throw new Error("Copy command failed");
    }
    statusMessage.textContent = "Order copied. Paste it into your text or email app to send it.";
  } catch {
    orderPreview.focus();
    orderPreview.select();
    statusMessage.textContent = "Copy was blocked by this browser. The order message is selected so you can copy it manually.";
  }
}

function setDefaultOrderTime() {
  const nextHour = new Date();
  nextHour.setHours(nextHour.getHours() + 2, 0, 0, 0);
  const localValue = new Date(nextHour.getTime() - nextHour.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  document.querySelector("#orderTime").value = localValue;
}

document.addEventListener("click", (event) => {
  const addId = event.target.closest("[data-add]")?.dataset.add;
  const increaseId = event.target.closest("[data-increase]")?.dataset.increase;
  const decreaseId = event.target.closest("[data-decrease]")?.dataset.decrease;
  const orderTypeButton = event.target.closest("[data-order-type]");

  if (addId) changeQuantity(addId, 1);
  if (increaseId) changeQuantity(increaseId, 1);
  if (decreaseId) changeQuantity(decreaseId, -1);

  if (orderTypeButton) {
    orderType = orderTypeButton.dataset.orderType;
    document.querySelectorAll("[data-order-type]").forEach((button) => {
      button.classList.toggle("is-active", button === orderTypeButton);
    });
    updateMessageLinks();
  }
});

clearOrder.addEventListener("click", () => {
  cart.clear();
  renderCart();
});

orderForm.addEventListener("input", updateMessageLinks);
orderForm.addEventListener("submit", (event) => event.preventDefault());
emailOrder.addEventListener("click", sendByEmail);
textOrder.addEventListener("click", sendByText);
copyOrder.addEventListener("click", copyOrderMessage);

renderMenu();
setDefaultOrderTime();
renderCart();
