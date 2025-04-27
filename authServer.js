require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const authApp = express();


authApp.use(cors());
authApp.use(bodyParser.json());
authApp.use(express.json());


mongoose.connect('mongodb+srv://adlijohan5:m3FVS05RCgzs1eIs@dragonhacks.ibr5by4.mongodb.net/Database?retryWrites=true&w=majority&appName=DragonHacks')
  .then(() => console.log('MongoDB connected to Auth Server'))
  .catch(err => console.error(err));


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

  authApp.post('/signup', async (req, res) => {
    try {
      const { firstName, lastName, dob, email, phone, password } = req.body;
  
      const newUser = new User({
        Username: email,
        Password: password,
        FirstName: firstName,
        LastName: lastName,
        DOB: new Date(dob),
        WalletBalance: 0.0,
        Groups: [],
        TrustScore: 100,
        PhoneNumber: phone || null
      });
  
      await newUser.save();
      res.status(201).send({ message: "User created successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).send({ message: "Error signing up" });
    }
  });

  authApp.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ Username: email });
  
      if (!user || user.Password !== password) {
        return res.status(401).send({ message: 'Invalid email or password' });
      }
  
      // Create token
      const payload = { 
        id: user._id,
        email: user.Username
      };
  
      const accessToken = jwt.sign(
        payload, 
        process.env.ACCESS_TOKEN_SECRET, 
        { expiresIn: '24h' }  // Longer expiration since we're not implementing refresh
      );
      
      res.status(200).json({ 
        accessToken,
        user: {
          firstName: user.FirstName,
          lastName: user.LastName,
          email: user.Username
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).send({ message: 'Error logging in' });
    }
  });


  authApp.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ Username: email });
  
      if (!user || user.Password !== password) {
        return res.status(401).send({ message: 'Invalid email or password' });
      }
  
      // Create token
      const payload = { 
        id: user._id,
        email: user.Username
      };
  
      const accessToken = jwt.sign(
        payload, 
        process.env.ACCESS_TOKEN_SECRET, 
        { expiresIn: '24h' }  // Longer expiration since we're not implementing refresh
      );
      
      res.status(200).json({ 
        accessToken,
        user: {
          firstName: user.FirstName,
          lastName: user.LastName,
          email: user.Username
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).send({ message: 'Error logging in' });
    }
  });

  // Validation endpoint - allows API server to validate tokens
authApp.post('/validate-token', (req, res) => {
    const { token } = req.body;
    
    if (!token) {
      return res.status(401).send({ valid: false });
    }
    
    try {
      const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      return res.status(200).json({ valid: true, user });
    } catch (err) {
      return res.status(200).json({ valid: false });
    }
  });

  // Start Auth Server
const AUTH_PORT = process.env.AUTH_PORT || 4000;
authApp.listen(AUTH_PORT, () => console.log(`Auth server running on port ${AUTH_PORT}`));