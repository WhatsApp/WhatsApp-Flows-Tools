# WhatsApp Flow Endpoint Server
This endpoint example is designed to be used with the [appointment booking Flow template](https://developers.facebook.com/docs/whatsapp/flows/examples/templates#book-an-appointment)

## Flow Endpoint Docs

Refer to the [docs here for implementing your Flow Endpoint](https://developers.facebook.com/docs/whatsapp/flows/guides/implementingyourflowendpoint)

## ⚠️ WARNING ⚠️

- This project is meant to be an example for prototyping only. It's not production ready.
- When you remix (fork) this project on Glitch, your code is public by default, unless you choose to make it private (requires paid subscription to Glitch). Do not use this for any proprietary/private code.
- Env variables are stored & managed by Glitch. Never use the private keys for your production accounts here. Create a temporary private key for testing on Glitch only and replace it with your production key in your own infrastructure.
- Running this endpoint example on Glitch is completely optional and is not required to use WhatsApp Flows. You can run this code in any other environment you prefer.

## Glitch Setup

1. Create an account on Glitch to have access to all features mentioned here.
2. Remix this project on Glitch.
3. Create a private & public key pair for testing, if you haven't already, using the included script `src/keyGenerator.js`. Run the below command in the terminal to generate a key pair, then follow [these steps to upload the key pair](https://developers.facebook.com/docs/whatsapp/flows/guides/implementingyourflowendpoint#upload_public_key) to your business phone number.
```
node src/keyGenerator.js {passphrase}
```
4. Click on the file ".env" on the left sidebar, **then click on `✏️ Plain text` on top. Do not edit it directly from UI as it will break your key formatting.**
5. Edit it with your private key and passphrase. Make sure a multiline key has the same line breaks like below. Env variables are only visible to the owner of the Glitch project. **Use a separate private key for testing only, and not your production key.**
```
PASSPHRASE="my-secret"

PRIVATE_KEY="-----[REPLACE THIS] BEGIN RSA PRIVATE KEY-----
MIIE...
...
...xyz
-----[REPLACE THIS] END RSA PRIVATE KEY-----"
```

6. Use the new Glitch URL as your endpoint URL, eg: `https://project-name.glitch.me`. You can find this URL by clicking on `Share` on top right, then copy the `Live Site` URL.
7. Edit `src/flow.js` with your logic to navigate between the Flow screens.
8. Click on the `Logs` tab at the bottom to view server logs. The logs section also has a button to attach a debugger via Chrome devtools.
