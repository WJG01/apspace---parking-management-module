import json
import boto3
from botocore.exceptions import ClientError

def lambda_handler(event, context):
    ddb = boto3.resource('dynamodb')
    table_name = 'APQParking'  # Replace with your DynamoDB table name
    
    
    # Retrieve the record ID from the query string parameter
    record_id = event.get('queryStringParameters', {}).get('APQParkingID')
    
    try:
        # Delete the record
        table = ddb.Table(table_name)
        table.delete_item(Key={'APQParkingID': record_id})
        
        return {"message": "Record deleted successfully"}

    except ClientError as e:
        return {"error": str(e)}