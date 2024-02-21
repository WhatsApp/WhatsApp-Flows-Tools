/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

const { WEBHOOK_VERIFY_TOKEN, GRAPH_API_TOKEN, FLOW_ID, PORT } = process.env;

app.post("/webhook", async (req, res) => {
  console.log("Incoming webhook message:", JSON.stringify(req.body, null, 2));

  // check if the webhook contains a message
  // info on WhatsApp text message payload: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples#text-messages
  const message = req.body.entry?.[0]?.changes[0]?.value?.messages?.[0];
  const business_phone_number_id =
    req.body.entry?.[0].changes?.[0].value?.metadata?.phone_number_id;
  if (message) {
    if (
      message.type === "text" &&
      // for demo purposes, send the flow message whenever a user sends a message containing "appointment"
      message.text.body.toLowerCase().includes("appointment")
    ) {
      // send flow message as per the docs here https://developers.facebook.com/docs/whatsapp/flows/gettingstarted/sendingaflow#interactive-message-parameters
      await axios({
        method: "POST",
        url: `https://graph.facebook.com/v18.0/${business_phone_number_id}/messages`,
        headers: {
          Authorization: `Bearer ${GRAPH_API_TOKEN}`,
        },
        data: {
          messaging_product: "whatsapp",
          to: message.from,
          type: "interactive",
          interactive: {
            type: "flow",
            header: {
              type: "text",
              text: "Hello there 👋",
            },
            body: {
              text: "Ready to transform your space? Schedule a personalized consultation with our expert team!",
            },
            footer: {
              text: "Click the button below to proceed",
            },
            action: {
              name: "flow",
              parameters: {
                flow_id: FLOW_ID,
                flow_message_version: "3",
                // replace flow_token with a unique identifier for this flow message to track it in your endpoint & webhook
                flow_token: "<FLOW_TOKEN_PLACEHOLDER>",
                flow_cta: "Book an appointment",
                flow_action: "data_exchange",
                // uncomment to send a draft flow before publishing
                // mode: "draft",
              },
            },
          },
        },
      });
    }

    // handle flow response message
    if (
      message.type === "interactive" &&
      message.interactive?.type === "nfm_reply"
    ) {
      // send confirmation message
      await axios({
        method: "POST",
        url: `https://graph.facebook.com/v18.0/${business_phone_number_id}/messages`,
        headers: {
          Authorization: `Bearer ${GRAPH_API_TOKEN}`,
        },
        data: {
          messaging_product: "whatsapp",
          to: message.from,
          text: { body: "You've successfully booked an appointment" },
        },
      });
    }

    // mark incoming message as read
    await axios({
      method: "POST",
      url: `https://graph.facebook.com/v18.0/${business_phone_number_id}/messages`,
      headers: {
        Authorization: `Bearer ${GRAPH_API_TOKEN}`,
      },
      data: {
        messaging_product: "whatsapp",
        status: "read",
        message_id: message.id,
      },
    });
  }

  res.sendStatus(200);
});

// accepts GET requests at the /webhook endpoint. You need this URL to setup webhook initially.
// info on verification request payload: https://developers.facebook.com/docs/graph-api/webhooks/getting-started#verification-requests
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  // check the mode and token sent are correct
  if (mode === "subscribe" && token === WEBHOOK_VERIFY_TOKEN) {
    // respond with 200 OK and challenge token from the request
    res.status(200).send(challenge);
    console.log("Webhook verified successfully!");
  } else {
    // respond with '403 Forbidden' if verify tokens do not match
    res.sendStatus(403);
  }
});

app.get("/", (req, res) => {
  res.send(`<pre>Nothing to see here.
Checkout README.md to start.</pre>`);
});

app.listen(PORT, () => {
  console.log(`Server is listening on port: ${PORT}`);
});
