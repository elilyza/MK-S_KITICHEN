# MK'S Kitchen Ordering App

A simple ordering app for MK'S Kitchen. Customers can choose menu items, enter contact details, and send the completed order by email, text, or copy/paste.

## Open the App

Open `index.html` in a browser.

Public app: https://mkskitchen.netlify.app

GitHub repository: https://github.com/elilyza/MK-S_KITICHEN

## Notifications

Orders are addressed to:

```text
sasampong@gmail.com
571-535-9722
```

The customer-facing order buttons use direct email and text links:

- Email order opens a message to `sasampong@gmail.com`
- Text order opens a text to `571-535-9722`
- Copy order copies the full order message as a fallback

The app also includes a Netlify Function at `netlify/functions/send-order.js` for future automatic notifications.
To send email and SMS automatically in the background, add these environment variables in Netlify:

- `ORDER_EMAIL`
- `ORDER_SMS_PHONE`
- `SENDGRID_API_KEY`
- `SENDGRID_FROM_EMAIL`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_FROM_PHONE`

Without those service keys, no website can send a true background text message by itself. Customers can still use the Email order, Text order, or Copy order buttons.
