import json
import os
import boto3
import psycopg2

s3 = boto3.client("s3")

BUCKET = os.environ["DOCS_BUCKET"]


def lambda_handler(event, context):

    # Deploy marker: keep to force Lambda update when needed.

    role = event["requestContext"]["authorizer"]["role"]

    if role not in ["doctor", "patient"]:
        return {
            "statusCode": 403,
            "body": json.dumps({
                "message": "Forbidden"
            })
        }

    body = json.loads(event["body"])

    file_name = body["file_name"]

    upload_url = s3.generate_presigned_url(
        "put_object",
        Params={
            "Bucket": BUCKET,
            "Key": file_name
        },
        ExpiresIn=300
    )

    return {
        "statusCode": 200,
        "body": json.dumps({
            "upload_url": upload_url
        })
    }
