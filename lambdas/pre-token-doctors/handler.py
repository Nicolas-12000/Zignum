def lambda_handler(event, context):
  print(f"Trigger source: {event.get('triggerSource')}")
  
  # PreTokenGeneration logic
  if event.get('triggerSource') in ["TokenGeneration_Authentication", "TokenGeneration_RefreshTokens"]:
    claims = {
      "custom:role": "doctor",
      "custom:license_active": "true"
    }
    event["response"] = {
      "claimsOverrideDetails": {
        "claimsToAddOrOverride": claims
      }
    }
  else:
    # For other triggers like PreSignUp, ensure response is clean
    event["response"] = {}
  
  return event
