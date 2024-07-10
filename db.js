// Configure the DynamoDB client
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { S3Client } = require("@aws-sdk/client-s3");

const client = new DynamoDBClient(
    { region: "us-east-1" ,
       credentials: {
        accessKeyId: process.env.accessKeyId,
        secretAccessKey: process.env.secretAccessKey
    }
   
     
}); // Change the region as per your DynamoDB setup
// const s3client = new S3Client(
//     { region: "us-east-1" ,
//     credentials: {
//         accessKeyId: process.env.accessKeyId,
//         secretAccessKey: process.env.secretAccessKey
//     },
   

// }); // Change the region as per your DynamoDB setup

module.exports = client;