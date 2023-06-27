import json, boto3
from botocore.exceptions import ClientError

def lambda_handler(event, context):
    ddb = boto3.resource('dynamodb')
    data = json.loads(json.dumps(event))
    # print(data)
    
    try:
        insertFoodOrderResponse = ddb.meta.client.execute_statement(
            Statement=f"INSERT INTO FoodOrders VALUE {{ 'order_id':?, 'customer_id':?, 'food_store_id':?, 'order_datetime':?, 'order_served_datetime':?, 'total_price':? }}",
            Parameters=[data['order_id'], data['customer_id'], data['food_store_id'], data['order_datetime'], data['order_served_datetime'], data['total_price']]
        )

        order_items = data['order_items']
        
        statements = [
            f"INSERT INTO OrderItems "
            f"VALUE {{'order_id': ?, 'food_id': ?, 'customer_id': ?, 'food_store_id': ?, 'quantity': ?}}"] * len(data['order_items'])
        
        params = [ [data['order_id'], order_item['food_id'], data['customer_id'], data['food_store_id'], order_item['quantity']] for order_item in order_items]

        
        insertOrderItemsResponse = ddb.meta.client.batch_execute_statement(
            Statements = [{
                'Statement': statement, 'Parameters': param
            } for statement, param in zip(statements, params)])
        
    except ClientError as err:
        print("You hit an error. You feel so sad")
        raise
    else:
        return {"insertFoodOrderResponse": insertFoodOrderResponse, "insertOrderItemsResponse": insertOrderItemsResponse}
        # return {"insertOrderItemsResponse": insertOrderItemsResponse}



# 2. Updated with UUID
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
            Statement=f"INSERT INTO APQParking VALUE {{ 'APQParkingID':?, 'location':?, 'parkingspotid':?, 'date':?, 'from':?, 'to':? }}",
            # Parameters=[
            #     {'S': data['APQParkingID']},  # Assuming APQParkingID is a string
            #     {'S': data['location']},
            #     {'S': data['parkingspotid']},
            #     {'S': data['date']},
            #     {'S': data['from']},
            #     {'S': data['to']}
            Parameters=[apq_parking_id, data['location'], data['parkingspotid'], data['date'], data['from'], data['to']]

        )
        
    except ClientError as err:
        print("You hit an error. You feel so sad")
        raise
    else:
        return {"insertParkingResponse": insertParkingResponse}