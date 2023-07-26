import boto3
from botocore.exceptions import ClientError

def lambda_handler(event, context):
    ddb = boto3.resource('dynamodb')
    table_name = 'APQEmergency'  # Replace with your DynamoDB table name

    try:
        # Retrieve the record ID from the query string parameter
        record_id = event['queryStringParameters'].get('APQEmergencyID')
        
        # Check if the record ID is provided in the query string
        if not record_id:
            return {"error": "Missing required query parameter: APQEmergencyID"}
        
        # Retrieve the existing record
        table = ddb.Table(table_name)
        response = table.get_item(Key={'APQEmergencyID': record_id})
        
        # Check if the record exists
        if 'Item' not in response:
            return {"error": f"Record with APQEmergencyID '{record_id}' does not exist"}
        
        # Update the record with new data
        item = response['Item']
        body = event['body']
        item['emergencyreportstatus'] = body.get('emergencyreportstatus', item['emergencyreportstatus'])  # Update emergencyreportstatus if provided
        item['securityguardid'] = body.get('securityguardid', item['securityguardid'])  # Update securityguardid if provided
        
        # Save the updated record
        table.put_item(Item=item)
        
        return {"message": "Record updated successfully"}

    except KeyError as e:
        return {"error": f"Missing required parameter: {str(e)}"}
    except ClientError as e:
        return {"error": str(e)}