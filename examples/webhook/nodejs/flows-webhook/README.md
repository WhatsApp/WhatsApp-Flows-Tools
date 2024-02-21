# WhatsApp Flows Webhook Server
This is an example WA webhook server to send WhatsApp Flows https://developers.facebook.com/docs/whatsapp/flows

## WhatsApp Webhook Docs

Refer to the [docs here for implementing your webhook](https://developers.facebook.com/docs/whatsapp/cloud-api/guides/set-up-webhooks)

## ⚠️ WARNING ⚠️

- This project is meant to be an example for prototyping only. It's not production ready.
- When you remix (fork) this project on Glitch, your code is public by default, unless you choose to make it private (requires paid subscription to Glitch). Do not use this for any proprietary/private code.
- Env variables are stored & managed by Glitch. Never use the secrets for your production accounts here. Create temporary secrets for testing on Glitch only and replace them with your production secrets in your own infrastructure.
- Running this webhook example on Glitch is completely optional and is not required to use WhatsApp Flows. You can run this code in any other environment you prefer.

## Glitch Setup

1. Create an account on Glitch to have access to all features mentioned here.
2. Remix this project on Glitch.
3. Click on the file `.env` on the left sidebar, and set these environment variables

- `WEBHOOK_VERIFY_TOKEN`: You can use any string and use the same when setting up the webhook in your app in the following steps.
- `GRAPH_API_TOKEN`: You can get a **Temporary access token** from the dashboard of your app on **Meta for Developers** when you click **API Setup** under the **WhatsApp** section on the left navigation pane.
- `FLOW_ID`: Set this to the Flow ID that you want to send after you create the flow.

4. Get the new Glitch URL to use as your webhook, eg: `https://project-name.glitch.me/webhook`. You can find the base URL by clicking on **Share** on top right in Glitch, copy the **Live Site** URL, then add `/webhook` to it.
5. Subscribe the webhook URL in the dashboard of your app on **Meta for Developers**. Click the **Configuration** menu under **WhatsApp** in the left navigation pane.
   In the **Webhook** section, click **Edit** and paste your webhook URL from the previous step. For the **Verify token** field, use the `VERIFY_TOKEN` value in your .env file, then click **Verify and save**.
   Under the **Webhook fields** section click **Manage** and make sure **messages** field is selected.
6. Edit `server.js` to change the webhook logic as needed.
7. Click on the **Logs** tab at the bottom to view server logs. The logs section also has a button to attach a debugger via Chrome devtools.
