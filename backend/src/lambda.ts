import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import serverlessExpress from '@vendia/serverless-express';
import { buildServer } from './server';

let handler: any = null;

export const handlerProxy = async (event: APIGatewayProxyEvent, context: Context) => {
  if (!handler) {
    const fastify = await buildServer();
    handler = serverlessExpress({ app: fastify.server });
  }
  return handler(event, context);
};

export const handler = handlerProxy;
