import json
import boto3

ddb = boto3.resource('dynamodb')

def lambda_handler(event, context):
    try:
        if 'body' in event:
            request_body = json.loads(json.dumps(event['body']))
            print(f"Request body: {request_body}")
            updatedparkingstatus = request_body.get('parkingstatus')
            inputparkingid = event['queryStringParameters'].get('APQParkingID')
            inputuserid = request_body.get('userid')
            
            foundParkingRecordResponse = ddb.meta.client.execute_statement(
                Statement="SELECT * FROM APQParking WHERE APQParkingID =? AND userid=?",
                Parameters=[inputparkingid, inputuserid]
            )
            foundParkingRecord = foundParkingRecordResponse['Items']
            
            print(foundParkingRecord)
            
            if len(foundParkingRecord) > 0:
                foundcheckincode = foundParkingRecord[0].get('checkincode')
                
                # For check-in purpose
                if 'checkincode' in request_body:
             
                    if foundcheckincode == request_body.get('checkincode'):
                        updateCheckInStatusResponse = ddb.meta.client.execute_statement(
                            Statement=f"UPDATE APQParking SET parkingstatus = '{updatedparkingstatus}' WHERE APQParkingID=? AND userid=?",
                            Parameters=[inputparkingid, inputuserid]
                        )
                        return {
                            'statusCode': 200,
                            'body': 'Successfully Checked-In'
                        }
                    else:
                        return {
                            'statusCode': 400,
                            'body': 'Error: Check-in code does not match'
                        }
                else:
                    # For checkout purpose
                    updateCheckInStatusResponse = ddb.meta.client.execute_statement(
                        Statement=f"UPDATE APQParking SET parkingstatus = 'COMPLETED' WHERE APQParkingID=? AND userid=?",
                        Parameters=[inputparkingid, inputuserid]
                    )
                    return {
                        'statusCode': 200,
                        'body': 'Successfully Checked-Out'
                    }

    except Exception as e:
        return {
            'statusCode': 500,
            'body': 'Error: ' + str(e)
        }

# {
#   "body": $input.json('$'),
#   "queryStringParameters": {
#     "APQParkingID": "$input.params('APQParkingID')"
#   }
# }