// order-service/index.js
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://host.docker.internal:27017/order-db';
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://host.docker.internal:3000';
// const MONGO_URI='mongodb+srv:akhilvarma11111:2zvWWPumSvHJZabB960711@cluster0.spu7k1j.mongodb.net/?retryWrites=true&w=majority';


mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB:', err));

const Order = mongoose.model('Order', {
  products: [{ productId: String, quantity: Number }],
  totalAmount: Number,
  status: String
});

app.post('/orders', async (req, res) => {
  try {
    const { products } = req.body;
    let totalAmount = 0;

    // Check product availability and calculate total amount
    for (let item of products) {
      const response = await axios.get(`${PRODUCT_SERVICE_URL}/products/${item.productId}`);
      const product = response.data;
      
      if (product.inventory < item.quantity) {
        return res.status(400).json({ message: `Not enough inventory for product ${item.productId}` });
      }
      
      totalAmount += product.price * item.quantity;

      // Update product inventory
      await axios.put(`${PRODUCT_SERVICE_URL}/products/${item.productId}`, {
        inventory: product.inventory - item.quantity
      });
    }

    const order = new Order({
      products,
      totalAmount,
      status: 'Created'
    });

    await order.save();
    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
});

app.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Order service running on port ${PORT}`));