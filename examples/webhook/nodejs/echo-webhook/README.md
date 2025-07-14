# WhatsApp Platform Quick Start

Welcome to your first step toward building awesome WhatsApp apps!

This project contains the code for a simple webhook you can use to get started using the WhatsApp Platform.

The code here mirrors what is in our [webhook set up guide](https://developers.facebook.com/docs/whatsapp/cloud-api/guides/set-up-webhooks), and may be used as the starting point for doing the ["Get Started With the WhatsApp Business Cloud API guide"](https://developers.facebook.com/docs/whatsapp/getting-started/signing-up/).

## Additional Resources

Interested in learning more about the WhatsApp Platform?

Check out these resources:

- [**Webhook set up guide**](https://developers.facebook.com/docs/whatsapp/getting-started/signing-up/#configure-webhooks): The walkthrough for the code in this project.

- [**Quick start tutorial**](https://developers.facebook.com/docs/whatsapp/getting-started/signing-up/): Build your first app by remixing this project and following our quick start tutorial.

- [**WhatsApp Business Platform Documentation**](https://developers.facebook.com/docs/whatsapp/)

## ⚠️ WARNING ⚠️

This project is meant to be an example for prototyping only. It's not production ready.

## Environment Setup

1. Set these environment variables
- `WEBHOOK_VERIFY_TOKEN`: You can use any string and use the same when setting up the webhook in your app in the following steps.
- `GRAPH_API_TOKEN`: You can get a **Temporary access token** from the dashboard of your app on **Meta for Developers** when you click **API Setup** under the **WhatsApp** section on the left navigation pane.

2. Run the server, get its URL, then add `/webhook` to it.
3. Subscribe the webhook URL in the dashboard of your app on **Meta for Developers**. Click the **Configuration** menu under **WhatsApp** in the left navigation pane.
   In the **Webhook** section, click **Edit** and paste your webhook URL from the previous step. For the **Verify token** field, use the `VERIFY_TOKEN` value in your .env file, then click **Verify and save**.
   Under the **Webhook fields** section click **Manage** and make sure **messages** field is selected.
4. Edit `server.js` to change the webhook logic as needed.
