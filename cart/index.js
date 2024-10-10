// cart-service/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect('mongodb://localhost:27017/cart-db', { useNewUrlParser: true, useUnifiedTopology: true });

const Cart = mongoose.model('Cart', {
  userId: String,
  products: [{ productId: String, quantity: Number }]
});

app.get('/carts/:userId', async (req, res) => {
  const cart = await Cart.findOne({ userId: req.params.userId });
  res.json(cart);
});

app.post('/carts', async (req, res) => {
  const cart = new Cart(req.body);
  await cart.save();
  res.status(201).json(cart);
});

app.put('/carts/:userId', async (req, res) => {
  const cart = await Cart.findOneAndUpdate({ userId: req.params.userId }, req.body, { new: true });
  res.json(cart);
});

app.listen(3003, () => console.log('Cart service running on port 3003'));