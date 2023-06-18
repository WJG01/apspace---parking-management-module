const AWS = require("aws-sdk");
AWS.confiig.update({
  region: "us-east-1",
});
const dynamodb = new AWS.DynamoDB.DocumentClient();
const dynamoTableName = "APQParking";
const healthPath = "/health";
const parkingPath = "/parking-book";

exports.handler = async function (event) {
  console.log("Request event: ", event);
  let response;
  switch (true) {
    case event.httpMethod === "GET" && event.path === healthPath:
      response = buildResponse(200);
      break;
    case event.httpMethod === "GET" && event.path === parkingPath:
      response = await getParking();
      break;
    case event.httpMethod === "POST" && event.path === parkingPath:
      response = await saveParking(JSON.parse(event.body));
      break;
    default:
      response = buildResponse(404, "404 Not Found");
  }
};

async function scanDynamoRecords(scanParams, itemArray) {
  try {
    const dynamoData = await dynamodb.scan(scanParams).promise();
    itemArray = itemArray.concat(dynamoData.Items);
    if (dynamoData.LastEvaluatedKey) {
      scanParams.ExclusiveStartkey = dynamoData.LastEvaluatedKey;
      return await scanDynamoRecords(scanParams, itemArray);
    }
    return itemArray;
  } catch (error) {
    console.error(
      "Do your custom error handling here. I am just gonna log it: ",
      error
    );
  }
}

async function getParking() {
  const params = {
    TableName: dynamoTableName,
  };
  const allParkings = await scanDynamoRecords(params, []);
  const body = {
    parkings: allParkings,
  };
  return buildResponse(200, body);
}

async function saveParking(requestBody) {
  const params = {
    TableName: dynamodbTableName,
    Item: requestBody,
  };
  return await dynamodb
    .put(params)
    .promise()
    .then(
      () => {
        const body = {
          Operation: "SAVE",
          Message: "SUCCESS",
          Item: requestBody,
        };
        return buildResponse(200, body);
      },
      (error) => {
        console.error(
          "Do your custom error handling here. I am just gonna log it: ",
          error
        );
      }
    );
}

function buildResponse(statusCode, body) {
  return {
    statusCode: statusCode,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  };
}
