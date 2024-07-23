/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// this object is generated from Flow Builder under "..." > Endpoint > Snippets > Responses
// To navigate to a screen, return the corresponding response from the endpoint. Make sure the response is encrypted.
const SCREEN_RESPONSES = {
  APPLICANTS: {
    version: "3.0",
    screen: "APPLICANTS",
    data: {
      cover: [
        {
          id: "myself",
          title: "Just myself",
        },
        {
          id: "myself_and_another",
          title: "Myself & another person",
        },
        {
          id: "my_family",
          title: "My family",
        },
        {
          id: "my_children",
          title: "Just my children (under 18)",
        },
      ],
      add_additional: false,
      additional_applicants_count: [
        {
          id: "1",
          title: "1",
        },
        {
          id: "2",
          title: "2",
        },
        {
          id: "3",
          title: "3",
        },
        {
          id: "4",
          title: "4",
        },
        {
          id: "5",
          title: "5",
        },
        {
          id: "6",
          title: "6",
        },
      ],
    },
  },
  COVER_LEVEL: {
    version: "3.0",
    screen: "COVER_LEVEL",
    data: {},
  },
  EXCESS: {
    version: "3.0",
    screen: "EXCESS",
    data: {
      excess: [
        {
          id: "5000.00",
          title: "\u20b9 5000.00",
        },
        {
          id: "10000.00",
          title: "\u20b9 10000.00",
        },
        {
          id: "15000.00",
          title: "\u20b9 15000.00",
        },
        {
          id: "20000.00",
          title: "\u20b9 20000.00",
        },
        {
          id: "25000.00",
          title: "\u20b9 25000.00",
        },
      ],
    },
  },
  DETAILS: {
    version: "3.0",
    screen: "DETAILS",
    data: {},
  },
  YOUR_HEALTH: {
    version: "3.0",
    screen: "YOUR_HEALTH",
    data: {},
  },
  ADDTIONAL_APPLICANT: {
    version: "3.0",
    screen: "ADDTIONAL_APPLICANT",
    data: {
      additional_applicant_title: "Additional Applicant 1",
      additional_applicant_index: 0,
    },
  },
  POLICY_SELECTION: {
    version: "3.0",
    screen: "POLICY_SELECTION",
    data: {
      recommended_policies: [
        {
          id: "essential",
          title: "CS Essential",
        },
        {
          id: "simple",
          title: "CS Simple",
        },
        {
          id: "advanced",
          title: "CS Advanced",
        },
      ],
    },
  },
  SELECTED_POLICY: {
    version: "3.0",
    screen: "SELECTED_POLICY",
    data: {
      selected_policy: "CS Simple",
      starting_price: "Starting from \u20b9 20,000",
      policy_features:
        "\u2705 Pre & post hospitalisation\n\u274c AC Rooms\n\u2705 Recharge benefit\n\u2705 Out patient benefit\n\u2705 Hospital cash\n\u274c Road traffic accident\n\u274c Restoration benefit",
    },
  },
  YOUR_QUOTE: {
    version: "3.0",
    screen: "YOUR_QUOTE",
    data: {
      payment_method: [
        {
          id: "monthly",
          title: "Monthly",
        },
        {
          id: "anuallly",
          title: "Annually (Save \u20b9 1000)",
        },
      ],
      price: "\u20b9 47.98 per month",
      is_price_visible: true,
    },
  },
  SUMMARY: {
    version: "3.0",
    screen: "SUMMARY",
    data: {
      summary_policy: "CS Simple",
      summary_cover_level: "Treatment & full diagnosis",
      summary_people_covered: "Yourself with 2 children",
      summary_excess: "₹ 20000.00",
      summary_payment_method: "Anually",
      summary_cost_per_month: "₹ 1000.00",
    },
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

  // handle initial request when opening the flow and display APPLICANTS screen
  if (action === "INIT") {
    return {
      ...SCREEN_RESPONSES.APPLICANTS,
      data: {
        ...SCREEN_RESPONSES.APPLICANTS.data,
        additional_applicants_count: undefined,
      },
    };
  }

  if (action === "data_exchange") {
    // handle the request based on the current screen
    switch (screen) {
      // handles when user interacts with APPLICANTS screen
      case "APPLICANTS":
        // handles when user selects who they want to cover
        if (data.cover_for_additional != null) {
          const isAddingAdditionalApplicant =
            data.cover_for_additional !== "myself";
          return {
            ...SCREEN_RESPONSES.APPLICANTS,
            data: {
              additional_applicants_count: isAddingAdditionalApplicant
                ? SCREEN_RESPONSES.APPLICANTS.data.additional_applicants_count
                : undefined,
              add_additional: isAddingAdditionalApplicant,
            },
          };
        }
        // otherwise navigate to next screen (COVER_LEVEL)
        return {
          ...SCREEN_RESPONSES.COVER_LEVEL,
          data: {
            // copy data received from Flow
            ...data,
          },
        };

      // handles when user interacts with COVER_LEVEL screen
      case "COVER_LEVEL":
        return {
          ...SCREEN_RESPONSES.EXCESS,
          data: {
            // copy initial screen data and data received from Flow
            ...SCREEN_RESPONSES.EXCESS.data,
            ...data,
          },
        };

      // handles when user interacts with EXCESS screen
      case "EXCESS":
        return {
          ...SCREEN_RESPONSES.DETAILS,
          data: {
            // copy data received from Flow
            ...data,
          },
        };

      // handles when user interacts with DETAILS screen
      case "DETAILS":
        // If user has selected they want to cover only their children skip "YOUR_HEALTH" screen
        if (data.cover === "my_children") {
          return {
            ...SCREEN_RESPONSES.ADDTIONAL_APPLICANT,
            data: {
              ...data,
              additional_applicants: [],
              additional_applicant_title: "Additional Applicant 1",
              additional_applicant_index: 0,
            },
          };
        }

        // otherwise navigate to next screen (YOUR_HEALTH)
        return {
          ...SCREEN_RESPONSES.YOUR_HEALTH,
          data: {
            // copy initial screen data then override specific fields
            ...data,
          },
        };

      // handles when user interacts with YOUR_HEALTH screen
      case "YOUR_HEALTH":
        if (data.cover === "myself") {
          return {
            ...SCREEN_RESPONSES.POLICY_SELECTION,
            data: {
              // copy initial screen data then override specific fields
              ...SCREEN_RESPONSES.POLICY_SELECTION.data,
              ...data,
            },
          };
        }

        // Navigate to next screen (ADDTIONAL_APPLICANT)
        return {
          ...SCREEN_RESPONSES.ADDTIONAL_APPLICANT,
          data: {
            ...data,
            additional_applicants: [],
            additional_applicant_title: "Additional Applicant 1",
            additional_applicant_index: 0,
          },
        };

      // handles when user interacts with ADDTIONAL_APPLICANT screen
      case "ADDTIONAL_APPLICANT":
        const {
          additional_relation,
          additional_dob,
          additonal_comorbidities,
          additonal_tobacco,
          ...rest
        } = data;
        const applicant_index = data.additional_applicant_index + 1;
        const updateApplicantsList = [
          ...data.additional_applicants,
          {
            relation: data.additional_relation,
            dob: data.additional_dob,
            comorbidities: data.additonal_comorbidities,
            tobacco: data.additonal_tobacco,
          },
        ];

        // Continue sending the same screen ID (ADDTIONAL_APPLICANT) until we have collected information for all additional applicants
        if (applicant_index < data.additional_applicants_count) {
          return {
            ...SCREEN_RESPONSES.ADDTIONAL_APPLICANT,
            data: {
              ...rest,
              additional_applicant_title: `Additional Applicant ${
                applicant_index + 1
              }`,
              additional_applicant_index: applicant_index,
              additional_applicants: updateApplicantsList,
            },
          };
        }

        // After all information is collected, navigate to next screen (ADDTIONAL_APPLICANT)
        return {
          ...SCREEN_RESPONSES.POLICY_SELECTION,
          data: {
            // copy initial screen data then override specific fields
            ...SCREEN_RESPONSES.POLICY_SELECTION.data,
            ...rest,
            additional_applicants: updateApplicantsList,
            additional_applicants_count: undefined, // we do not need to send the count to the next screen
            additional_applicant_index: undefined, // we do not need to send the index to the next screen
          },
        };

      // handles when user interacts with POLICY_SELECTION screen
      case "POLICY_SELECTION":
        const policy =
          data.selected_policy === "essenital"
            ? {
                selected_policy: "CS Essential",
                policy_features:
                  "✅ Pre & post hospitalisation\n❌ AC Rooms\n✅ Recharge benefit\n✅ Out patient benefit\n✅ Hospital cash\n❌ Road traffic accident\n❌ Restoration benefit",
                starting_price: "Starting from ₹ 1000.00",
              }
            : data.selected_policy === "simple"
            ? {
                selected_policy: "CS Simple",
                policy_features:
                  "✅ Pre & post hospitalisation\n❌ AC Rooms\n❌ Recharge benefit\n✅ Out patient benefit\n✅ Hospital cash\n❌ Road traffic accident\n❌ Restoration benefit",
                starting_price: "Starting from ₹ 500.00",
              }
            : {
                selected_policy: "CS Advanced",
                policy_features:
                  "✅ Pre & post hospitalisation\n✅ AC Rooms\n✅ Recharge benefit\n✅ Out patient benefit\n✅ Hospital cash\n✅ Road traffic accident\n✅ Restoration benefit",
                starting_price: "Starting from ₹ 1500.00",
              };

        // Navigate to next screen (SELECTED_POLICY)
        return {
          ...SCREEN_RESPONSES.SELECTED_POLICY,
          data: {
            ...data,
            ...policy,
          },
        };

      // handles when user interacts with SELECTED_POLICY screen
      case "SELECTED_POLICY":
        // Navigate to next screen (YOUR_QUOTE)
        return {
          ...SCREEN_RESPONSES.YOUR_QUOTE,
          data: {
            // copy initial screen data then override specific fields
            ...SCREEN_RESPONSES.YOUR_QUOTE.data,
            ...data,
            is_price_visible: false,
          },
        };

      // handles when user interacts with YOUR_QUOTE screen
      case "YOUR_QUOTE":
        // handles when user selects the payment method, so the price is shown
        if (data.price == null) {
          return {
            ...SCREEN_RESPONSES.YOUR_QUOTE,
            data: {
              is_price_visible: true,
              price:
                data.payment_option === "monthly" ? "₹ 1000.00" : "₹ 10000.00",
            },
          };
        }

        // Navigate to the final screen (SUMMARY)
        return {
          ...SCREEN_RESPONSES.SUMMARY,
          data: {
            ...SCREEN_RESPONSES.SUMMARY.data,
            ...data,
          },
        };

      // handles when user completes SUMMARY screen
      case "SUMMARY":
        // TODO: save insurance details to your database and send quote back to user
        // send success response to complete and close the flow
        return {
          ...SCREEN_RESPONSES.SUCCESS,
          data: {
            extension_message_response: {
              params: {
                ...data,
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
