/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import express from "express";
import { decryptRequest, encryptResponse } from "./encryption.js";
import { getNextScreen } from "./flow.js";

const app = express();
app.use(express.json());

const PORT = process.env.PORT;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
/* 
Example:
```-----BEGIN RSA PRIVATE KEY----
MIIE...
...
...AQAB
-----END RSA PRIVATE KEY-----```
*/

app.post("/", async ({ body }, res) => {
  const { decryptedBody, aesKeyBuffer, initialVectorBuffer } = decryptRequest(
    body,
    PRIVATE_KEY
  );

  const screenResponse = await getNextScreen(decryptedBody);
  res.send(encryptResponse(screenResponse, aesKeyBuffer, initialVectorBuffer));
});

app.get("/", (req, res) => {
  res.send(`<pre>Nothing to see here.
Checkout README.md to start.</pre>`);
});

app.listen(PORT, () => {
  console.log(`Server is listening on port: ${PORT}`);
});
