import json
import boto3
from botocore.exceptions import ClientError
from botocore.config import Config

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
    try:
        region = event['region']
        if region=="global":
            client = boto3.client('waf')
            
            if event['action']=="list_ip_set":
                ip_sets = client.list_ip_sets()
                ip_set_id_list = ip_sets['IPSets']
                
                return send_request(200, ip_set_id_list)
            
            
            elif event['action']=="get_ips":
                # new function
                raw_ip_list = client.get_ip_set(
                    IPSetId=event['ip_set_id']
                )
                
                ip_list = raw_ip_list['IPSet']['IPSetDescriptors']
                
                return send_request(200, ip_list)
            
            else:
                return send_request(404, "Invaild action selected")
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
            
            if event['action']=="list_ip_set":
                ip_sets = client.list_ip_sets()
                ip_set_id_list = ip_sets['IPSets']
                
                return send_request(200, ip_set_id_list)
            
            
            elif event['action']=="get_ips":
                # new function
                raw_ip_list = client.get_ip_set(
                    IPSetId=event['ip_set_id']
                )
                
                ip_list = raw_ip_list['IPSet']['IPSetDescriptors']
                
                return send_request(200, ip_list)
            
            else:
                return send_request(404, "Invaild action selected")
    except ClientError as e:
        return send_request(500,json.dumps(e))
