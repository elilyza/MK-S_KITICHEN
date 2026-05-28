const business = {
  name: "MK'S Kitchen",
  email: "sasampong@gmail.com",
  phone: "+15715359722",
};

const menuItems = [
  {
    id: "waakye",
    name: "Waakye Plate",
    description: "Rice and beans with spaghetti, egg, gari, salad, and pepper sauce.",
    price: 18,
  },
  {
    id: "jollof-chicken",
    name: "Jollof Rice & Chicken",
    description: "Ghana-style jollof rice served with chicken, salad, and shito.",
    price: 20,
  },
  {
    id: "fried-yam",
    name: "Fried Yam & Chofi",
    description: "Golden fried yam served with turkey tail, pepper, and fresh garnish.",
    price: 17,
  },
  {
    id: "fried-rice",
    name: "Fried Rice & Chicken",
    description: "Seasoned fried rice with vegetables, chicken, salad, and sauce.",
    price: 19,
  },
  {
    id: "red-red",
    name: "Red Red & Plantain",
    description: "Black-eyed bean stew with ripe fried plantain and gari.",
    price: 16,
  },
  {
    id: "catering-pan",
    name: "Catering Party Pan",
    description: "Half pan of waakye, jollof, fried rice, or fried yam. Choose in notes.",
    price: 95,
  },
];

const cart = new Map();
let orderType = "Pickup";

const menuGrid = document.querySelector("#menuGrid");
const cartItems = document.querySelector("#cartItems");
const subtotalEl = document.querySelector("#subtotal");
const totalEl = document.querySelector("#total");
const submitOrder = document.querySelector("#submitOrder");
const textOrder = document.querySelector("#textOrder");
const copyOrder = document.querySelector("#copyOrder");
const orderPreview = document.querySelector("#orderPreview");
const statusMessage = document.querySelector("#statusMessage");
const clearOrder = document.querySelector("#clearOrder");
const orderForm = document.querySelector("#orderForm");
const orderTypeField = document.querySelector("#orderTypeField");
const orderItemsField = document.querySelector("#orderItemsField");
const orderTotalField = document.querySelector("#orderTotalField");
const orderMessageField = document.querySelector("#orderMessageField");

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function renderMenu() {
  menuGrid.innerHTML = menuItems
    .map(
      (item) => `
        <article class="menu-item">
          <div class="menu-item__top">
            <h3>${item.name}</h3>
            <span class="price">${money.format(item.price)}</span>
          </div>
          <p>${item.description}</p>
          <button class="add-button" type="button" data-add="${item.id}">Add to order</button>
        </article>
      `,
    )
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
    `Notes: ${getFormValue("#orderNotes") || "None"}`,
  ].join("\n");
}

function getOrderItemsText() {
  return cart.size > 0
    ? [...cart.values()].map(({ item, quantity }) => `${quantity} x ${item.name}`).join(", ")
    : "No items selected";
}

function buildOrderPayload() {
  return {
    businessName: business.name,
    recipientEmail: business.email,
    recipientPhone: business.phone,
    orderType,
    customerName: getFormValue("#customerName"),
    customerPhone: getFormValue("#customerPhone"),
    customerEmail: getFormValue("#customerEmail"),
    orderTime: getFormValue("#orderTime"),
    customerAddress: getFormValue("#customerAddress"),
    orderNotes: getFormValue("#orderNotes"),
    orderItems: getOrderItemsText(),
    orderTotal: money.format(getSubtotal()),
    orderMessage: buildOrderMessage(),
  };
}

function syncNetlifyFields() {
  const payload = buildOrderPayload();
  orderTypeField.value = payload.orderType;
  orderItemsField.value = payload.orderItems;
  orderTotalField.value = payload.orderTotal;
  orderMessageField.value = payload.orderMessage;
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
  orderPreview.value = message;
  syncNetlifyFields();

  statusMessage.textContent = ready
    ? "Your order is ready. Tap Submit order to send it to MK'S Kitchen."
    : `Add ${missing.join(", ")} to prepare your order message.`;
}

function showMissingFields() {
  const missing = getMissingOrderFields();
  statusMessage.textContent = `Please add ${missing.join(", ")} first.`;
}

function isLocalPreview() {
  return ["localhost", "127.0.0.1", ""].includes(window.location.hostname);
}

function encodeFormData(data) {
  return new URLSearchParams(data).toString();
}

async function submitToNetlifyForms(payload) {
  const formData = {
    "form-name": "mk-kitchen-orders",
    "bot-field": "",
    customerName: payload.customerName,
    customerPhone: payload.customerPhone,
    customerEmail: payload.customerEmail,
    orderTime: payload.orderTime,
    customerAddress: payload.customerAddress,
    orderNotes: payload.orderNotes,
    orderType: payload.orderType,
    orderItems: payload.orderItems,
    orderTotal: payload.orderTotal,
    orderMessage: payload.orderMessage,
  };

  const response = await fetch("/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: encodeFormData(formData),
  });

  if (!response.ok) {
    throw new Error("Netlify form submission failed");
  }
}

async function submitToOrderFunction(payload) {
  const response = await fetch("/.netlify/functions/send-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Order notification function is not available");
  }

  return response.json();
}

async function submitOrderForm(event) {
  event.preventDefault();

  if (!hasMinimumOrderInfo()) {
    showMissingFields();
    orderPreview.focus();
    return;
  }

  syncNetlifyFields();
  const payload = buildOrderPayload();

  if (isLocalPreview()) {
    await copyOrderMessage();
    statusMessage.textContent =
      "Local preview cannot send orders. Open https://mkskitchen.netlify.app to test Submit order, or paste the copied order into a text to 571-535-9722.";
    return;
  }

  submitOrder.disabled = true;
  submitOrder.classList.add("is-disabled");
  statusMessage.textContent = "Sending your order to MK'S Kitchen...";

  try {
    await submitToNetlifyForms(payload);

    try {
      await submitToOrderFunction(payload);
    } catch {
      // Netlify Forms captured the order; SMS/email provider keys may not be configured yet.
    }

    orderForm.reset();
    cart.clear();
    setDefaultOrderTime();
    renderCart();
    statusMessage.textContent = "Order submitted. Thank you. MK'S Kitchen received your order.";
  } catch {
    try {
      await submitToOrderFunction(payload);
      orderForm.reset();
      cart.clear();
      setDefaultOrderTime();
      renderCart();
      statusMessage.textContent = "Order sent. Thank you. MK'S Kitchen received your order.";
    } catch {
      orderPreview.focus();
      orderPreview.select();
      statusMessage.textContent =
        "The website could not submit the order. The order is selected, so please copy it and text it to 571-535-9722.";
    }
  } finally {
    submitOrder.disabled = false;
    submitOrder.classList.remove("is-disabled");
  }
}

async function sendByText() {
  if (!hasMinimumOrderInfo()) {
    showMissingFields();
    orderPreview.focus();
    return;
  }

  const message = buildOrderMessage();
  await copyOrderMessage();

  const body = encodeURIComponent(message);
  const smsSeparator = /iPad|iPhone|iPod/.test(navigator.userAgent) ? "&" : "?";
  window.location.href = `sms:${business.phone}${smsSeparator}body=${body}`;
  statusMessage.textContent = "Order copied. If your text app did not open, paste it into a text to 571-535-9722.";
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
orderForm.addEventListener("submit", submitOrderForm);
textOrder.addEventListener("click", sendByText);
copyOrder.addEventListener("click", copyOrderMessage);

renderMenu();
setDefaultOrderTime();
renderCart();
