require('dotenv').config()
// server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require("jsonwebtoken")



// Create app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('front-end'));
app.use(express.json())

// MongoDB Atlas Connection
mongoose.connect('mongodb+srv://adlijohan5:m3FVS05RCgzs1eIs@dragonhacks.ibr5by4.mongodb.net/Database?retryWrites=true&w=majority&appName=DragonHacks')
.then(() => console.log('MongoDB connected'))
.catch(err => console.error(err));

const userSchema = new mongoose.Schema({
  Username: {
    type: String,
    required: true
  },
  Password: {
    type: String,
    required: true
  },
  FirstName: {
    type: String,
    required: true
  },
  LastName: {
    type: String,
    required: true
  },
  DOB: {
    type: Date,
    required: true
  },
  WalletBalance: {
    type: mongoose.Schema.Types.Decimal128,  // ✅ handles double/decimal/int
    required: true
  },
  Groups: {
    type: [String], // Array of strings
    required: true
  },
  TrustScore: {
    type: Number,
    required: true
  },
  PhoneNumber: {
    type: String,
    required: false  // optional
  }
});

// Correct model binding to existing collection
const User = mongoose.model('UserInformation', userSchema, 'UserInformation');


app.post('/signup', async (req, res) => {
    try {
      const { firstName, lastName, dob, email, phone, password } = req.body;
  
      const newUser = new User({
        Username: email,                  // use email for now
        Password: password,               // (we can hash later)
        FirstName: firstName,
        LastName: lastName,
        DOB: new Date(dob),                // ensure it’s a real Date object
        WalletBalance: 0.0,                // number
        Groups: [],                        // array of strings
        TrustScore: 100,                   // number
        PhoneNumber: phone || null         // string or null
      });
  
      console.log('DATA ABOUT TO SAVE:', newUser); // ✅ debug line
  
      await newUser.save();
  
      res.status(201).send({ message: "User created successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).send({ message: "Error signing up" });
    }
});
  
function generateRandomId() {
    return 'auth0|' + Math.random().toString(36).substring(2, 15);
}    

app.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Find the user by email
      const user = await User.findOne({ Username: email });
  
      if (!user) {
        return res.status(401).send({ message: 'Invalid email or password' });
      }
  
      // Compare password (we're using plain text for now)
      if (user.Password !== password) {
        return res.status(401).send({ message: 'Invalid email or password' });
      }
  
      // If we get here, login is successful
      const userName = req.body.email
      const passWord = req.body.password
      const payload = { email: userName, password: passWord }

      const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET)
      return res.status(200).json({ accessToken: accessToken });
  
    } catch (err) {
      console.error(err);
      res.status(500).send({ message: 'Error logging in' });
    }
});

app.get('/api/users',authenticateToken, async (req, res) => {
  try {
    const users = await User.find({}, 'FirstName LastName Username'); // only fetch the fields you need
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Error fetching users' });
  }
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (token == null) return res.sendStatus(401)

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403)
    req.user = user
    next()
  })
};

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
