def lambda_handler(event, context):

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
