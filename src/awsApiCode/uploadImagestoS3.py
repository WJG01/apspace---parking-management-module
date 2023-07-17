import boto3
import base64

s3 = boto3.client('s3')

def lambda_handler(event, context):
    try:
        # Retrieve the list of images from the request payload
        image_list = event['images']
        
        for image in image_list:
            # Retrieve the base64-encoded image data from the image object
            image_data = image['data']
            
            # Decode the base64-encoded image data
            decoded_image = base64.b64decode(image_data)
            
            # Specify the bucket name and key for the uploaded image
            bucket_name = 'apqincidentimages'  # Replace with your bucket name
            key = 'images/' + image['name']  # Replace with the desired key/name for the uploaded image
            
            # Upload the image to S3
            s3.put_object(Body=decoded_image, Bucket=bucket_name, Key=key)
        
        return {
            'statusCode': 200,
            'body': 'Images uploaded successfully'
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': 'Error uploading images: ' + str(e)
        }