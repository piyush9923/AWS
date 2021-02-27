import json
import boto3
from botocore.exceptions import ClientError
from botocore.config import Config
from datetime import datetime
from datetime import timedelta

def send_request(status, body):
    server_response = {}
    server_response['statusCode'] = status
    server_response['headers'] = {}
    server_response['headers']['Content-Type'] = 'application/json'
    server_response['headers']['Access-Control-Allow-Origin'] = '*'
    server_response['headers']['Access-Control-Allow-Methods'] = '*'
    server_response['headers']['Access-Control-Allow-Credentials'] = True
    server_response['headers']['X-Requested-With'] = "*"
    server_response['headers']['Access-Control-Allow-Headers'] = "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token"
    server_response['body'] = body#json.dumps(body)
    
    return server_response
    
    
def lambda_handler(event, context):
    # TODO implement
    # Select aws region
    my_config = Config(
        region_name = event['region'],
        signature_version = 'v4',
        retries = {
            'max_attempts': 10,
            'mode': 'standard'
        }
    )
    print("Configured")
    
    ec2 = boto3.client('ec2',config=my_config)
    username = event['user']

    try:
        # get all name of security group details
        response = ec2.describe_security_groups()
        # desc = "Added through react on "+(datetime.now()+timedelta(days=1)).strftime('%d/%m/%Y %H:%M:%S')+" UTC"
        desc = " on "+(datetime.now()).strftime('%d/%m/%Y %H:%M:%S')+" UTC"
                
        user_description = event['IpList'][0]['IpRanges'][0]['Description']
        for ip in event['IpList']:
            ip['IpRanges'][0]['Description'] = user_description+" - by "+ username+desc
            
        data = ec2.authorize_security_group_ingress(
            GroupId=event['GroupId'],
            IpPermissions=event['IpList'])
        return send_request(200,"Saved")
        
    except ClientError as e:
        return send_request(500,json.dumps(e))
