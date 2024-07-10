require("dotenv").config();
const express = require("express");
const { DynamoDBClient, ExecuteStatementCommand } = require("@aws-sdk/client-dynamodb");
const client = require('../db')

const router = express.Router();





router.get("/auth" ,(req,res)=>{
     
    const{admin_id,admin_password}=req.body;
    if(admin_id === process.env.ADMIN_ID && admin_password === process.env.ADMIN_PASSWORD){
        res.send("Admin logged in successfully")
    }
    else
    {
        res.send("Invalid credentials")
    
    }

})



// Get item from DynamoDB table
router.get("/getallproject", async (req, res) => {
    try {
        const query = `
            SELECT * FROM Users
            
        `;
        const { Items } = await client.send(new ExecuteStatementCommand({ Statement: query }));
        if(Items.length > 0)
        res.send(Items)
        else
        res.send( "Item not found");
    } catch (error) {
        console.error("Error getting item:", error);
        res.status(500).send("Error getting item");
    }
});


module.exports = router;