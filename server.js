const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('front-end'));

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
    type: mongoose.Schema.Types.Decimal128,
    required: true
  },
  Groups: {
    type: [String],
    required: true
  },
  TrustScore: {
    type: Number,
    required: true
  },
  PhoneNumber: {
    type: String,
    required: false 
  }
});

const User = mongoose.model('UserInformation', userSchema, 'UserInformation');

const groupSchema = new mongoose.Schema({
  GroupName: { type: String, required: true },
  CreatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'UserInformation', required: true },
  Members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UserInformation' }],
  MonthlyDepositAmount: { type: mongoose.Schema.Types.Decimal128, required: true },
  DurationMonths: { type: Number, required: true },
  GracePeriod: { type: Number, required: true },
  PoolBalance: { type: mongoose.Schema.Types.Decimal128, default: 0.0 },
});

const Group = mongoose.model('Group', groupSchema, 'Group');

const transactionSchema = new mongoose.Schema({
  GroupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  InitiatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'UserInformation', required: true },
  Amount: { type: mongoose.Schema.Types.Decimal128, required: true },
  Type: { type: String, enum: ['loan', 'repayment'], required: true },
  Approvals: [{ 
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserInformation' },
    approved: Boolean 
  }],
  Status: { type: String, enum: ['pending', 'approved', 'declined'], default: 'pending' },
  Timestamp: { type: Date, default: Date.now }
});

const Transaction = mongoose.model('Transaction', transactionSchema, 'Transaction');



app.post('/signup', async (req, res) => {
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
  
      console.log('DATA ABOUT TO SAVE:', newUser);
  
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
  
      const user = await User.findOne({ Username: email });
  
      if (!user) {
        return res.status(401).send({ message: 'Invalid email or password' });
      }

      if (user.Password !== password) {
        return res.status(401).send({ message: 'Invalid email or password' });
      }
  
      res.status(200).send({ message: 'Login successful', userID: user._id });
  
    } catch (err) {
      console.error(err);
      res.status(500).send({ message: 'Error logging in' });
    }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, 'FirstName LastName Username');
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Error fetching users' });
  }
});

// app.post('/repay-loan', async (req, res) => {
//   try {
//     const { userId, transactionId, amount } = req.body;

//     const transaction = await Transaction.findById(transactionId);
//     const group = await Group.findById(transaction.GroupId);
//     const user = await User.findById(userId);

//     if (parseFloat(user.WalletBalance.toString()) < amount) {
//       return res.status(400).send({ message: 'Insufficient funds to repay' });
//     }

//     user.WalletBalance = mongoose.Types.Decimal128.fromString(
//       (parseFloat(user.WalletBalance.toString()) - parseFloat(amount)).toFixed(2)
//     );
//     await user.save();

//     group.PoolBalance = mongoose.Types.Decimal128.fromString(
//       (parseFloat(group.PoolBalance.toString()) + parseFloat(amount)).toFixed(2)
//     );
//     await group.save();

//     transaction.Status = 'repaid';
//     await transaction.save();

//     res.status(200).send({ message: 'Loan repaid successfully' });

//   } catch (err) {
//     console.error(err);
//     res.status(500).send({ message: 'Error repaying loan' });
//   }
// });

// app.get('/api/user/:id', async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);
//     res.status(200).json(user);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send({ message: 'Error fetching user' });
//   }
// });

// app.get('/api/user-groups/:userId', async (req, res) => {
//   try {
//     const groups = await Group.find({ Members: req.params.userId });
//     res.status(200).json(groups);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send({ message: 'Error fetching groups' });
//   }
// });

// app.post('/create-group', async (req, res) => {
//   try {
//     const { userId, groupName, members, monthlyDepositAmount, durationMonths, gracePeriod } = req.body;

//     const newGroup = new Group({
//       GroupName: groupName,
//       CreatedBy: userId,
//       Members: [...members, userId],
//       MonthlyDepositAmount: monthlyDepositAmount,
//       DurationMonths: durationMonths,
//       GracePeriod: gracePeriod,
//       PoolBalance: 0.0
//     });

//     await newGroup.save();

//     res.status(201).send({ message: 'Group created successfully', groupId: newGroup._id });
//   } catch (err) {
//     console.error(err);
//     res.status(500).send({ message: 'Error creating group' });
//   }
// });

// app.get('/api/group/:id', async (req, res) => {
//   try {
//     const group = await Group.findById(req.params.id).populate('Members', 'FirstName LastName');
//     res.status(200).json(group);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send({ message: 'Error fetching group info' });
//   }
// });

// app.post('/request-loan', async (req, res) => {
//   try {
//     const { userId, groupId, amount, reason } = req.body;

//     const newTransaction = new Transaction({
//       GroupId: groupId,
//       InitiatedBy: userId,
//       Amount: amount,
//       Type: 'loan',
//       Reason: reason,
//       Approvals: [],
//       Status: 'pending'
//     });

//     await newTransaction.save();
//     res.status(201).send({ message: 'Loan requested successfully' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).send({ message: 'Error requesting loan' });
//   }
// });

// app.get('/api/group-loans/:groupId', async (req, res) => {
//   try {
//     const loans = await Transaction.find({ GroupId: req.params.groupId, Status: 'pending' })
//                                    .populate('InitiatedBy', 'FirstName LastName');
//     res.status(200).json(loans);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send({ message: 'Error fetching loans' });
//   }
// });

// app.post('/approve-loan', async (req, res) => {
//   try {
//     const { userId, transactionId, approve } = req.body;

//     const transaction = await Transaction.findById(transactionId);
//     const group = await Group.findById(transaction.GroupId);

//     const alreadyVoted = transaction.Approvals.some(a => a.userId.toString() === userId);
//     if (alreadyVoted) {
//       return res.status(400).send({ message: 'Already voted' });
//     }

//     transaction.Approvals.push({ userId, approved: approve });

//     const totalMembers = group.Members.length;
//     const approvalsCount = transaction.Approvals.filter(a => a.approved).length;

//     if (approvalsCount === totalMembers) {
//       const borrower = await User.findById(transaction.InitiatedBy);

//       borrower.WalletBalance = mongoose.Types.Decimal128.fromString(
//         (parseFloat(borrower.WalletBalance.toString()) + parseFloat(transaction.Amount.toString())).toFixed(2)
//       );
//       await borrower.save();

//       group.PoolBalance = mongoose.Types.Decimal128.fromString(
//         (parseFloat(group.PoolBalance.toString()) - parseFloat(transaction.Amount.toString())).toFixed(2)
//       );
//       await group.save();

//       transaction.Status = 'approved';
//     }

//     await transaction.save();
//     res.status(200).send({ message: 'Vote recorded', status: transaction.Status });
//   } catch (err) {
//     console.error(err);
//     res.status(500).send({ message: 'Error processing vote' });
//   }
// });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
