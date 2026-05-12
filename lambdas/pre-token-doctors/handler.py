def lambda_handler(event, context):
    print("Event received:", event)
    
    # Pre Token Generation V1/V2 structure
    claims = {
        "custom:role": "doctor",
        "custom:license_active": "true"
    }

    event["response"] = {
        "claimsOverrideDetails": {
            "claimsToAddOrOverride": claims
        }
    }

    return event
