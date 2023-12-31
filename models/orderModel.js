const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  address: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address',
  },
  o_id:{
    type:String 
},
  orderDate: {
    type: Date,
    default: Date.now,
  },
  deliveryDate: {
    type: Date,
  },
  shipping:{
    type:String,
    default:'100'},
  status: {
    type: String,
    default: 'pending',
  },
  reason:{
    type:String
  },
  totalAmount : Number,
  paymentMethod: String,
 
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
      quantity: Number,
      price: Number,
    },
  ],
});

module.exports = mongoose.model('Order', orderSchema);
