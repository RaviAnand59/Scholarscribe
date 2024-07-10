require("dotenv").config();

const express = require("express");
const {  DynamoDBClient,ExecuteStatementCommand } = require("@aws-sdk/client-dynamodb");
const client = require('../db')
const crypto = require('crypto');
const multer = require('multer');
const { uploadFileToS3 } = require('./s3'); // Import the S3 upload function

function generateUniqueId(name,email)
{
     // Concatenate name and email
     const combinedString = name + email;

     // Generate a hash using SHA-256 algorithm
     const hash = crypto.createHash('sha256').update(combinedString).digest('hex');
 
     // Return the first 8 characters of the hash as the unique ID
     return hash.substring(0, 8);
     
    }
    
    
    const router = express.Router();
    const upload = multer({ dest: 'uploads/' });

// // Middleware for basic authentication
// const authenticate = (req, res, next) => {

 
//     const authHeader = req.headers['authorization'];
//     // if (!authHeader || authHeader !== `Bearer ${process.env.ACCESS_TOKEN}`) {
//     if (!authHeader || authHeader !== `Rahul`) {
//         res.status(401).send("Unauthorized");
//         return;
//     }
//     next();
// };




// // Apply authentication middleware to all routes
// router.use(authenticate);

// // Add item to DynamoDB table(correct)
// router.post("/adduser", async (req, res) => {
//     try {
//         const {  name, phone_no , email , password , google_id } = req.body;
//         console.log("Request Body:", req.body); 
        
//         // if (!name ||  !email || (!password && !google_id)) {
//         if (!name ||  !email  ) {
//             console.log("Name:", req.name)
//             res.status(400).send("Please fill in all required fields");
//             return;
//         }
        
//          id = generateUniqueId(name,email);
//          let query2 = `SELECT id FROM Users WHERE id = '${id}'`;
//             const { Items } = await client.send(new ExecuteStatementCommand({ Statement: query2 }));
//             if (Items.length > 0) {
//                 res.status(400).send("User already exists");
//                 console.log("User already exists");
//                 return;
//             }
//         let query = `
//     INSERT INTO Users
//     VALUE { 'id': '${id}', 'name': '${name}', 'phone_no': '${phone_no}', 'email': '${email}'`;
    
// if (password) {
//     query += `, 'password': '${password}' }`;
// } else if (google_id) {
//     query += `, 'google_id': '${google_id}' }`;
// }

// console.log("Query:", query);

//         await client.send(new ExecuteStatementCommand({ Statement: query }));
//         res.send("Item added successfully");
//     } catch (error) {
//         console.error("Error adding item:", error);
//         res.status(500).send("Error adding item");
//     }
// });

// Set up Multer for handling file uploads

// router.post("/adduser", upload.array('files'), async (req, res) => {
//   try {
//     const { name, phone_no, email, description } = req.body;
//     console.log("Request Body:", req.body);

//     if (!name || !email) {
//       console.log("Name:", req.name);
//       res.status(400).send("Please fill in all required fields");
//       return;
//     }

//     let query2 = `SELECT id FROM Users WHERE id = '${id}'`;
//     const { Items } = await client.send(new ExecuteStatementCommand({ Statement: query2 }));
//     if (Items.length > 0) {
//       res.status(400).send("User already exists");
//       console.log("User already exists");
//       return;
//     }

//     let query = `
//       INSERT INTO Users
//       VALUE { 'id': '${id}', 'name': '${name}', 'phone_no': '${phone_no}', 'email': '${email}', 'description': '${description}' }`;

//     await client.send(new ExecuteStatementCommand({ Statement: query }));
//     res.send("Item added successfully");
//   } catch (error) {
//     console.error("Error adding item:", error);
//     res.status(500).send("Error adding item");
//   }
// });




// router.post("/adduser", upload.array('files'), async (req, res) => {
//     try {
//       const { name, phone_no, email, description , google_id} = req.body;
//       console.log("Request Body:", req.body);
  
//       if (!name || !email) {
//         console.log("Name:", req.name);
//         res.status(400).send("Please fill in all required fields");
//         return;
//       }
  
//       const id = generateUniqueId(name, email);
//       let query2 = `SELECT id FROM Users WHERE id = '${id}'`;
//       const { Items } = await client.send(new ExecuteStatementCommand({ Statement: query2 }));
//       if (Items.length > 0) {
//         res.status(400).send("User already exists");
//         console.log("User already exists");
//         return;
//       }
  
//       // Upload files to S3 and get their URLs
//       const fileUrls = await Promise.all(req.files.map(file => uploadFileToS3(file)));
  
//       // Insert user data along with file URLs into the database
//       const query = `
//         INSERT INTO Users
//         VALUE { 
//           'id': '${id}', 
//           'name': '${name}', 
//           'phone_no': '${phone_no}', 
//           'email': '${email}', 
//           'description': '${description}', 
//           'google_id': '${google_id}',
//           'files': '${JSON.stringify(fileUrls)}' 
//         }`;
  
//       await client.send(new ExecuteStatementCommand({ Statement: query }));
//       res.send("Item added successfully");
//     } catch (error) {
//       console.error("Error adding item:", error);
//       res.status(500).send("Error adding item");
//     }
//   });

router.post("/adduser", upload.array('files'), async (req, res) => {
  try {
      const { name, phone_no, email, description, google_id } = req.body;
      console.log("Request Body:", req.body);

      if (!name || !email) {
          console.log("Missing required fields:", { name, email });
          res.status(400).send("Please fill in all required fields");
          return;
      }

      const id = generateUniqueId(name, email);
      console.log("Generated ID:", id);

      let query2 = `SELECT id FROM Users WHERE id = '${id}'`;
      const { Items } = await client.send(new ExecuteStatementCommand({ Statement: query2 }));
      if (Items.length > 0) {
          console.log("User already exists:", id);
          res.status(400).send("User already exists");
          return;
      }

      // Upload files to S3 and get their URLs
      let fileUrls = [];
      if (req.files && req.files.length > 0) {
          try {
              fileUrls = await Promise.all(req.files.map(async (file) => {
                  const url = await uploadFileToS3(file);
                  console.log("Uploaded file URL:", url);
                  return url;
              }));
          } catch (uploadError) {
              console.error("Error uploading files:", uploadError);
              res.status(500).send("Error uploading files");
              return;
          }
      }
      console.log("File URLs:", fileUrls);

      // Insert user data along with file URLs into the database
      const query = `
          INSERT INTO Users
          VALUE { 
              'id': '${id}', 
              'name': '${name}', 
              'phone_no': '${phone_no}', 
              'email': '${email}', 
              'description': '${description}', 
              'google_id': '${google_id}',
              'files': '${JSON.stringify(fileUrls)}'
          }`;

      console.log("Insert Query:", query);

      await client.send(new ExecuteStatementCommand({ Statement: query }));
      res.send("Item added successfully");
  } catch (error) {
      console.error("Error adding item:", error);
      res.status(500).send("Error adding item");
  }
});

  
  module.exports = router;
router.get("/getuser", async (req, res) => {
    try {
        const id = req.body.id;
        const query = `
            SELECT * FROM Users
            WHERE id = '${id}'
        `;
        const command = new ExecuteStatementCommand({ Statement: query });
        const { Items } = await client.send(command);
        res.send(Items[0] ? Items[0] : "Item not found");
    } catch (error) {
        console.error("Error getting item:", error);
        res.status(500).send("Error getting item");
    }
});

// Delete item from DynamoDB table
router.delete("/deleteuser", async (req, res) => {
    try {
        const id = req.query.id;
        const query = `
            DELETE FROM Users
            WHERE id = '${id}'
        `;
        // console.log("Query:", client);
        await client.send(new ExecuteStatementCommand({ Statement: query }));
        res.send("Item deleted successfully");
    } catch (error) {
        console.error("Error deleting item:", error);
        res.status(500).send("Error deleting item");
    }
});

// Update item in DynamoDB table
router.put("/updateuser", async (req, res) => {
    try {
        const { id, name, phone_no , email , password , google_id } = req.body;

        // Check if required fields are provided
        if (!name || !phone_no || !email || (!password && !google_id)) {
            res.status(400).send("Please fill in all required fields");
            return;
        }

        // Construct the PartiQL update query
        const query = `
            UPDATE Users
            SET name = '${name}', phone_no = '${phone_no}', email = '${email}' 
            ${password ? `, password = '${password}'` : ""} ${google_id ? `, google_id = '${google_id}'` : ""}     
            WHERE id = '${id}'
        `;
        console.log("Query:", query);

        // Execute the PartiQL update command
        await client.send(new ExecuteStatementCommand({ Statement: query }));
        
        res.send("Item updated successfully");
    } catch (error) {
        console.error("Error updating item:", error);
        res.status(500).send("Error updating item");
    }
});
module.exports = router;
