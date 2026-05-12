def lambda_handler(event, context):
    print("Event received:", event)

    claims = {
        "custom:role": "patient"
    }

    event["response"] = {
        "claimsOverrideDetails": {
            "claimsToAddOrOverride": claims
        }
    }

    return event
