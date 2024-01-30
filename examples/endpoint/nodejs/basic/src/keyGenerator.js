/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* The script will generate a public and private key pair and log the same in the console.
 * Copy paste the private key into your /.env file and public key should be added to your account.
 * For more details visit: https://developers.facebook.com/docs/whatsapp/flows/guides/implementingyourflowendpoint#upload_public_key
 *
 * Run this script using command below:
 *
 *             node src/keyGenerator.js {passphrase}
 *
 */

import crypto from "crypto";

const passphrase = process.argv[2];
if (!passphrase) {
  throw new Error(
    "Passphrase is empty. Please include passphrase argument to generate the keys like: node src/keyGenerator.js {passphrase}"
  );
}

try {
  const keyPair = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs1",
      format: "pem",
      cipher: "des-ede3-cbc",
      passphrase,
    },
  });

  console.log(`Successfully created your public private key pair. Please copy the below values into your /.env file
************* COPY PASSPHRASE & PRIVATE KEY BELOW TO .env FILE *************
PASSPHRASE="${passphrase}"

PRIVATE_KEY="${keyPair.privateKey}"
************* COPY PASSPHRASE & PRIVATE KEY ABOVE TO .env FILE *************

************* COPY PUBLIC KEY BELOW *************
${keyPair.publicKey}
************* COPY PUBLIC KEY ABOVE *************
`);
} catch (err) {
  console.error("Error while creating public private key pair:", err);
}
