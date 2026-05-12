import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor


def connect_db():
    return psycopg2.connect(
        host=os.environ["DB_HOST"],
        dbname=os.environ["DB_NAME"],
        user=os.environ["DB_USER"],
        password=os.environ["DB_PASSWORD"],
        port=int(os.environ.get("DB_PORT", "5432")),
        connect_timeout=5
    )


def log_audit(conn, action, user_sub, document_id, ip_address, user_agent):

    with conn.cursor() as cursor:
        cursor.execute(
            """
            INSERT INTO audit_log (action, user_sub, document_id, ip_address, user_agent)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (action, user_sub, document_id, ip_address, user_agent)
        )
    conn.commit()


def lambda_handler(event, context):

    role = event["requestContext"]["authorizer"]["role"]
    sub = event["requestContext"]["authorizer"]["sub"]

    query_params = event.get("queryStringParameters") or {}
    doc_type = query_params.get("doc_type")
    uploaded_from = query_params.get("uploaded_from")
    uploaded_to = query_params.get("uploaded_to")

    conn = connect_db()

    cursor = conn.cursor(cursor_factory=RealDictCursor)

    try:

        if role == "doctor":

            base_query = """
            SELECT
                d.id AS document_id,
                d.patient_id,
                d.doctor_id,
                d.s3_key,
                d.doc_type,
                d.file_name,
                d.file_size,
                d.mime_type,
                d.uploaded_at
            FROM documents d
            INNER JOIN doctors doc
                ON d.doctor_id = doc.id
            WHERE doc.cognito_sub = %s

            UNION

            SELECT
                d.id AS document_id,
                d.patient_id,
                d.doctor_id,
                d.s3_key,
                d.doc_type,
                d.file_name,
                d.file_size,
                d.mime_type,
                d.uploaded_at
            FROM documents d
            INNER JOIN shared_access sa
                ON sa.document_id = d.id
            INNER JOIN doctors doc
                ON sa.doctor_id = doc.id
            WHERE doc.cognito_sub = %s
            """

            params = [sub, sub]

        elif role == "patient":

            base_query = """
            SELECT
                d.id AS document_id,
                d.patient_id,
                d.doctor_id,
                d.s3_key,
                d.doc_type,
                d.file_name,
                d.file_size,
                d.mime_type,
                d.uploaded_at
            FROM documents d
            INNER JOIN patients p
                ON d.patient_id = p.id
            WHERE p.cognito_sub = %s
            """

            params = [sub]

        else:
            return {
                "statusCode": 403,
                "body": json.dumps({
                    "message": "Forbidden"
                })
            }

        query = f"SELECT * FROM ({base_query}) AS docs WHERE 1=1"

        if doc_type:
            query += " AND docs.doc_type = %s"
            params.append(doc_type)

        if uploaded_from:
            query += " AND docs.uploaded_at >= %s"
            params.append(uploaded_from)

        if uploaded_to:
            query += " AND docs.uploaded_at <= %s"
            params.append(uploaded_to)

        query += " ORDER BY docs.uploaded_at DESC"

        cursor.execute(query, params)

        rows = cursor.fetchall()

        request_context = event.get("requestContext", {})
        identity = request_context.get("identity", {})
        ip_address = identity.get("sourceIp")
        user_agent = identity.get("userAgent")

        log_audit(conn, "DOCUMENTS_LIST", sub, None, ip_address, user_agent)

        return {
            "statusCode": 200,
            "body": json.dumps(rows, default=str)
        }

    finally:
        cursor.close()
        conn.close()
