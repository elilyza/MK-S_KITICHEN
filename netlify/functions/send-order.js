const json = (statusCode, body) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

function cleanPhoneNumber(phone) {
  return String(phone || "").replace(/[^\d+]/g, "");
}

async function sendEmailWithSendGrid(payload) {
  const apiKey = process.env.SENDGRID_API_KEY;
  const toEmail = process.env.ORDER_EMAIL || "sbonsu03@gmail.com";
  const fromEmail = process.env.SENDGRID_FROM_EMAIL;

  if (!apiKey || !fromEmail) {
    return { skipped: true, reason: "SendGrid is not configured" };
  }

  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: toEmail }] }],
      from: { email: fromEmail, name: "MK'S Kitchen Orders" },
      reply_to: payload.customerEmail ? { email: payload.customerEmail } : undefined,
      subject: `New ${payload.orderType} order from ${payload.customerName}`,
      content: [{ type: "text/plain", value: payload.orderMessage }],
    }),
  });

  if (!response.ok) {
    throw new Error(`SendGrid email failed with status ${response.status}`);
  }

  return { sent: true };
}

async function sendSmsWithTwilio(payload) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromPhone = process.env.TWILIO_FROM_PHONE;
  const toPhone = cleanPhoneNumber(process.env.ORDER_SMS_PHONE || "+15717331957");

  if (!accountSid || !authToken || !fromPhone) {
    return { skipped: true, reason: "Twilio is not configured" };
  }

  const body = new URLSearchParams({
    From: fromPhone,
    To: toPhone,
    Body: payload.orderMessage.slice(0, 1500),
  });

  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`Twilio SMS failed with status ${response.status}`);
  }

  return { sent: true };
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  let payload;

  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { error: "Invalid order payload" });
  }

  if (!payload.customerName || !payload.customerPhone || !payload.orderTime || !payload.orderMessage) {
    return json(400, { error: "Missing required order details" });
  }

  try {
    const [email, sms] = await Promise.all([sendEmailWithSendGrid(payload), sendSmsWithTwilio(payload)]);
    const sentSomething = email.sent || sms.sent;

    if (!sentSomething) {
      return json(501, {
        error: "Notification services are not configured",
        email,
        sms,
      });
    }

    return json(200, { ok: true, email, sms });
  } catch (error) {
    return json(500, { error: error.message || "Order notification failed" });
  }
};
