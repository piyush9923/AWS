import json
import boto3
from botocore.config import Config
from botocore.exceptions import ClientError

def lambda_handler(event, context):
    # ADD waf
    try:
        region = event['region']
        if region=="global":
            client = boto3.client('waf')
            change_token_response = client.get_change_token()
            change_token = change_token_response['ChangeToken']
            
            
            response = client.update_ip_set(
                    IPSetId=event["ip_set_id"],
                    ChangeToken=change_token,
                    Updates=[
                        {
                            'Action': event["Action"].upper(),
                            'IPSetDescriptor': {
                                'Type': event["IPSetDescriptor"]["Type"].upper(),
                                'Value': event["IPSetDescriptor"]["Value"]
                            }
                        },
                    ]
                )
            
            response = client.get_change_token_status(
                    ChangeToken=change_token
                )
        
                
            return {
                'statusCode': 200, 
                'body': response
            }
        
        else:
            my_config = Config(
                region_name = region,
                signature_version = 'v4',
                retries = {
                    'max_attempts': 10,
                    'mode': 'standard'
                }
            )
            client = boto3.client('waf-regional',config=my_config)
            change_token_response = client.get_change_token()
            change_token = change_token_response['ChangeToken']
            
            
            response = client.update_ip_set(
                    IPSetId=event["ip_set_id"],
                    ChangeToken=change_token,
                    Updates=[
                        {
                            'Action': event["Action"].upper(),
                            'IPSetDescriptor': {
                                'Type': event["IPSetDescriptor"]["Type"].upper(),
                                'Value': event["IPSetDescriptor"]["Value"]
                            }
                        },
                    ]
                )
            
            response = client.get_change_token_status(
                    ChangeToken=change_token
                )
        
                
            return {
                'statusCode': 200, 
                'body': response
            }
    except ClientError as e:
        return {
                'statusCode': 200, 
                'body': json.dumps(e)
            }

