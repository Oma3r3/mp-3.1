// user-service/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect('mongodb://localhost:27017/user-db', { useNewUrlParser: true, useUnifiedTopology: true });

const User = mongoose.model('User', {
  name: String,
  email: String,
  password: String
});

app.get('/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

app.post('/users', async (req, res) => {
  const user = new User(req.body);
  await user.save();
  res.status(201).json(user);
});

app.listen(3002, () => console.log('User service running on port 3002'));s