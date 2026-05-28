# MK'S Kitchen Ordering App

A simple static ordering app for MK'S Kitchen. Customers can choose menu items, enter contact details, and send the completed order by email or text message.

## Open the App

Open `index.html` in a browser.

## Set Your Order Destination

Edit the `business` section at the top of `app.js`:

```js
const business = {
  name: "MK'S Kitchen",
  email: "orders@mkskitchen.com",
  phone: "+15551234567",
};
```

Replace the email and phone with the address and mobile number where you want orders sent.

## Important Note

This version uses `mailto:` and `sms:` links, so the customer sends the order from their own email or text app. Some browsers, including in-app preview browsers, may block those links or may not have a mail/text app connected. Customers can use the Copy order button in that case.

For automatic server-side delivery without opening the customer's email or messages app, the next step would be adding a small backend service with an email provider or Twilio.
