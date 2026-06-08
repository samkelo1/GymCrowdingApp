import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const apiFn = new lambda.Function(this, 'GymApiFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'src/server.handler',
      code: lambda.Code.fromAsset('../backend'),
      memorySize: 512,
      timeout: cdk.Duration.seconds(10),
    });

    new apigw.LambdaRestApi(this, 'GymApiGateway', {
      handler: apiFn,
      proxy: true,
    });
  }
}
