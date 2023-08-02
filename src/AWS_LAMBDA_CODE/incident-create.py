import boto3
import base64
import uuid

s3 = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('APQIncident')

def lambda_handler(event, context):
    try:
        # Retrieve the list of images from the request payload
        image_list = event['images']
        
        # Create a list to store the image URLs
        image_urls = []
        
        # Check if image_list is not empty
        if image_list:
            for image in image_list:
                # Retrieve the base64-encoded image data from the image object
                image_data = image['data']
                
                # Decode the base64-encoded image data
                decoded_image = base64.b64decode(image_data)
                
                # Specify the bucket name and key for the uploaded image
                #bucket_name = 'apqincidentimages'  # Replace with your bucket name
                bucket_name = 'apqincidentimagesbucket'  # Replace with your bucket name

                key = 'images/' + image['name']  # Replace with the desired key/name for the uploaded image
                
                # Upload the image to S3
                s3.put_object(Body=decoded_image, Bucket=bucket_name, Key=key)
                
                # Get the image URL
                image_url = f'https://{bucket_name}.s3.amazonaws.com/{key}'
                image_urls.append(image_url)
        
        # Generate a UUID for APQParkingID
        apq_incident_id = str(uuid.uuid4())
        
        # Save incident report details along with image URLs in DynamoDB
        incident_report = {
            'APQIncidentID': apq_incident_id,  # Generate a unique incident ID
            'description': event['description'],
            'reporteddatetime': event['reporteddatetime'],
            'userreported': event['userreported'],
            'images': image_urls
        }
        table.put_item(Item=incident_report)
        
        return {
            'statusCode': 200,
            'body': 'Images uploaded and incident report saved successfully'
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': 'Error uploading images and saving incident report: ' + str(e)
        }