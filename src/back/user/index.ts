import { APIGatewayProxyResult, APIGatewayProxyWithCognitoAuthorizerEvent } from 'aws-lambda';
import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  ListUsersCommandInput,
} from '@aws-sdk/client-cognito-identity-provider';

import { CORS_HEADERS } from '../constants';

export const handler = async (
  event: APIGatewayProxyWithCognitoAuthorizerEvent,
): Promise<APIGatewayProxyResult> => {
  console.log('Authorizer claims');
  console.log(JSON.stringify(event.requestContext.authorizer.claims));
  const client = new CognitoIdentityProviderClient();
  const userPoolId = process.env.USER_POOL_ID;
  if (!userPoolId) {
    return {
      statusCode: 500,
      body: 'User pool ID is not configured',
      headers: CORS_HEADERS,
    };
  }
  const input: ListUsersCommandInput = {
    UserPoolId: userPoolId,
    AttributesToGet: ['given_name', 'email', 'sub'],
  };
  const command = new ListUsersCommand(input);
  try {
    const response = await client.send(command);
    const users = response.Users ?? [];
    const usersAttributes = users.map((user) => {
      const attributes = user.Attributes ?? [];
      return attributes.reduce((acc, item) => {
        const key = item.Name;
        const value = item.Value;
        if (!key || !value) {
          return acc;
        }
        return { ...acc, [key]: value };
      }, {});
    });
    return {
      statusCode: 200,
      body: JSON.stringify(usersAttributes),
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
