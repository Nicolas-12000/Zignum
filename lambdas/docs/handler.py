"""
Lambda para generacion de Presigned URLs.

Endpoints que maneja:
- POST /api/documents/upload-url  -> genera URL para subir un documento
- GET  /api/documents/{id}/download-url -> genera URL para descargar

Logica de seguridad critica (implementar):
1. Extraer el 'sub' del contexto del Lambda Authorizer (event['requestContext']['authorizer']['sub'])
2. Buscar el documento en RDS por el {id} del path
3. Verificar que el patient_id del documento == sub del token
4. Si no coincide -> retornar 403
5. Segun el doc_type del documento en RDS:
   - 'diagnostic_image' -> expiracion 300 segundos (5 min)
   - 'report' o 'lab_result' -> expiracion 3600 segundos (1 hora)
6. Generar presigned URL con boto3 s3_client.generate_presigned_url()
7. Registrar en audit_log: accion, user_sub, document_id, timestamp
8. Retornar la URL

Docs de referencia para presigned URLs:
https://boto3.amazonaws.com/v1/documentation/api/latest/guide/s3-presigned-urls.html
"""

import json


def lambda_handler(event, context):
    # Placeholder response until implementation is ready.
    return {
        "statusCode": 200,
        "body": json.dumps({"message": "Lambda docs placeholder - implement me!"}),
    }
