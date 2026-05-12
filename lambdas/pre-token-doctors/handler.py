"""
Pre Token Generation Lambda Trigger para el User Pool de Medicos.

Este Lambda se ejecuta ANTES de que Cognito firme el JWT.
Puede agregar o modificar claims en el token.

Que debe hacer:
1. Recibir el evento de Cognito (tiene el sub del usuario en event['request']['userAttributes']['sub'])
2. Consultar RDS: SELECT verified, license_number FROM doctors WHERE cognito_sub = ?
3. Agregar al token:
   - claimsAndScopeOverrideDetails.idTokenGeneration.claimsToAddOrOverride:
     - 'custom:role': 'doctor'
     - 'custom:license_active': str(verified)
4. Retornar el evento modificado

Docs de referencia (usar V2 del trigger):
https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-lambda-pre-token-generation.html
"""


def lambda_handler(event, context):
    # Retornar el evento sin modificar por ahora (no rompe el flujo de Cognito)
    return event
