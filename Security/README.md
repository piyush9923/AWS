# Security
This project is aimed to provide a serverless website to the user to connect and modify their AWS services like security group and WAF all at same place.

### AWS Services Used
* AWS Lambda (For connecting to AWS services by giving permission to its role)
* API Gateway (For connecting to lambda and serving the request)
* AWS Cognito (For authenticating the request)
* AWS Amplify (For integrating the authentication with the react app)
* AWS S3 (For hosting the react app)
* AWS Cloudfront (For serving the website)
* AWS Route 53 (For hosting the website)
* AWS CloudWatch (For monitoring the services and logs)

### File Structure
**[Backend:](https://github.com/piyush9923/AWS/tree/main/Security/Backend)** Contains the lambda code for performing various actions.

**[Frontend:](https://github.com/piyush9923/AWS/tree/main/Security/Frontend)** Contains the React code for webpage.

