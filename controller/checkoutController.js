const User=require("../models/userModel");
const category=require("../models/categoryModel");
const Cart=require("../models/cartModel");
const Address=require("../models/addressModel");
const Order=require('../models/orderModel')



const loadCheckout=async(req,res)=>{
    const userId=req.session.user_id;
    console.log(userId);
    try{
        const user=await User.findById(userId).exec();
        
        const address=await Address.find({user:userId})
     
        if(!user){
            console.log('user not found');
        }
        const cart=await Cart.findOne({user:userId}).populate({path:'items.product',model:'Product'}).exec();
      if(!cart){
        console.log('cart not found')
      }
      const cartItems=cart.items || [];
      const subtotal=calculateSubTotal(cartItems);
      const producttotal=calculateProductTotal(cartItems);
      const subtotalWithShipping=subtotal+100;
      const outOfStockError=cartItems.some(item =>cart.quantity< item.quantity);
      const maxQuantityErr=cartItems.some(item =>cart.quantity > 2);
      res.render('checkout',{user,cart:cartItems,subtotal,producttotal,subtotalWithShipping,address,outOfStockError,maxQuantityErr});

    }catch(error){
        console.log(error.message)
    }
}

const calculateSubTotal=(cart)=>{
    let subtotal=0;
    for(const cartItem of cart){
        subtotal += cartItem.product.discountPrice * cartItem.quantity;

    }
    return subtotal;

  };
  const calculateProductTotal=(cart)=>{
    const productTotals=[];
    for(const cartItem of cart){
        const total= cartItem.product.discountPrice * cartItem.quantity;
        productTotals.push(total);
    }
    return productTotals;
  }

  const postCheckout = async (req, res) => {
    const userId = req.session.user_id;
    const { address, payment } = req.body;
  
  
    try {
      const user = await User.findById(userId);
      const cart = await Cart.findOne({ user: userId }).populate({
        path: 'items.product',
        model: 'Product',
      });
      
  
      if (!user || !cart) {
        console.error('User or cart not found.');
      }
  
      const cartItems = cart.items || [];
      let totalAmount = 0;
  
      for (const cartItem of cartItems) {
        const product = cartItem.product;
  
        if (!product) {
          console.error('Product not found.');
        }
  
        if (product.quantity < cartItem.quantity) {
          console.error('Not enough quantity in stock.');
        }
  
        product.quantity -= cartItem.quantity;
  
        const shippingCost = 100;
        const itemTotal = product.discountPrice * cartItem.quantity + shippingCost;
        totalAmount += itemTotal;
  
        await product.save();
      }
  
      const order = new Order({
        user: userId,
        address: address,
        orderDate: new Date(),
        status: 'Pending',
        paymentMethod: payment,
        totalAmount: totalAmount,
        items: cartItems.map((cartItem) => ({
          product: cartItem.product._id,
          quantity: cartItem.quantity,
          price: cartItem.product.discountPrice,
        })),
      });
  
      await order.save();
  
      await Cart.deleteOne({ user: userId });
  
      res.redirect('/orderPlaced');
    } catch (error) {
      console.error('Error placing the order:', error);
    }
  };
  


module.exports={
    loadCheckout,
    postCheckout
}