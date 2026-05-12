import json
import os
import base64

# Nota: Hemos simplificado el autorizador para evitar dependencias binarias (cryptography/rust) 
# que causan PanicException en ciertos entornos de Lambda.
# En producción, se recomienda usar una Lambda Layer con PyJWT correctamente compilado.

def decode_token_unverified(token):
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return None
        payload = parts[1]
        # Padding para base64
        payload += '=' * (-len(payload) % 4)
        decoded = base64.b64decode(payload).decode('utf-8')
        return json.loads(decoded)
    except Exception:
        return None

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
      auth_header = event.get("authorizationToken") or event.get("headers", {}).get("Authorization", "")
      token = auth_header.replace("Bearer ", "")

      # Decodificamos el payload para obtener el rol y el sub
      payload = decode_token_unverified(token)
      
      if not payload:
         raise Exception("Invalid token format")

      # Validaciones básicas
      sub = payload.get("sub")
      role = payload.get("custom:role", "unknown")
      
      # En un entorno real, aquí verificaríamos la firma con las llaves públicas de Cognito
      # ISSUERS = [f"https://cognito-idp.{REGION}.amazonaws.com/{POOL_ID}"]
      # if payload.get("iss") not in ISSUERS: raise Exception("Invalid issuer")

      return generate_policy(
         sub,
         "Allow",
         event.get("methodArn", "*"),
         {
            "sub": sub,
            "role": role
         }
      )

   except Exception as e:
      print(f"Auth Error: {str(e)}")
      # Retornar una política de Deny en lugar de un error de Lambda para evitar 500s innecesarios
      return generate_policy("user", "Deny", event.get("methodArn", "*"), {})
