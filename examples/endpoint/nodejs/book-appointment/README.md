# WhatsApp Flow Endpoint Server
This endpoint example is designed to be used with the [appointment booking Flow template](https://developers.facebook.com/docs/whatsapp/flows/examples/templates#book-an-appointment)

## Flow Endpoint Docs

Refer to the [docs here for implementing your Flow Endpoint](https://developers.facebook.com/docs/whatsapp/flows/guides/implementingyourflowendpoint)

## ⚠️ WARNING ⚠️

This project is meant to be an example for prototyping only. It's not production ready.


## Environment Setup

1. Create a private & public key pair for testing, if you haven't already, using the included script `src/keyGenerator.js`. Run the below command in the terminal to generate a key pair, then follow [these steps to upload the key pair](https://developers.facebook.com/docs/whatsapp/flows/guides/implementingyourflowendpoint#upload_public_key) to your business phone number.
```
node src/keyGenerator.js {passphrase}
```
2. Set your environment variables for private key and passphrase. Make sure a multiline key has correct line breaks.
```
PASSPHRASE="my-secret"

PRIVATE_KEY="-----[REPLACE THIS] BEGIN RSA PRIVATE KEY-----
MIIE...
...
...xyz
-----[REPLACE THIS] END RSA PRIVATE KEY-----"
```
3. Run the server and set its URL as your endpoint URL.
4. Edit `src/flow.js` with your logic to navigate between the Flow screens.
