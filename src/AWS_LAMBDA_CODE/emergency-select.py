import json
import boto3

def lambda_handler(event, context):
    ddb = boto3.resource('dynamodb')
    
    try:
        selectEmergencyResponse = ddb.meta.client.execute_statement(
            Statement="SELECT * FROM APQEmergency"
        )
        
        # Extract the result rows from the response
        result_rows = selectEmergencyResponse['Items']
        
    except ClientError as err:
        print("An error occurred while selecting records:", err.response['Error']['Message'])
        raise
    else:
        return {"selectEmergencyResponse": result_rows}
