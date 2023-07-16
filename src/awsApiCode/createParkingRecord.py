import json, boto3,uuid
from botocore.exceptions import ClientError

def lambda_handler(event, context):
    ddb = boto3.resource('dynamodb')
    data = json.loads(json.dumps(event))
    #print("testing here   " + str(type(data['APQParkingID'])))
    
    # Generate a UUID for APQParkingID
    apq_parking_id = str(uuid.uuid4())
    
    try:
        insertParkingResponse = ddb.meta.client.execute_statement(
            Statement=f"INSERT INTO APQParking VALUE {{ 'APQParkingID':?, 'parkinglocation':?, 'parkingspotid':?, 'parkingdate':?, 'starttime':?, 'endtime':?,'checkincode':?, 'bookingcreateddatetime':?,  'parkingstatus':? , 'userid':?}}",
            Parameters=[apq_parking_id, data['parkinglocation'], data['parkingspotid'], data['parkingdate'], data['starttime'], data['endtime'],data['checkincode'],data['bookingcreateddatetime'],data['parkingstatus'],data['userid']]

        )
        
    except ClientError as err:
        print("You hit an error. You feel so sad")
        raise
    else:
        return {"insertParkingResponse": insertParkingResponse}
        # return {"insertOrderItemsResponse": insertOrderItemsResponse}
    

# Invoke your Lambda function with the dummy event
# response = lambda_handler(event, None)
# print(response)s

#json object creation
# {
#   "parkinglocation": "APU-B",
#   "parkingspotid": "01",
#   "parkingdate": "2023-07-12",
#   "starttime": "16:23",
#   "endtime": "17:23",
#   "checkincode": "385",
#   "parkingstatus": "COMPLETED",
#   "bookingcreateddatetime": "2023-06-14T18:50:26",
#   "userid": "TP055808"
# }
