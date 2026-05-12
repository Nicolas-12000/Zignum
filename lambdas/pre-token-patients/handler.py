def lambda_handler(event, context):

    claims = {
        "custom:role": "patient"
    }

    event["response"] = {
        "claimsOverrideDetails": {
            "claimsToAddOrOverride": claims
        }
    }

    return event
