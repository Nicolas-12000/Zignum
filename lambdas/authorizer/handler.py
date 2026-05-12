import json
import jwt
import requests
from jwt.algorithms import RSAAlgorithm

REGION = "us-east-1"

DOCTORS_POOL_ID = "POOL_ID_DOCTORS"
PATIENTS_POOL_ID = "POOL_ID_PATIENTS"

ISSUERS = [
   f"https://cognito-idp.{REGION}.amazonaws.com/{DOCTORS_POOL_ID}",
   f"https://cognito-idp.{REGION}.amazonaws.com/{PATIENTS_POOL_ID}"
]


def get_public_keys(issuer):
   jwks_url = f"{issuer}/.well-known/jwks.json"
   response = requests.get(jwks_url)
   return response.json()


def generate_policy(principal_id, effect, resource, context_data):

   return {
      "principalId": principal_id,
      "policyDocument": {
         "Version": "2012-10-17",
         "Statement": [
            {
               "Action": "execute-api:Invoke",
               "Effect": effect,
               "Resource": resource
            }
         ]
      },
      "context": context_data
   }


def lambda_handler(event, context):

   try:

      token = event["authorizationToken"].replace("Bearer ", "")

      unverified = jwt.get_unverified_header(token)

      payload = jwt.decode(
         token,
         options={"verify_signature": False}
      )

      issuer = payload["iss"]

      if issuer not in ISSUERS:
         raise Exception("Invalid issuer")

      jwks = get_public_keys(issuer)

      key = next(
         k for k in jwks["keys"]
         if k["kid"] == unverified["kid"]
      )

      public_key = RSAAlgorithm.from_jwk(json.dumps(key))

      decoded = jwt.decode(
         token,
         public_key,
         algorithms=["RS256"],
         issuer=issuer,
         options={
            "verify_aud": False
         }
      )

      if decoded["token_use"] != "id":
         raise Exception("Invalid token use")

      role = decoded.get("custom:role", "unknown")

      return generate_policy(
         decoded["sub"],
         "Allow",
         event["methodArn"],
         {
            "sub": decoded["sub"],
            "role": role
         }
      )

   except Exception:
      raise Exception("Unauthorized")
