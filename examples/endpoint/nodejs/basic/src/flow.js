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

  if (action === "data_exchange" && screen === "MY_SCREEN") {
    // TODO: process flow input data
    console.info("Input name:", data?.name);

    // send success payload to finish the flow
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
  }

  throw new Error(`Unsupported request action ${action} & screen: ${screen}`);
};
