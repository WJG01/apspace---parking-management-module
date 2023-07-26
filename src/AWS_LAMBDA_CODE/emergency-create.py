import json, boto3,uuid
from botocore.exceptions import ClientError

def lambda_handler(event, context):
    ddb = boto3.resource('dynamodb')
    data = json.loads(json.dumps(event))
    #print("testing here   " + str(type(data['APQParkingID'])))
    
    # Generate a UUID for APQParkingID
    apq_emergency_id = str(uuid.uuid4())
    
    try:
        insertEmergencyResponse = ddb.meta.client.execute_statement(
            Statement=f"INSERT INTO APQEmergency VALUE {{ 'APQEmergencyID':?, 'userid':?, 'usercontactno':?, 'securityguardid':?, 'emergencyreportstatus':?, 'reportdatetime':?, 'parkingspotid':? }}",
            # Parameters=[
            #     {'S': data['APQParkingID']},  # Assuming APQParkingID is a string
            #     {'S': data['location']},
            #     {'S': data['parkingspotid']},
            #     {'S': data['date']},
            #     {'S': data['from']},
            #     {'S': data['to']}
            Parameters=[apq_emergency_id, data['userid'], data['usercontactno'], data['securityguardid'], data['emergencyreportstatus'], data['reportdatetime'],data['parkingspotid']]

        )
        
    except ClientError as err:
        print("You hit an error. You feel so sad")
        raise
    else:
        return {"insertEmergencyResponse": insertEmergencyResponse}