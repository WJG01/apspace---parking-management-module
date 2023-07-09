    # for emergency update
    import json
import boto3
from botocore.exceptions import ClientError

def lambda_handler(event, context):
    ddb = boto3.resource('dynamodb')
    table_name = 'APQEmergency'  # Replace with your DynamoDB table name
    record_id = event['APQEmergencyID']  # Get the APQEmergencyID from the event
    
    try:
        # Retrieve the existing record
        table = ddb.Table(table_name)
        response = table.get_item(Key={'APQEmergencyID': record_id})
        
        # Check if the record exists
        if 'Item' not in response:
            return {"error": f"Record with APQEmergencyID '{record_id}' does not exist"}
        
        # Update the record with new data
        item = response['Item']
        item['emergencyreportstatus'] = event.get('emergencyreportstatus', item['emergencyreportstatus'])  # Update location if provided
        item['securityguardid'] = event.get('securityguardid', item['securityguardid'])  # Update parkingspotid if provided
        
        # Save the updated record
        table.put_item(Item=item)
        
        return {"message": "Record updated successfully"}

    except ClientError as e:
        return {"error": str(e)}
    
    
#     {
#   "APQEmergencyID": "64926b18-d006-4201-93a8-4e055d5ff6d4",
#   "emergencyreportstatus": "HELPFOUND",
#   "securityguardid": "SID001"
# }


#set($inputRoot = $input.path('$'))
{
  "queryStringParameters": {
    #foreach($param in $input.params().querystring.keySet())
    "$param": "$util.escapeJavaScript($input.params().querystring.get($param))"
    #if($foreach.hasNext),#end
    #end
  }
}


#integration reqeust api gateway for update
# {
#   "body" : $input.json('$'),
#   "queryStringParameters" : {
#     #foreach($param in $input.params().querystring.keySet())
#     "$param" : "$util.escapeJavaScript($input.params().querystring.get($param))"
#     #if($foreach.hasNext),#end
#     #end
#   },
#   "headers": {
#     #foreach($header in $input.params().header.keySet())
#     "$header": "$util.escapeJavaScript($input.params().header.get($header))"
#     #if($foreach.hasNext),#end
#     #end
#   }
# }