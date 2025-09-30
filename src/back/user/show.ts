import { APIGatewayProxyWithCognitoAuthorizerEvent, APIGatewayProxyResult } from 'aws-lambda';
import { QueryCommand, QueryCommandInput } from '@aws-sdk/client-dynamodb';
import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  ListUsersCommandInput,
} from '@aws-sdk/client-cognito-identity-provider';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

import { ddbClient } from './ddbClient';
import { IMeasurement } from '../types/measurements';
import { CORS_HEADERS } from '../constants';

export const handler = async (
  event: APIGatewayProxyWithCognitoAuthorizerEvent,
): Promise<APIGatewayProxyResult> => {
  const id = event.pathParameters?.id;
  if (!id) {
    return {
      statusCode: 400,
      body: 'You must provide an user id',
      headers: CORS_HEADERS,
    };
  }
  const userPoolId = process.env.USER_POOL_ID;
  if (!userPoolId) {
    return {
      statusCode: 500,
      body: 'User pool ID is not configured',
      headers: CORS_HEADERS,
    };
  }
  const isAdminClaim = event.requestContext.authorizer.claims['custom:isAdmin'];
  const sub = event.requestContext.authorizer.claims['sub'];
  const isAdmin = isAdminClaim && isAdminClaim === 'true' ? true : false;
  if (!isAdmin && sub !== id) {
    return {
      statusCode: 403,
      body: 'You are not allowed to see this resource',
      headers: CORS_HEADERS,
    };
  }
  const client = new CognitoIdentityProviderClient();
  const input: ListUsersCommandInput = {
    UserPoolId: userPoolId,
    Filter: `sub=\"${id}\"`,
    AttributesToGet: ['given_name', 'email', 'sub'],
    Limit: 1,
  };
  const command = new ListUsersCommand(input);
  try {
    const response = await client.send(command);
    const users = response.Users ?? [];
    const user = users.at(0);
    if (!users || !users.length || !user) {
      return {
        statusCode: 404,
        body: 'User not found',
        headers: CORS_HEADERS,
      };
    }
    const today = new Date();
    const defaultYearMonth = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: '2-digit',
    }).format(today);
    const yearMonth = event.queryStringParameters?.yearMonth;
    const measurements = await getMeasurements(id, yearMonth ?? defaultYearMonth);
    const userAttributes = user.Attributes ?? [];
    const formattedAttributes = userAttributes.reduce((acc, item) => {
      const key = item.Name;
      const value = item.Value;
      if (!key || !value) {
        return acc;
      }
      return { ...acc, [key]: value };
    }, {});
    return {
      statusCode: 200,
      body: JSON.stringify({ ...formattedAttributes, measurements }),
      headers: CORS_HEADERS,
    };
  } catch (err) {
    console.log(err);
    return {
      statusCode: 500,
      body: JSON.stringify('some error happened'),
      headers: CORS_HEADERS,
    };
  }
};

const getMeasurements = async (userId: string, yearMonth: string): Promise<IMeasurement[]> => {
  const queryCommandParams: QueryCommandInput = {
    TableName: 'measurements',
    KeyConditionExpression: `userId = :userId AND yearMonth = :yearMonth`,
    ExpressionAttributeValues: marshall({
      ':userId': userId,
      ':yearMonth': yearMonth,
    }),
  };
  const { Items = [] } = await ddbClient.send(new QueryCommand(queryCommandParams));
  const measurements = Items.map((item) => unmarshall(item)) as IMeasurement[];
  return measurements;
};
