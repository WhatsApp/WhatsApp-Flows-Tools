import os
import uuid

import requests
from dotenv import load_dotenv
from flask import Flask, json, make_response, request

app = Flask(__name__)

load_dotenv()
PHONE_NUMBER_ID = os.getenv("PHONE_NUMBER_ID")
VERIFY_TOKEN = os.getenv("VERIFY_TOKEN")
ACCESS_TOKEN = os.getenv("ACCESS_TOKEN")
WHATSAPP_BUSINESS_ACCOUNT_ID = os.getenv("WHATSAPP_BUSINESS_ACCOUNT_ID")
created_flow_id = ""
messaging_url = f"https://graph.facebook.com/v18.0/{PHONE_NUMBER_ID}/messages"

auth_header = {"Authorization": f"Bearer {ACCESS_TOKEN}"}

messaging_headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {ACCESS_TOKEN}",
}


@app.route("/create-flow", methods=["POST"])
def create_flow():
    flow_base_url = (
        f"https://graph.facebook.com/v18.0/{WHATSAPP_BUSINESS_ACCOUNT_ID}/flows"
    )
    flow_creation_payload = {"name": "<FLOW-NAME>", "categories": '["SURVEY"]'}
    flow_create_response = requests.request(
        "POST", flow_base_url, headers=auth_header, data=flow_creation_payload
    )

    try:
        global created_flow_id
        created_flow_id = flow_create_response.json()["id"]
        graph_assets_url = f"https://graph.facebook.com/v18.0/{created_flow_id}/assets"

        upload_flow_json(graph_assets_url)
        publish_flow(created_flow_id)

        print("FLOW CREATED!")
        return make_response("FLOW CREATED", 200)
    except:
        return make_response("ERROR", 500)


@app.route("/webhook", methods=["GET"])
def webhook_get():
    if (
        request.args.get("hub.mode") == "subscribe"
        and request.args.get("hub.verify_token") == VERIFY_TOKEN
    ):
        return make_response(request.args.get("hub.challenge"), 200)
    else:
        return make_response("Success", 403)


@app.route("/webhook", methods=["POST"])
def webhook_post():
    # checking if there is a messages body in the payload
    if (
        json.loads(request.get_data())["entry"][0]["changes"][0]["value"].get(
            "messages"
        )
    ) is not None:
        """
        checking if there is a text body in the messages payload so that the sender's phone number can be extracted from the message
        """
        if (
            json.loads(request.get_data())["entry"][0]["changes"][0]["value"][
                "messages"
            ][0].get("text")
        ) is not None:
            user_phone_number = json.loads(request.get_data())["entry"][0]["changes"][
                0
            ]["value"]["contacts"][0]["wa_id"]
            send_flow(created_flow_id, user_phone_number)
        else:
            flow_reply_processor(request)

    return make_response("PROCESSED", 200)


def flow_reply_processor(request):
    flow_response = json.loads(request.get_data())["entry"][0]["changes"][0]["value"][
        "messages"
    ][0]["interactive"]["nfm_reply"]["response_json"]

    flow_data = json.loads(flow_response)
    source_id = flow_data["source"]
    tour_type_id = flow_data["tour_type"]
    tour_quality_id = flow_data["tour_quality"]
    decision_influencer_id = flow_data["decision_influencer"]
    tour_guides_id = flow_data["tour_guides"]
    aspects_enjoyed_id = flow_data["aspects_enjoyed"]
    improvements_id = flow_data["improvements"]
    recommend_id = flow_data["recommend"]
    return_booking_id = flow_data["return_booking"]

    match source_id:
        case "0":
            source = "Online search"
        case "1":
            source = "Social media"
        case "2":
            source = "Referral from a friend/family"
        case "3":
            source = "Advertisement"
        case "4":
            source = "Others"

    match tour_type_id:
        case "0":
            tour_type = "Cultural tour"
        case "1":
            tour_type = "Adventure tour"
        case "2":
            tour_type = "Historical tour"
        case "3":
            tour_type = "Wildlife tour"

    match tour_quality_id:
        case "0":
            tour_quality = "1 - Poor"
        case "1":
            tour_quality = "2 - Below Average"
        case "2":
            tour_quality = "3 - Average"
        case "3":
            tour_quality = "4 - Good"
        case "4":
            tour_quality = "5 - Excellent"

    match decision_influencer_id:
        case "0":
            decision_influencer = "Positive reviews"
        case "1":
            decision_influencer = "Pricing"
        case "2":
            decision_influencer = "Tour destinations offered"
        case "3":
            decision_influencer = "Reputation"

    match tour_guides_id:
        case "0":
            tour_guides = "Knowledgeable and friendly"
        case "1":
            tour_guides = "Knowledgeable but not friendly"
        case "2":
            tour_guides = "Friendly but not knowledgeable"
        case "3":
            tour_guides = "Neither of the two"
        case "4":
            tour_guides = "I didn’t interact with them"

    match aspects_enjoyed_id:
        case "0":
            aspects_enjoyed = "Tourist attractions visited"
        case "1":
            aspects_enjoyed = "Tour guide's commentary"
        case "2":
            aspects_enjoyed = "Group dynamics/interaction"
        case "3":
            aspects_enjoyed = "Activities offered"

    match improvements_id:
        case "0":
            improvements = "Tour itinerary"
        case "1":
            improvements = "Communication before the tour"
        case "2":
            improvements = "Transportation arrangements"
        case "3":
            improvements = "Advertisement"
        case "4":
            improvements = "Accommodation quality"

    match recommend_id:
        case "0":
            recommend = "Yes, definitely"
        case "1":
            recommend = "Yes, but with reservations"
        case "2":
            recommend = "No, I would not"

    match return_booking_id:
        case "0":
            return_booking = "Very likely"
        case "1":
            return_booking = "Likely"
        case "2":
            return_booking = "Undecided"
        case "3":
            return_booking = "Unlikely"

    reply = (
        f"Thanks for taking the survey! Your response has been recorded. This is what we received:\n\n"
        f"*How did you hear about our tour company?*\n{source}\n\n"
        f"*Which type of tour did you recently experience with us?*\n{tour_type}\n\n"
        f"*On a scale of 1 to 5, how would you rate the overall quality of the tour?*\n{tour_quality}\n\n"
        f"*What influenced your decision to choose our tour company?*\n{decision_influencer}\n\n"
        f"*How knowledgeable and friendly were our tour guides?*\n{tour_guides}\n\n"
        f"*What aspects of the tour did you find most enjoyable?*\n{aspects_enjoyed}\n\n"
        f"*Were there any aspects of the tour that could be improved?*\n{improvements}\n\n"
        f"*Would you recommend our tour company to a friend or family member?*\n{recommend}\n\n"
        f"*How likely are you to book another tour with us in the future?*\n{return_booking}"
    )

    user_phone_number = json.loads(request.get_data())["entry"][0]["changes"][0][
        "value"
    ]["contacts"][0]["wa_id"]
    send_message(reply, user_phone_number)


def send_message(message, phone_number):
    payload = json.dumps(
        {
            "messaging_product": "whatsapp",
            "to": str(phone_number),
            "type": "text",
            "text": {"preview_url": False, "body": message},
        }
    )

    requests.request("POST", messaging_url, headers=messaging_headers, data=payload)
    print("MESSAGE SENT")


def upload_flow_json(graph_assets_url):
    flow_asset_payload = {"name": "flow.json", "asset_type": "FLOW_JSON"}
    files = [("file", ("survey.json", open("survey.json", "rb"), "application/json"))]

    res = requests.request(
        "POST",
        graph_assets_url,
        headers=auth_header,
        data=flow_asset_payload,
        files=files,
    )
    print(res.json())


def publish_flow(flow_id):
    flow_publish_url = f"https://graph.facebook.com/v18.0/{flow_id}/publish"
    requests.request("POST", flow_publish_url, headers=auth_header)


def send_flow(flow_id, recipient_phone_number):
    # Generate a random UUID for the flow token
    flow_token = str(uuid.uuid4())

    flow_payload = json.dumps(
        {
            "type": "flow",
            "header": {"type": "text", "text": "Survey"},
            "body": {
                "text": "Your insights are invaluable to us – please take a moment to share your feedback in our survey."
            },
            "footer": {"text": "Click the button below to proceed"},
            "action": {
                "name": "flow",
                "parameters": {
                    "flow_message_version": "3",
                    "flow_token": flow_token,
                    "flow_id": flow_id,
                    "flow_cta": "Proceed",
                    "flow_action": "navigate",
                    "flow_action_payload": {"screen": "SURVEY_SCREEN"},
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

    requests.request("POST", messaging_url, headers=messaging_headers, data=payload)
    print("MESSAGE SENT")
