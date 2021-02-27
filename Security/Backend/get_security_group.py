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
    print(event)
    region = event['region']
    
    try:
        my_config = Config(
            region_name = region,
            signature_version = 'v4',
            retries = {
                'max_attempts': 10,
                'mode': 'standard'
            }
        )
        print("Configured")
        
        ec2 = boto3.client('ec2',config=my_config)
        print(event["action"])
        if event["action"] == "sg_detail":
            try:
                # get all name of security group details
                grp_id = event["security_grp_id"]
                sg_grp_list = {'security_groups': []}
                sg_detail = ec2.describe_security_groups(GroupIds=[grp_id,])
                
                sg_grp_list["security_groups"].append(sg_detail['SecurityGroups'][0]["IpPermissions"])
                
                
                # server response
                return send_request(200,sg_grp_list)
            
            except ClientError as e:
                # server response
                return send_request(500,json.dumps(str(e)))
                
        
        elif event["action"] == "instance_detail":
            try:
                # get all name of security group details
                ec2_name_list = {'instances': []}
                instances = ec2.describe_instances()
                for instance in instances['Reservations']:
                    instance = instance['Instances'][0]
                    temp_dict = {}
                    try:
                        print(instance['PublicIpAddress'])
                        if instance['PublicIpAddress'] != "":
                            temp_dict['id'] = instance['InstanceId']
                            for tags in instance['Tags']:
                                if tags['Key']=='Name':
                                    temp_dict['name'] = tags['Value']
                                    
                            temp_dict['security_groups'] = []
                            for security_group in instance['SecurityGroups']:
                                security_temp = {}
                                security_temp['group_name']=security_group['GroupName']
                                security_temp['group_id']=security_group['GroupId']
                                temp_dict['security_groups'].append(security_temp)
                            
                            ec2_name_list['instances'].append(temp_dict)
                    except:
                        pass
                
                # server response
                return send_request(200,ec2_name_list)
            
            except ClientError as e:
                return send_request(500,json.dumps(str(e)))
        else:
            return send_request(500,json.dumps(str(e)))
    
    
    except ClientError as e:
        return send_request(500,json.dumps(str(e)))
