import json
import boto3
from botocore.exceptions import ClientError

def lambda_handler(event, context):
    ddb = boto3.resource('dynamodb')
    table_name = 'APQParking'  # Replace with your DynamoDB table name
    record_id = event['APQParkingID']  # Get the APQParkingID from the event
    
    try:
        # Retrieve the existing record
        table = ddb.Table(table_name)
        response = table.get_item(Key={'APQParkingID': record_id})
        
        # Check if the record exists
        if 'Item' not in response:
            return {"error": f"Record with APQParkingID '{record_id}' does not exist"}
        
        # Update the record with new data
        item = response['Item']
        item['location'] = event.get('location', item['location'])  # Update location if provided
        item['parkingspotid'] = event.get('parkingspotid', item['parkingspotid'])  # Update parkingspotid if provided
        item['date'] = event.get('date', item['date'])  # Update date if provided
        item['from'] = event.get('from', item['from'])  # Update from if provided
        item['to'] = event.get('to', item['to'])  # Update to if provided
        
        # Save the updated record
        table.put_item(Item=item)
        
        return {"message": "Record updated successfully"}

    except ClientError as e:
        return {"error": str(e)}
    

