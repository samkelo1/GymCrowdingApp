import { APIGatewayProxyHandler } from 'aws-lambda';
import awsServerlessFastify from 'aws-serverless-fastify';
import { buildServer } from './server';

let proxy: any = null;

export const handler: APIGatewayProxyHandler = async (event, context) => {
  if (!proxy) {
    const fastify = await buildServer();
    proxy = awsServerlessFastify(fastify);
  }
  return proxy(event, context);
};
