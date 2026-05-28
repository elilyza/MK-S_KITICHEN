# MK'S Kitchen Ordering App

A simple ordering app for MK'S Kitchen. Customers can choose menu items, enter contact details, and submit the completed order.

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

The app includes a Netlify Function at `netlify/functions/send-order.js` for automatic notifications.
To send email and SMS automatically, add these environment variables in Netlify:

- `ORDER_EMAIL`
- `ORDER_SMS_PHONE`
- `SENDGRID_API_KEY`
- `SENDGRID_FROM_EMAIL`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_FROM_PHONE`

The app also submits to Netlify Forms as a backup. In Netlify, open the site and enable email notifications for the `mk-kitchen-orders` form so orders can be emailed even before the SendGrid/Twilio keys are added.

Without those service keys, no website can send a true background text message by itself. Customers can still use the Text backup or Copy order buttons.

Submit order only works on the public Netlify app, not from `http://127.0.0.1:8000`, because Netlify Forms and Netlify Functions run on Netlify. The form uses Netlify's built-in success page after submission.
