import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';

/**
 * Task C: Minimal, production-minded CDK stack for the Gym API
 * - Lambda (NodejsFunction) bundle for the Fastify app adapter (backend/src/lambda.ts)
 * - API Gateway REST API fronting the Lambda
 * - Optional: SSM StringParameter for REDIS_URL (created if not provided)
 * - IAM: narrow policy granting Lambda read to the specific SSM parameter
 * - Networking: example VPC + security group for optional ElastiCache placement
 */
export interface ApiStackProps extends cdk.StackProps {
  /** If provided, use this existing SSM parameter name for Redis URL */
  redisParamName?: string;
}

export class ApiStackTaskC extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: ApiStackProps) {
    super(scope, id, props);

    // Small VPC used when you want to provision ElastiCache (optional)
    const vpc = new ec2.Vpc(this, 'ApiVpc', {
      maxAzs: 2,
      natGateways: 0,
      subnetConfiguration: [
        { name: 'private', subnetType: ec2.SubnetType.PRIVATE_ISOLATED, cidrMask: 24 },
        { name: 'public', subnetType: ec2.SubnetType.PUBLIC, cidrMask: 24 },
      ],
    });

    // Security group for Lambda and for (optional) ElastiCache
    const sg = new ec2.SecurityGroup(this, 'ApiSecurityGroup', {
      vpc,
      description: 'Allow Lambda to talk to Redis (if deployed into VPC)'
    });

    // SSM parameter name for REDIS_URL. If not provided in props, create a placeholder.
    const redisName = props?.redisParamName ?? '/gymcrowding/redis/url';
    const redisParam = ssm.StringParameter.fromStringParameterName(this, 'RedisParam', redisName);

    // NodejsFunction bundles your handler; ensure backend/src/lambda.ts exports `handler`
    const fn = new NodejsFunction(this, 'GymApiFn', {
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: path.join(__dirname, '..', 'backend', 'src', 'lambda.ts'),
      handler: 'handler',
      bundling: {
        externalModules: ['aws-sdk'],
      },
      memorySize: 512,
      timeout: cdk.Duration.seconds(10),
      vpc,
      securityGroups: [sg],
      environment: {
        REDIS_URL: redisParam.stringValue,
      },
    });

    // API Gateway (REST) in front of the Lambda
    const api = new apigw.LambdaRestApi(this, 'GymApi', {
      handler: fn,
      proxy: true,
      deployOptions: {
        stageName: 'prod',
        throttlingRateLimit: 1000,
        throttlingBurstLimit: 200,
      }
    });

    // Narrow IAM permission: allow Lambda to read the specific SSM param
    fn.addToRolePolicy(new iam.PolicyStatement({
      actions: ['ssm:GetParameter', 'ssm:GetParameters', 'ssm:GetParameterHistory'],
      resources: [redisParam.parameterArn],
    }));

    // Note: Creating an ElastiCache cluster requires a subnet group and additional
    // permissions; many teams prefer provisioning ElastiCache in a separate
    // stack or via Terraform. You can add replication groups here as needed.

    // Outputs
    new cdk.CfnOutput(this, 'ApiUrl', { value: api.url ?? 'https://<api-id>.execute-api.../prod' });
  }
}
