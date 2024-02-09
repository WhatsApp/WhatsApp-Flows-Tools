# Copyright (c) Meta Platforms, Inc. and affiliates.

# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.
import os
import re
import uuid

import requests
from dotenv import load_dotenv
from flask import Flask, json, make_response, request
from llama_cpp import Llama

app = Flask(__name__)

load_dotenv()
PHONE_NUMBER_ID = os.getenv("PHONE_NUMBER_ID")
url = f"https://graph.facebook.com/v18.0/{PHONE_NUMBER_ID}/messages"
TOKEN = os.getenv("TOKEN")
ACCESS_TOKEN = os.getenv("ACCESS_TOKEN")
code_prompt_texts = ["Contact us", "Chat with our chatbot", "YES", "NO"]

service_list = [
    "Accommodation Services",
    "Spa Services",
    "Dining Services",
    "Recreational Facilities",
    "Business & Conference Services",
    "Transportation Services",
    "Accessibility Services",
    "Pet-Friendly Services",
]


@app.route("/webhook", methods=["GET"])
def webhook_get():
    if request.method == "GET":
        if (
            request.args.get("hub.mode") == "subscribe"
            and request.args.get("hub.verify_token") == TOKEN
        ):
            return make_response(request.args.get("hub.challenge"), 200)
        else:
            return make_response("Success", 403)


@app.route("/webhook", methods=["POST"])
def webhook_post():
    if request.method == "POST":
        request_data = json.loads(request.get_data())
        if (
            request_data["entry"][0]["changes"][0]["value"].get("messages")
        ) is not None:
            name = request_data["entry"][0]["changes"][0]["value"]["contacts"][0][
                "profile"
            ]["name"]
            if (
                request_data["entry"][0]["changes"][0]["value"]["messages"][0].get(
                    "text"
                )
            ) is not None:
                message = request_data["entry"][0]["changes"][0]["value"]["messages"][
                    0
                ]["text"]["body"]
                user_phone_number = request_data["entry"][0]["changes"][0]["value"][
                    "contacts"
                ][0]["wa_id"]
                user_message_processor(message, user_phone_number, name)
            else:
                # checking that there is data in a flow's response object before processing it
                if (
                    request_data["entry"][0]["changes"][0]["value"]["messages"][0][
                        "interactive"
                    ]["nfm_reply"]["response_json"]
                ) is not None:
                    flow_reply_processor(request)

    return make_response("PROCESSED", 200)


def flow_reply_processor(request):
    request_data = json.loads(request.get_data())
    name = request_data["entry"][0]["changes"][0]["value"]["contacts"][0]["profile"][
        "name"
    ]
    message = request_data["entry"][0]["changes"][0]["value"]["messages"][0][
        "interactive"
    ]["nfm_reply"]["response_json"]

    flow_message = json.loads(message)
    flow_key = flow_message["flow_key"]
    if flow_key == "agentconnect":
        firstname = flow_message["firstname"]
        reply = f"Thank you for reaching out {firstname}. An agent will reach out to you the soonest"
    else:
        firstname = flow_message["firstname"]
        secondname = flow_message["secondname"]
        issue = flow_message["issue"]
        reply = f"Your response has been recorded. This is what we received:\n\n*NAME*: {firstname} {secondname}\n*YOUR MESSAGE*: {issue}"

    user_phone_number = request_data["entry"][0]["changes"][0]["value"]["contacts"][0][
        "wa_id"
    ]
    send_message(reply, user_phone_number, "FLOW_RESPONSE", name)


def extract_string_from_reply(user_input):
    match user_input:
        case "1":
            user_prompt = code_prompt_texts[0].lower()
        case "2":
            user_prompt = code_prompt_texts[1].lower()
        case "Y":
            user_prompt = code_prompt_texts[2].lower()
        case "N":
            user_prompt = code_prompt_texts[3].lower()
        case _:
            user_prompt = str(user_input).lower()

    return user_prompt


def user_message_processor(message, phonenumber, name):
    user_prompt = extract_string_from_reply(message)
    if user_prompt == "yes":
        send_message(message, phonenumber, "TALK_TO_AN_AGENT", name)
    elif user_prompt == "no":
        print("Chat terminated")
    else:
        if re.search("service", user_prompt):
            send_message(message, phonenumber, "SERVICE_INTRO_TEXT", name)

        elif re.search(
            "help|contact|reach|email|problem|issue|more|information", user_prompt
        ):
            send_message(message, phonenumber, "CONTACT_US", name)

        elif re.search("hello|hi|greetings", user_prompt):
            if re.search("this", user_prompt):
                send_message(message, phonenumber, "CHATBOT", name)

            else:
                send_message(message, phonenumber, "SEND_GREETINGS_AND_PROMPT", name)

        else:
            send_message(message, phonenumber, "CHATBOT", name)


def send_message(message, phone_number, message_option, name):
    greetings_text_body = (
        "\nHello "
        + name
        + ". Welcome to our hotel. What would you like us to help you with?\nPlease respond with a numeral between 1 and 2.\n\n1. "
        + code_prompt_texts[0]
        + "\n2. "
        + code_prompt_texts[1]
        + "\n\nAny other reply will connect you with our chatbot."
    )

    # loading the list's entries into a string for display to the user
    services_list_text = ""
    for i in range(len(service_list)):
        item_position = i + 1
        services_list_text = (
            f"{services_list_text} {item_position}. {service_list[i]} \n"
        )

    service_intro_text = f"We offer a range of services to ensure a comfortable stay, including but not limited to:\n\n{services_list_text}\n\nWould you like to connect with an agent to get more information about the services?\n\nY: Yes\nN: No"

    contact_flow_payload = flow_details(
        flow_header="Contact Us",
        flow_body="You have indicated that you would like to contact us.",
        flow_footer="Click the button below to proceed",
        flow_id=str("<FLOW-ID>"),
        flow_cta="Proceed",
        recipient_phone_number=phone_number,
        screen_id="CONTACT_US",
    )

    agent_flow_payload = flow_details(
        flow_header="Talk to an Agent",
        flow_body="You have indicated that you would like to talk to an agent to get more information about the services that we offer.",
        flow_footer="Click the button below to proceed",
        flow_id=str("<FLOW-ID>"),
        flow_cta="Proceed",
        recipient_phone_number=phone_number,
        screen_id="TALK_TO_AN_AGENT",
    )

    match message_option:
        case "SEND_GREETINGS_AND_PROMPT":
            payload = json.dumps(
                {
                    "messaging_product": "whatsapp",
                    "to": str(phone_number),
                    "type": "text",
                    "text": {"preview_url": False, "body": greetings_text_body},
                }
            )
        case "SERVICE_INTRO_TEXT":
            payload = json.dumps(
                {
                    "messaging_product": "whatsapp",
                    "to": str(phone_number),
                    "type": "text",
                    "text": {"preview_url": False, "body": service_intro_text},
                }
            )
        case "CHATBOT":
            LLM = Llama(
                model_path="/home/incognito/Downloads/llama-2-7b-chat.ggmlv3.q8_0.gguf.bin",
                n_ctx=2048,
            )
            # create a text prompt
            prompt = message
            # generate a response (takes several seconds)
            output = LLM(prompt)
            payload = json.dumps(
                {
                    "messaging_product": "whatsapp",
                    "to": str(phone_number),
                    "type": "text",
                    "text": {
                        "preview_url": False,
                        "body": output["choices"][0]["text"],
                    },
                }
            )
        case "CONTACT_US":
            payload = contact_flow_payload
        case "TALK_TO_AN_AGENT":
            payload = agent_flow_payload
        case "FLOW_RESPONSE":
            payload = json.dumps(
                {
                    "messaging_product": "whatsapp",
                    "to": str(phone_number),
                    "type": "text",
                    "text": {"preview_url": False, "body": message},
                }
            )

    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + ACCESS_TOKEN,
    }

    requests.request("POST", url, headers=headers, data=payload)
    print("MESSAGE SENT")


def flow_details(
    flow_header,
    flow_body,
    flow_footer,
    flow_id,
    flow_cta,
    recipient_phone_number,
    screen_id,
):
    # Generate a random UUID for the flow token
    flow_token = str(uuid.uuid4())

    flow_payload = json.dumps(
        {
            "type": "flow",
            "header": {"type": "text", "text": flow_header},
            "body": {"text": flow_body},
            "footer": {"text": flow_footer},
            "action": {
                "name": "flow",
                "parameters": {
                    "flow_message_version": "3",
                    "flow_token": flow_token,
                    "flow_id": flow_id,
                    "flow_cta": flow_cta,
                    "flow_action": "navigate",
                    "flow_action_payload": {"screen": screen_id},
                },
            },
        }
    )

    payload = json.dumps(
        {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": str(recipient_phone_number),
            "type": "interactive",
            "interactive": json.loads(flow_payload),
        }
    )
    return payload
