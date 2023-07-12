import boto3
from botocore.exceptions import ClientError

def lambda_handler(event, context):
    ddb = boto3.resource('dynamodb')
    table_name = 'APQParking'  # Replace with your DynamoDB table name

    try:
        # Retrieve the record ID from the query string parameter
        record_id = event['queryStringParameters'].get('APQParkingID')
        
        # Check if the record ID is provided in the query string
        if not record_id:
            return {"error": "Missing required query parameter: APQParkingID"}
        
        # Retrieve the existing record
        table = ddb.Table(table_name)
        response = table.get_item(Key={'APQParkingID': record_id})
        
        # Check if the record exists
        if 'Item' not in response:
            return {"error": f"Record with APQParkingID '{record_id}' does not exist"}
        
        # Update the record with new data
        item = response['Item']
        body = event['body']
        item['parkingstatus'] = body.get('parkingstatus', item['parkingstatus'])  # Update parkingstatus if provided

        # Save the updated record
        table.put_item(Item=item)
        
        return {"message": "Record updated successfully"}

    except KeyError as e:
        return {"error": f"Missing required parameter: {str(e)}"}
    except ClientError as e:
        return {"error": str(e)}