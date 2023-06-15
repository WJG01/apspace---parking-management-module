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