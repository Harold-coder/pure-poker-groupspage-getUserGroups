const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const groupsTableName = process.env.GROUPS_TABLE;

exports.handler = async (event) => {
    const userId = event.queryStringParameters.userId;
    const requestOrigin = event.headers.origin;

    const headerTemplate = {
        "Access-Control-Allow-Origin": requestOrigin,
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS,GET"
    };

    if (!userId) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'userId is required' }),
            headers: headerTemplate
        };
    }

    try {
        // Query logic to fetch groups where `userId` is in the `membersList`
        // This might require scanning or querying with an index, depending on your table setup
        const queryResult = await dynamoDb.scan({
            TableName: groupsTableName,
            FilterExpression: "contains(membersList, :userId)",
            ExpressionAttributeValues: {
                ":userId": userId
            }
        }).promise();

        return {
            statusCode: 200,
            body: JSON.stringify(queryResult.Items),
            headers: headerTemplate
        };
    } catch (err) {
        console.error('Error fetching user groups:', err);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to fetch user groups' }),
            headers: headerTemplate
        };
    }
};
