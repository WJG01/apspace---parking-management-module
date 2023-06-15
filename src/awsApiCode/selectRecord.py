import json
import boto3

def lambda_handler(event, context):
    ddb = boto3.resource('dynamodb')
    
    try:
        selectParkingResponse = ddb.meta.client.execute_statement(
            Statement="SELECT * FROM APQParking"
        )
        
        # Extract the result rows from the response
        result_rows = selectParkingResponse['Items']
        
    except ClientError as err:
        print("An error occurred while selecting records:", err.response['Error']['Message'])
        raise
    else:
        return {"selectParkingResponse": result_rows}