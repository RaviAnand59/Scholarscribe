// s3.js
require("dotenv").config();
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

// Set up AWS SDK
AWS.config.update({
  accessKeyId: process.env.accessKeyId,
  secretAccessKey: process.env.secretAccessKey,
  region: "us-east-1" 
});

const s3 = new AWS.S3();

const uploadFileToS3 = async (file) => {
  try {
    const fileContent = fs.readFileSync(file.path);

    // Define S3 upload parameters
    const params = {
      Bucket: 'allprojects123',
      Key: file.filename,
      Body: fileContent,
      // ACL: 'public-read' // Set ACL to public-read

    };

    // Upload file to S3
    const data = await s3.upload(params).promise();

    // Delete the file from the local filesystem
    fs.unlinkSync(file.path);

    return data.Location; // Return the URL of the uploaded file
  } catch (err) {
    console.error('Error uploading file:', err);
    throw err;
  }
};

module.exports = { uploadFileToS3 };
