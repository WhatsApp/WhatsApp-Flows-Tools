/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// this object is generated from Flow Builder under "..." > Endpoint > Snippets > Responses
// To navigate to a screen, return the corresponding response from the endpoint. Make sure the response is enccrypted.
const SCREEN_RESPONSES = {
  LOAN: {
    version: "3.0",
    screen: "LOAN",
    data: {
      tenure: [
        {
          id: "months12",
          title: "12 months",
        },
        {
          id: "months24",
          title: "24 months",
        },
        {
          id: "months36",
          title: "36 months",
        },
        {
          id: "months48",
          title: "48 months",
        },
      ],
      amount: [
        {
          id: "amount1",
          title: "\u20b9 7,20,000",
        },
        {
          id: "amount2",
          title: "\u20b9 3,20,000",
        },
      ],
      emi: "₹ 18,000",
      rate: "9% pa",
      fee: "500",
      selected_amount: "amount1",
      selected_tenure: "months48",
    },
  },
  DETAILS: {
    version: "3.0",
    screen: "DETAILS",
    data: {
      is_upi: false,
      is_account: false,
      emi: "\u20b9 20,000",
      tenure: "12 months",
      amount: "\u20b9 500",
    },
  },
  SUMMARY: {
    version: "3.0",
    screen: "SUMMARY",
    data: {
      amount: "\u20b9 7,20,000",
      tenure: "12 months",
      rate: "9% pa",
      emi: "\u20b9 3500",
      fee: "\u20b9 500",
      payment_mode: "Transfer to account xxxx2342",
    },
  },
  COMPLETE: {
    version: "3.0",
    screen: "COMPLETE",
    data: {},
  },
  SUCCESS: {
    version: "3.0",
    screen: "SUCCESS",
    data: {
      extension_message_response: {
        params: {
          flow_token: "REPLACE_FLOW_TOKEN",
          some_param_name: "PASS_CUSTOM_VALUE",
        },
      },
    },
  },
};


// Example loan repayments for the ammounts listed above
const LOAN_OPTIONS = {
  amount1: {
    months12: "₹ 63,000",
    months24: "₹ 33,000",
    months36: "₹ 23,000",
    months48: "₹ 18,000",
  },
  amount2: {
    months12: "₹ 28,000",
    months24: "₹ 14,600",
    months36: "₹ 10,000",
    months48: "₹ 8,000",
  },
};

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

  // handle initial request when opening the flow and display LOAN screen
  if (action === "INIT") {
    return {
      ...SCREEN_RESPONSES.LOAN,
    };
  }

  if (action === "data_exchange") {
    // handle the request based on the current screen
    switch (screen) {
      // handles when user interacts with LOAN screen
      case "LOAN":
        // Handles user clicking on Continue to navigate to next screen
        if (data.emi != null) {
          return {
            ...SCREEN_RESPONSES.DETAILS,
            data: {
              // copy initial screen data then override specific fields
              ...SCREEN_RESPONSES.DETAILS.data,
              amount: SCREEN_RESPONSES.LOAN.data.amount
                .filter((a) => a.id === data.amount)
                .map((a) => a.title)[0],
              tenure: SCREEN_RESPONSES.LOAN.data.tenure
                .filter((t) => t.id === data.tenure)
                .map((t) => t.title)[0],
              emi: data.emi,
            },
          };
        }
        // otherwise refresh quote based on user selection
        return {
          ...SCREEN_RESPONSES.LOAN,
          data: {
            selected_amount: data.amount,
            selected_tenure: data.tenure,
            emi: LOAN_OPTIONS[data.amount][data.tenure],
          },
        };
      case "DETAILS":
        // Handles user selecting UPI or Banking selector
        if (data.payment_mode != null) {
          return {
            ...SCREEN_RESPONSES.DETAILS,
            data: {
              is_upi: data.payment_mode == "UPI",
              is_account: data.payment_mode == "Bank",
            },
          };
        }
        // Handles user clicking on Continue
        const payment_string =
          data.upi_id != null
            ? "Upi xxxx" + data.upi_id.slice(-4)
            : "account xxxx" + data.account_number.slice(-4);
        return {
          ...SCREEN_RESPONSES.SUMMARY,
          data: {
            // copy initial screen data then override specific fields
            ...SCREEN_RESPONSES.SUMMARY.data,
            amount: data.amount,
            tenure: data.tenure,
            emi: data.emi,
            payment_mode: "Transfer to " + payment_string,
          },
        };

      // handles when user completes SUMMARY screen
      case "SUMMARY":
        // TODO: save loan to your database and send money to user account
        // send success response to complete and close the flow
        return {
          ...SCREEN_RESPONSES.COMPLETE,
          data: {},
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
