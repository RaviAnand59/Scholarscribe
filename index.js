require("dotenv").config();
const express = require("express");
// const { DynamoDBClient, ExecuteStatementCommand } = require("@aws-sdk/client-dynamodb");
const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');
const passport = require('passport');
const authRouter = require('./routes/authRoutes');
// const s3Router = require('./routes/s3');
const session = require('express-session');
const cors = require('cors');
const bodyParser = require('body-parser');


const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Add headers before the routes are defined
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

// Middleware to parse JSON request bodies
app.use(express.json());
// Configure express-session middleware
app.use(session({
    secret: 'hello', // Replace with your own secret key
    resave: false,
    saveUninitialized: true
}));

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

app.get("/",(req,res)=> { 
    
    res.send("Hello")

});
app.use('/user', userRouter);
app.use('/admin', adminRouter);
app.use(passport.initialize());
app.use(passport.session());

// Add authentication routes
// app.use('/auth', authRouter);
// app.use('/s3', s3Router);

 
