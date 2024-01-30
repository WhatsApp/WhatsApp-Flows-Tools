/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import crypto from "crypto";

/* The script will generate a public and private key pair and log the same in the console.
 * Copy paste the private key into your /.env file and public key should be added to your account.
 * For more details visit: https://developers.facebook.com/docs/whatsapp/flows/guides/implementingyourflowendpoint#upload_public_key
 *
 * Run this script using command below:
 *
 *             node src/keyGenerator.js
 *
 */

const passphrase = "top secret";

crypto.generateKeyPair(
  "rsa",
  {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs1",
      format: "pem",
      cipher: "des-ede3-cbc",
      passphrase: passphrase,
    },
  },
  (err, publicKey, privateKey) => {
    // Handle errors and use the generated key pair.
    if (err) {
      return console.log("Error while creating public private key pair: ", err);
    }

    console.log(
      "Succesfully created your public private key pair. Please copy paste the below values into your /.env files."
    );
    console.log("\n************* COPY PASSPHRASE BELOW *************\n");
    console.log(passphrase);
    console.log("\n************* COPY PUBLIC KEY BELOW *************\n");
    console.log(publicKey);
    console.log("\n************* COPY PUBLIC KEY ABOVE *************\n");
    console.log("\n************* COPY PRIVATE KEY BELOW *************\n");
    console.log(privateKey);
    console.log("\n************* COPY PUBLIC KEY ABOVE *************");
  }
);
