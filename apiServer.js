require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');

// Create API app
const apiApp = express();

// Middleware
apiApp.use(cors());
apiApp.use(bodyParser.json());
apiApp.use(express.static('front-end'));
apiApp.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb+srv://adlijohan5:m3FVS05RCgzs1eIs@dragonhacks.ibr5by4.mongodb.net/Database?retryWrites=true&w=majority&appName=DragonHacks')
  .then(() => console.log('MongoDB connected to API Server'))
  .catch(err => console.error(err));

// User schema and model
const userSchema = new mongoose.Schema({
  Username: { type: String, required: true },
  Password: { type: String, required: true },
  FirstName: { type: String, required: true },
  LastName: { type: String, required: true },
  DOB: { type: Date, required: true },
  WalletBalance: { type: mongoose.Schema.Types.Decimal128, required: true },
  Groups: { type: [String], required: true },
  TrustScore: { type: Number, required: true },
  PhoneNumber: { type: String, required: false }
});

const User = mongoose.model('UserInformation', userSchema, 'UserInformation');

// Authentication middleware
async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.sendStatus(401);
  }
  
  try {
    // Call the auth server to validate the token
    const response = await axios.post('http://localhost:4000/validate-token', { token });
    
    if (response.data.valid) {
      req.user = response.data.user;
      next();
    } else {
      return res.sendStatus(403);
    }
  } catch (error) {
    console.error('Error validating token:', error);
    return res.sendStatus(500);
  }
}

// API routes
apiApp.get('/api/users', authenticateToken, async (req, res) => {
  try {
    const users = await User.find({}, 'FirstName LastName Username');
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Error fetching users' });
  }
});

// Add your other API endpoints here
// Example:


// Start API Server
const API_PORT = process.env.API_PORT || 3000;
apiApp.listen(API_PORT, () => console.log(`API server running on port ${API_PORT}`));