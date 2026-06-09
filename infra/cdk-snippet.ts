import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Recommended: bundle the backend via NodejsFunction for correct packaging
    const apiFn = new NodejsFunction(this, 'GymApiFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: path.join(__dirname, '..', 'backend', 'src', 'server.ts'),
      handler: 'handler',
      bundling: {
        externalModules: ['aws-sdk'],
      },
      memorySize: 512,
      timeout: cdk.Duration.seconds(10),
      environment: {
        // populate at deploy time or via SSM
        REDIS_URL: ssm.StringParameter.valueForStringParameter(this, '/gymcrowding/redis/url') || '',
      },
    });

    const api = new apigw.LambdaRestApi(this, 'GymApiGateway', {
      handler: apiFn,
      proxy: true,
    });

    // Allow Lambda to read SSM parameter for REDIS URL (if you store it there)
    apiFn.addToRolePolicy(new iam.PolicyStatement({
      actions: ['ssm:GetParameter', 'ssm:GetParameters'],
      resources: ['*'],
    }));
  }
}
