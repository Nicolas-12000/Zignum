"""
Lambda para CRUD de expedientes medicos en RDS.

Endpoints:
- GET /api/records          -> medico: todos; paciente: solo los suyos
- GET /api/records/{id}     -> expediente especifico (verificar acceso por rol)

Para conectar a RDS:
1. Obtener credenciales de Secrets Manager usando boto3 secretsmanager
2. Conectar con pymysql usando esas credenciales
3. Ejecutar queries segun el rol del usuario (del contexto del Authorizer)
4. Cerrar la conexion antes de retornar

Docs de referencia:
https://docs.aws.amazon.com/secretsmanager/latest/userguide/retrieving-secrets_lambda.html
"""

import json


def lambda_handler(event, context):
    return {
        "statusCode": 200,
        "body": json.dumps({"message": "Lambda records placeholder - implement me!"}),
    }
