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
    // Note: `entry` should point to a Lambda-compatible handler file that
    // exports a `handler` (e.g. backend/src/lambda.ts) which adapts your
    // Fastify/Express app for Lambda (aws-serverless-fastify / @vendia/serverless-express).
    const redisParam = ssm.StringParameter.fromStringParameterName(this, '/gymcrowding/redis/url');
    const apiFn = new NodejsFunction(this, 'GymApiFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: path.join(__dirname, '..', 'backend', 'src', 'lambda.ts'),
      handler: 'handler',
      bundling: {
        externalModules: ['aws-sdk'],
      },
      memorySize: 512,
      timeout: cdk.Duration.seconds(10),
      environment: {
        // resolved at deploy/runtime via CloudFormation dynamic reference
        REDIS_URL: redisParam.stringValue,
      },
    });

    const api = new apigw.LambdaRestApi(this, 'GymApiGateway', {
      handler: apiFn,
      proxy: true,
    });

    // Allow Lambda to read the specific SSM parameter for REDIS URL
    apiFn.addToRolePolicy(new iam.PolicyStatement({
      actions: ['ssm:GetParameter', 'ssm:GetParameters'],
      resources: [redisParam.parameterArn],
    }));
  }
}
