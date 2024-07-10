require('dotenv').config()
const express = require('express');
const passport = require('passport');
const router = express.Router();
const axios = require('axios');
const jwt = require('jsonwebtoken');

// Redirect user to Google for authentication
const GoogleStrategy = require('passport-google-oauth20').Strategy;
passport.serializeUser((user, done) => {
    done(null, user);
  });
  passport.deserializeUser((user, done) => {
    done(null, user);
  });
passport.use(new GoogleStrategy({
    clientID: process.env.clientID,
    clientSecret: process.env.clientSecret,
    callbackURL: '/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
    // This function is called after successful authentication
    // You can perform any necessary operations with the user profile
    return done(null, profile);
}));
router.get('/google', passport.authenticate('google', {
    // scope: ['profile', 'email']
    scope: 'profile email' // Correct format: space-separated string    

}
));

// Callback route after Google has authenticated the user
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
    // Successful authentication, redirect home or do something else
    const user = req.user; // Assuming req.user contains the authenticated user's information
    
    // Log the profile and email to the console
   
    console.log('User Email:', user._json.email);
    
     // Generate JWT token
     const token = jwt.sign({ 
         userId: user._json.sub, 
         email: user._json.email 
         // Add any other relevant user data you want to include in the token
     }, 'your-secret-key', { expiresIn: '1h' }); // Specify token expiration
     try{
      axios.post('http://localhost:3000/user/adduser', {
            google_id: user._json.sub,
            name: user._json.name,
            email: user._json.email,
            // Include any other necessary data for adding the user
        }, {
            headers: {
                Authorization: `Bearer ${token}` // Include JWT token in the request headers
            }
        });
    }catch(err){
        // console.log(err)
    }
     // Send JWT token to the client
    //  res.json({ token });
    res.cookie('jwt', token, { 
         httpOnly: true, // Make the cookie accessible only through HTTP requests
         maxAge: 3600000 //  Token expiration time (1 hour in milliseconds)
    });
     // Set cookie expiration to 1 hour (3600000 milliseconds)

    res.redirect('/');
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    jwt.verify(token, 'your-secret-key', (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Unauthorized: Invalid token' });
        }
        req.user = decoded; // Store decoded user information in req.user
        next();
    });
};

// Example protected route
router.get('/protected', verifyToken, (req, res) => {
    // Route handler for protected route
    res.json({ message: 'Protected route accessed successfully', user: req.user });
});

// Export the router
module.exports = router;

