# WhatsApp Flows Webhook Server
This is an example WA webhook server to send WhatsApp Flows https://developers.facebook.com/docs/whatsapp/flows

## WhatsApp Webhook Docs

Refer to the [docs here for implementing your webhook](https://developers.facebook.com/docs/whatsapp/cloud-api/guides/set-up-webhooks)

## ⚠️ WARNING ⚠️

This project is meant to be an example for prototyping only. It's not production ready.


## Environment Setup

1. Set these environment variables
- `WEBHOOK_VERIFY_TOKEN`: You can use any string and use the same when setting up the webhook in your app in the following steps.
- `GRAPH_API_TOKEN`: You can get a **Temporary access token** from the dashboard of your app on **Meta for Developers** when you click **API Setup** under the **WhatsApp** section on the left navigation pane.
- `FLOW_ID`: Set this to the Flow ID that you want to send after you create the flow.

2. Run the server, get its URL, then add `/webhook` to it.
3. Subscribe the webhook URL in the dashboard of your app on **Meta for Developers**. Click the **Configuration** menu under **WhatsApp** in the left navigation pane.
   In the **Webhook** section, click **Edit** and paste your webhook URL from the previous step. For the **Verify token** field, use the `VERIFY_TOKEN` value in your .env file, then click **Verify and save**.
   Under the **Webhook fields** section click **Manage** and make sure **messages** field is selected.
4. Edit `server.js` to change the webhook logic as needed.
