/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const getNextScreen = async (decryptedBody) => {
  const { screen, data, version, action, flow_token } = decryptedBody;
  // handle health check request
  if (action === "ping") {
    return {
      version,
      data: {
        status: "active",
      },
    };
  }

  // handle error notification
  if (data?.error) {
    console.warn("Received client error:", data);
    return {
      version,
      data: {
        acknowledged: true,
      },
    };
  }

  // handle initial request when opening the flow
  if (action === "INIT") {
    return {
      version,
      screen: "MY_SCREEN",
      data: {
        // custom data for the screen
        greeting: "Hey there! 👋",
      },
    };
  }

  if (action === "data_exchange") {
    // handle the request based on the current screen
    switch (screen) {
      case "MY_SCREEN":
        // TODO: process flow input data
        console.info("Input name:", data?.name);

        // send success response to complete and close the flow
        return {
          version,
          screen: "SUCCESS",
          data: {
            extension_message_response: {
              params: {
                flow_token,
              },
            },
          },
        };
      default:
        break;
    }
  }

  console.error("Unhandled request body:", decryptedBody);
  throw new Error(
    "Unhandled endpoint request. Make sure you handle the request action & screen logged above."
  );
};
