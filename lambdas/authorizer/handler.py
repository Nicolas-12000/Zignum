"""
Lambda Authorizer para API Gateway.
Valida el JWT de Cognito y genera una IAM Policy segun el rol del usuario.

Que debe hacer:
1. Extraer el token del header Authorization (formato: Bearer <token>)
2. Decodificar el JWT sin verificar para obtener el issuer (iss)
3. Descargar la JWKS publica del User Pool de Cognito
4. Verificar la firma del JWT con la clave publica correcta
5. Extraer custom:role del payload
6. Generar la IAM Policy:
   - doctor: Allow en todos los recursos
   - patient: Allow solo en sus propios documentos
7. Pasar sub y role en el context para que los otros Lambdas los usen

Docs de referencia:
https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-use-lambda-authorizer.html
"""

import json


def lambda_handler(event, context):
    # TODO: Implementar la validacion del JWT
    # Por ahora retorna un error para probar el pipeline
    raise Exception("Unauthorized")
