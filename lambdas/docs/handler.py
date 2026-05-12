import json
import os
import boto3
import psycopg2
from psycopg2.extras import RealDictCursor
import uuid

s3 = boto3.client("s3")
BUCKET = os.environ.get("DOCS_BUCKET")

def connect_db():
    return psycopg2.connect(
        host=os.environ["DB_HOST"],
        dbname=os.environ["DB_NAME"],
        user=os.environ["DB_USER"],
        password=os.environ["DB_PASSWORD"],
        port=int(os.environ.get("DB_PORT", "5432")),
        connect_timeout=5
    )

def lambda_handler(event, context):
    method = event.get("httpMethod")
    authorizer = event.get("requestContext", {}).get("authorizer", {})
    role = authorizer.get("role")
    sub = authorizer.get("sub")

    if role not in ["doctor", "patient"]:
        return {
            "statusCode": 403,
            "body": json.dumps({"message": "Forbidden"})
        }

    if method == "POST":
        # Generate Upload URL
        try:
            body = json.loads(event.get("body") or "{}")
            file_name = body.get("file_name")
            doc_type = body.get("doc_type")
            content_type = body.get("content_type", "application/octet-stream")
            patient_id_override = body.get("patient_id")

            if not file_name or not doc_type:
                return {
                    "statusCode": 400,
                    "body": json.dumps({"message": "file_name and doc_type are required"})
                }

            # Generate unique S3 key
            file_ext = os.path.splitext(file_name)[1]
            s3_key = f"{uuid.uuid4()}{file_ext}"

            upload_url = s3.generate_presigned_url(
                "put_object",
                Params={
                    "Bucket": BUCKET,
                    "Key": s3_key,
                    "ContentType": content_type
                },
                ExpiresIn=300
            )

            # Insert into database
            conn = connect_db()
            try:
                with conn.cursor() as cursor:
                    # If doctor, they must provide patient_id. If patient, they are the owner.
                    if role == "doctor":
                        if not patient_id_override:
                            return {"statusCode": 400, "body": json.dumps({"message": "patient_id is required for doctors"})}
                        patient_id = patient_id_override
                        # Verify doctor exists and get internal ID
                        cursor.execute("SELECT id FROM doctors WHERE cognito_sub = %s", (sub,))
                        doctor_row = cursor.fetchone()
                        if not doctor_row:
                            return {"statusCode": 404, "body": json.dumps({"message": "Doctor not found"})}
                        doctor_id = doctor_row[0]
                    else:
                        # Patient is uploading for themselves
                        cursor.execute("SELECT id FROM patients WHERE cognito_sub = %s", (sub,))
                        patient_row = cursor.fetchone()
                        if not patient_row:
                            return {"statusCode": 404, "body": json.dumps({"message": "Patient not found"})}
                        patient_id = patient_row[0]
                        doctor_id = None

                    cursor.execute(
                        """
                        INSERT INTO documents (patient_id, doctor_id, s3_key, doc_type, file_name, mime_type)
                        VALUES (%s, %s, %s, %s, %s, %s)
                        RETURNING id
                        """,
                        (patient_id, doctor_id, s3_key, doc_type, file_name, content_type)
                    )
                    doc_id = cursor.fetchone()[0]
                    conn.commit()
            finally:
                conn.close()

            return {
                "statusCode": 200,
                "body": json.dumps({
                    "upload_url": upload_url,
                    "document_id": doc_id
                })
            }
        except Exception as e:
            print(f"Error in POST: {str(e)}")
            return {
                "statusCode": 500,
                "body": json.dumps({"message": str(e)})
            }

    elif method == "GET":
        # Generate Download URL
        # Path parameter: /documents/{id}/download-url
        path_parameters = event.get("pathParameters") or {}
        doc_id = path_parameters.get("id")

        if not doc_id:
            return {"statusCode": 400, "body": json.dumps({"message": "Document ID is required"})}

        conn = connect_db()
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                # Check permissions
                if role == "patient":
                    cursor.execute("""
                        SELECT d.s3_key, d.file_name FROM documents d
                        JOIN patients p ON d.patient_id = p.id
                        WHERE d.id = %s AND p.cognito_sub = %s
                    """, (doc_id, sub))
                else: # doctor
                    cursor.execute("""
                        SELECT d.s3_key, d.file_name FROM documents d
                        JOIN doctors doc ON d.doctor_id = doc.id
                        WHERE d.id = %s AND doc.cognito_sub = %s
                        UNION
                        SELECT d.s3_key, d.file_name FROM documents d
                        JOIN shared_access sa ON d.id = sa.document_id
                        JOIN doctors doc ON sa.doctor_id = doc.id
                        WHERE d.id = %s AND doc.cognito_sub = %s
                    """, (doc_id, sub, doc_id, sub))
                
                row = cursor.fetchone()
                if not row:
                    return {"statusCode": 404, "body": json.dumps({"message": "Document not found or access denied"})}

                download_url = s3.generate_presigned_url(
                    "get_object",
                    Params={
                        "Bucket": BUCKET,
                        "Key": row["s3_key"],
                        "ResponseContentDisposition": f"attachment; filename=\"{row['file_name']}\""
                    },
                    ExpiresIn=3600
                )

                return {
                    "statusCode": 200,
                    "body": json.dumps({"downloadUrl": download_url})
                }
        finally:
            conn.close()

    return {
        "statusCode": 405,
        "body": json.dumps({"message": "Method not allowed"})
    }
