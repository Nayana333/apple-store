const User=require("../models/userModel");
const category=require("../models/categoryModel");
const Cart=require("../models/cartModel");
require("dotenv").config()
const Address=require("../models/addressModel");
const Order=require('../models/orderModel')
const Coupon=require('../models/couponModel')
const Product=require('../models/productModel')
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const Transaction = require('../models/transactionModel')
const Razorpay = require('razorpay');
const { ellipse } = require("pdfkit");
const razorpay = new Razorpay({

  key_id	:process.env.KEY,
  key_secret:process.env.KEY_SECRET
  
	
});



const loadCheckout=async(req,res)=>{
    const userId=req.session.user_id;
   
    try{
      const currentDate = new Date();
      const coupon= await Coupon.find({ expiry: { $gt: currentDate } });

        const user=await User.findById(userId).exec();

       
        const address=await Address.find({user:userId})
     
        if(!user){
            console.log('user not found');
        }
        const cart=await Cart.findOne({user:userId}).populate({path:'items.product',model:'Product'}).exec();
        const cartData=cart.total
      if(!cart){
        console.log('cart not found')
      }
      const cartItems=cart.items || [];
      const subtotal=calculateSubTotal(cartItems);
      const producttotal=calculateProductTotal(cartItems);
      const subtotalWithShipping=subtotal+100;
      const outOfStockError=cartItems.some(item =>cart.quantity< item.quantity);
      const maxQuantityErr=cartItems.some(item =>cart.quantity > 2);
      res.render('checkout',{user,cart:cartItems,subtotal,producttotal,subtotalWithShipping,address,outOfStockError,maxQuantityErr,cartData,coupon});

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

 


  const cashOnDelivery = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
  
    const userId = req.session.user_id;
    const { address, couponCode } = req.body;
  
    try {
      const o_id = uuidv4().split('-')[0].substring(0, 6);
      const user = await User.findById(userId);
      const cart = await Cart.findOne({ user: userId }).populate({
        path: 'items.product',
        model: 'Product',
      });
  
      if (!user || !cart) {
        throw new Error('User or cart not found.');
      }
  
      const cartItems = cart.items || [];
      let totalAmount = 0;
      const subtotal=calculateSubTotal(cartItems);
      const subtotalWithShipping=subtotal+100;
  
      for (const cartItem of cartItems) {
        const product = cartItem.product;
  
        if (!product) {
          throw new Error('Product not found.');
        }
  
        if (product.quantity < cartItem.quantity) {
          throw new Error('Not enough quantity in stock.');
        }
        let couponResult = { error: '', discountedTotal: totalAmount };
  
        if (couponCode) {
          totalAmount = await applyCoup(couponCode, totalAmount, userId);
          if (couponResult.error) {
            return res.status(400).json({ error: couponResult.error });
          }
        }
  
      
  
        const isDiscounted = product.discountStatus &&
            new Date(product.startDate) <= new Date() &&
            new Date(product.endDate) >= new Date();
  
        const priceToConsider = isDiscounted ? product.discountPrice : product.price;
  
        product.quantity -= cartItem.quantity;
  
        const shippingCost = 100;
        const itemTotal = priceToConsider * cartItem.quantity + shippingCost;
        totalAmount += itemTotal;
  
        await product.save();
      }
  
   
  
      const order = new Order({
        o_id: o_id, 
        user: userId,
        address: address,
        orderDate: new Date(),
        status: 'Pending',
        paymentMethod: 'Cash on delivery',
        paymentStatus: 'Payment Pending',
        totalAmount: totalAmount,
        couponCode:couponCode,
        couponDiscount:subtotalWithShipping-totalAmount,
        orginalPrice:subtotalWithShipping,
        items: cartItems.map(cartItem => {
          const product = cartItem.product;
          const isDiscounted = product.discountStatus &&
            new Date(product.startDate) <= new Date() &&
            new Date(product.endDate) >= new Date();
          const priceToConsider = isDiscounted ? product.discountPrice : product.price;
      
          return {
            product: product._id,
            quantity: cartItem.quantity,
            price: priceToConsider,
          };
        }),
      });
      
  
      await order.save();
  
      await Cart.deleteOne({ user: userId });
      if (req.session.cartLength) {
        req.session.cartLength = 0; 
      }
      console.log('ordercart '+req.session.cartLength);
  
      const orderItems = cartItems.map(cartItem => ({
        name: cartItem.product.name,
        quantity: cartItem.quantity,
        price: cartItem.product.discountPrice,
      }));
  
     
      await session.commitTransaction();
      session.endSession();
  
      res.status(200).json({ success: true, message: 'Order placed successfully.' });
    } catch (error) {
      console.error('Error placing the order:', error);
  
      await session.abortTransaction();
      session.endSession();
  
      let errorMessage = 'Error occurred while placing order.';
      if (error.message) {
        errorMessage = error.message;
      }
  
      res.status(500).json({ success: false, message: errorMessage, error: error.message });
    }
  };
  
// const setStatus=async(req,res)=>{
//   try{
//     const orderStatus=req.query.status;
    
// let orderData;
//     const orderId=req.query.orderId;
    
   
//     const update={
//       $set:{status:orderStatus},
//     };
  
//     if(orderStatus === "Delivered"){
//       update.$set.deliveryDate = Date.now();
//       update.$set.paymentStatus ='payment Successful'

//     }
//     else if(orderStatus==='Cancelled' || orderStatus ==="return confirmed"){
//      orderData=await Order.findOne({_id:orderId}).populate('user').populate({path:'items.product',model:'product',});
//    console.log('//////////////'+orderData);
//   const user=await User.findOne({_id:orderData.user._id})
//   user.walletBalance +=orderData.totalAmount;
//   await user.save();
//   for(const item of orderData.items){
//     const product=item.product;
//     product.quantity +=item.quantity;
//     await product.save();

//   }
//   update.$set.cancelledDate=Date.now();
//   if(orderData.paymentMethod=="wallet payment" || orderData.paymentMethod == "online Payment" && orderData.paymentStatus =="payment successful"){
//     update.$set.paymentStatus='payment refunded'

//   }
// }
//   else{
//     update.$set.paymentStatus=new Transaction({
//       user:orderData.user._id,
//       amount:orderData.totalAmount,
//       orderId:orderData._id,
//       paymentMethod:"Wallet Payment",
//       type:"credit",
//       description:`credited to wallet for order:${orderId}`,

//     });
//     await transactionCredit.save();
//   }
//   await Order.findByIdAndUpdate({_id:orderId},update);
//   res.redirect('/admin/orderList');
//   res.status(500).send('internal server error');
// }catch(error){
//   console.log(error.message)
// }
// };



const setStatus = async (req, res) => {
  try {
    const orderStatus = req.query.status;
    const orderId = req.query.orderId;

    const update = {
      $set: { status: orderStatus },
    };

    if (orderStatus === "Delivered") {
      update.$set.deliveryDate = Date.now();
      update.$set.paymentStatus='Payment Successful'

    } else if (orderStatus === "Cancelled" ) {
      const orderData = await Order.findOne({ _id: orderId })
        .populate('user')
        .populate({
          path: 'items.product',
          model: 'Product',
        });

      const user = await User.findOne({ _id: orderData.user._id });

      user.walletBalance += orderData.totalAmount;
      await user.save();

      for (const item of orderData.items) {
        const product = item.product;
        product.quantity += item.quantity;
        await product.save();
      }

      update.$set.cancelledDate = Date.now();
      if(orderData.paymentMethod=="Wallet Payment" || orderData.paymentMethod=="Online Payment" && orderData.paymentStatus == "Payment Successful"){
        update.$set.paymentStatus='Payment Refuned'
      }
      else if(orderStatus === "Return Confirmed"){
        let returnOrder = await Order.findById(orderId);
        for (const item of returnOrder.items) {
          const products = item.product;
          
          if (products instanceof mongoose.Types.ObjectId) {
            const foundProduct = await Product.findById(products);
            if (foundProduct) {
            
              foundProduct.quantity += item.quantity;
              await foundProduct.save();
            }
          }

      }
    }
      else{
       
        update.$set.paymentStatus='Payment Declined'
      }
     

      const transactionCredit = new Transaction({
        user: orderData.user._id,
        amount: orderData.totalAmount,
        orderId:orderData._id,
        paymentMethod:"Wallet Payment",
        type: 'credit',
        description: `Credited to wallet for order: ${orderId}`,
      });

      await transactionCredit.save();
    }


    await Order.findByIdAndUpdate({ _id: orderId }, update);
    res.redirect('/admin/orderlist');
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
};



const applyCoupon=async(req,res)=>{
  
  try{
    const {couponCode}=req.body;
    
    const userId=req.session.user_id;
    const coupon=await Coupon.findOne({code:couponCode});
    console.log('couponcode'+coupon);
    let errorMessage;
    if(!coupon){
      errorMessage='coupon not found'
    
    }
    const currentDate=new Date();
    if(currentDate > coupon.expiry){
      errorMessage='coupon Expired'
    }
    if(coupon.usersUsed.length >=coupon.limit){
      errorMessage='coupon Expired'
    }
    if(coupon.usersUsed.length >=coupon.limit){
      errorMessage='coupon limit reached'
    }
    if(coupon.usersUsed.includes(userId)){
      errorMessage='you already used this coupon'
    }
    const cart=await Cart.findOne({user:userId}).populate({path:'items.product',model:'Product'})
    .exec();
    const cartItems=cart.items || [];
    const orderTotal=calculateSubTotal(cartItems);
    let discountedTotal =0;
    if (coupon.type === 'percentage') {
      discountedTotal = calculateDiscountedTotal(orderTotal, coupon.discount);
    } else if (coupon.type === 'fixed') {
      discountedTotal = orderTotal - coupon.discount;
    }
    res.json({discountedTotal,errorMessage});
    }catch(error){
      console.log('error applying coupon:server',error);
      res.status(500).json({error:'an error occured while applying the coupon'});
    }

};
function calculateDiscountedTotal(total, discountPercentage) {
  if (discountPercentage < 0 || discountPercentage > 100) {
    throw new Error('Discount percentage must be between 0 and 100.');
  }

  const discountAmount = (discountPercentage / 100) * total;
  const discountedTotal = total - discountAmount;

  return discountedTotal;
};

async function applyCoup(couponCode, discountedTotal, userId) {
  const coupon = await Coupon.findOne({ code: couponCode })
  if (!coupon) {
    return { error: 'Coupon not found.' }
  }
  const currentDate = new Date();
  if (currentDate > coupon.expiry) {
    return { error: 'Coupon has expired.' }
  }
  if (coupon.usersUsed.length >= coupon.limit) {
    return { error: 'Coupon limit reached.' };
  }

  if (coupon.usersUsed.includes(userId)) {
    return { error: 'You have already used this coupon.' }
  }
  if (coupon.type === 'percentage') {
    discountedTotal = calculateDiscountedTotal(discountedTotal, coupon.discount);
  } else if (coupon.type === 'fixed') {
    discountedTotal = discountedTotal - coupon.discount;
  }
  coupon.limit--
  coupon.usersUsed.push(userId);
  await coupon.save();
  return discountedTotal;
};


const walletPayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  const userId = req.session.user_id;
  const { address, couponCode } = req.body;
  console.log(couponCode);

  try {
    const o_id = uuidv4().split('-')[0].substring(0, 6);
    const user = await User.findById(userId);
    const cart = await Cart.findOne({ user: userId }).populate({
      path: 'items.product',
      model: 'Product',
    });

    if (!user || !cart) {
      throw new Error('User or cart not found.');
    }

    const cartItems = cart.items || [];
    let totalAmount = 0;
    const subtotal=calculateSubTotal(cartItems)
    const subtotalWithShipping=subtotal+100;


    if (couponCode) {
      totalAmount = await applyCoup(couponCode, totalAmount, userId);
    }

    if (user.walletBalance < totalAmount) {
      throw new Error('Insufficient funds in the wallet.');
    }
    for (const cartItem of cartItems) {
      const product = cartItem.product;

      if (!product) {
        throw new Error('Product not found.');
      }

      if (product.quantity < cartItem.quantity) {
        throw new Error('Not enough quantity in stock.');
      }

      product.quantity -= cartItem.quantity;

      const shippingCost = 100;
      const itemTotal = product.discountPrice * cartItem.quantity + shippingCost;
      totalAmount += itemTotal;

      await product.save();
    }

    user.walletBalance -= totalAmount;
    await user.save();

    const order = new Order({
      o_id: o_id, 
      user: userId,
      address: address,
      orderDate: new Date(),
      status: 'payment successfull',
      paymentMethod: 'Wallet Payment',
      paymentStatus:'payment successfull',
      totalAmount: totalAmount,
      couponCode:couponCode,
      couponDiscount:subtotalWithShipping-totalAmount,
      orginalPrice:subtotalWithShipping,
      items: cartItems.map(cartItem => ({
        product: cartItem.product._id,
        quantity: cartItem.quantity,
        price: cartItem.product.discountPrice,
      })),
    });

    await order.save();


    const transactiondebit = new Transaction({
      user: userId,
      amount : totalAmount,
      orderId:order._id,
      paymentMethod: 'Wallet Payment',
      type: 'debit', 
      description : `Debited from wallet for order : ${order._id}`
    });
    await transactiondebit.save();
    
    await Cart.deleteOne({ user: userId });
    if (req.session.cartLength) {
      req.session.cartLength = 0; 
    }

    const orderItems = cartItems.map(cartItem => ({
      name: cartItem.product.name,
      quantity: cartItem.quantity,
      price: cartItem.product.discountPrice,
    }));

    const userEmail = user.email;
    const userName = user.username;
    const orderId = order._id;
    const ordertotalAmount = totalAmount;

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ success: true, message: 'Order placed successfully.' });
  } catch (error) {
    console.error('Error placing the order:', error);

    await session.abortTransaction();
    session.endSession();

    let errorMessage = 'Error occurred while placing order.';
    if (error.message) {
        errorMessage = error.message; 
    }

    res.status(500).json({ success: false, message: errorMessage, error: error.message });
}
};

const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentId, status } = req.body;

    const recentOrder = await Order.findOne().sort({ orderDate: -1 });

    if (!recentOrder) {
      return res.status(404).json({ error: 'No recent orders found' });
    }

    recentOrder.paymentStatus = status;
    recentOrder.paymentTransactionId = paymentId;
    recentOrder.paymentDate = new Date();

    const updatedOrder = await recentOrder.save();

    const transactionCredit = new Transaction({
      user: recentOrder.user._id,
      amount: recentOrder.totalAmount,
      orderId:recentOrder._id,
      paymentMethod:"Online Payment",
      type: 'debit',
      description: `Debited from Bank account for order: ${recentOrder._id}`,
    });
    await transactionCredit.save();

    return res.status(200).json({ message: 'Payment status updated successfully' });
  } catch (error) {
    console.error('Error updating payment status:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


const razorpayOrder = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const { address, couponCode } = req.body;

    const o_id = uuidv4().split('-')[0].substring(0, 6);
    const user = await User.findById(userId);
    console.log('razor'+user);
    const cart = await Cart.findOne({ user: userId }).populate({
      path: 'items.product',
      model: 'Product',
    });
    console.log('razor'+cart);

    if (!user || !cart) {
      throw new Error('User or cart not found.');
    }

    const cartItems = cart.items || [];
    let totalAmount = 0;
    const subtotal=calculateSubTotal(cartItems);
    const subtotalWithShipping=subtotal+100;



    for (const cartItem of cartItems) {
      const product = cartItem.product;

      if (!product) {
        throw new Error('Product not found.');
      }

      if (product.quantity < cartItem.quantity) {
        throw new Error('Not enough quantity in stock.');
      }

      product.quantity -= cartItem.quantity;

      const shippingCost = 100;
      const itemTotal = product.discountPrice * cartItem.quantity + shippingCost;
      totalAmount += itemTotal;

      await product.save();
    }

    if (couponCode) {
      totalAmount = await applyCoup(couponCode, totalAmount, userId);
    }

    const order = new Order({
      o_id: o_id, 
      user: userId,
      address: address,
      orderDate: new Date(),
      status: 'payment successfull',
      paymentMethod: 'Online Payment',
      paymentStatus: 'payment successfull',
      totalAmount: totalAmount,
      couponDiscount:subtotalWithShipping+totalAmount,
      orginalPrice:subtotalWithShipping,
      items: cartItems.map(cartItem => ({
        product: cartItem.product._id,
        quantity: cartItem.quantity,
        price: cartItem.product.discountPrice,
      })),
    });

    await order.save();
    await Cart.deleteOne({ user: userId });
    if (req.session.cartLength) {
      req.session.cartLength = 0; 
    }
console.log(totalAmount+'total amount');
console.log('orderid'+order._id);
    const options = {

      amount: totalAmount,
      currency: 'INR',
      receipt: order._id,
    };

    razorpay.orders.create(options, async (err, razorpayOrder) => {
      if (err) {
        console.error('Error creating Razorpay order:', err);
        res.status(500).json({ error: 'An error occurred while placing the order.' });
      } else {
        
        res.status(200).json({ message: 'Order placed successfully.', order: razorpayOrder });
      }
    });
  } catch (error) {
    console.error('An error occurred while placing the order: ', error);
    res.status(500).json({ error: 'An error occurred while placing the order.' });
  }
};

// const returnOrder=async(req,res)=>{
//   try{
//     const userId=req.session.user_id
    
//     const orderId=req.query.orderId
//     console.log(orderId+'orderId');

//     const order=await Order.findByIdAndUpdate(orderId,{status:'return Requested'})
//     console.log(order);
//     if(!order){
//       return res.status(404).json({error:'order not found'})
//     }
//     res.redirect('/orderDetails')
//   }catch(error){
//     console.log(error.message);
//   }
// }



const returnOrder = async (req, res) => {
  try {
     
      const userId = req.session.user_id;
      const orderId = req.query.orderId;
      const reason=req.query.reason;
      
      console.log(req.query.reason);

      const order=await Order.findByIdAndUpdate(orderId,{$set:{reason:reason}})
      console.log(order);

      
     
      const updatedOrder = await Order.findByIdAndUpdate(
          orderId,
          { $set: { status: 'return Requested' } },
          { new: true } 
      );

      if (!updatedOrder) {
          return res.status(404).json({ error: 'Order not found' });
      }

      res.status(200).json({ message: 'Order status updated successfully', updatedOrder });
  } catch (error) {
      console.error(error.message);
      res.status(500).json({ error: 'Internal server error' });
  }
};

  




module.exports={
    loadCheckout,
    // postCheckout,
    setStatus,
    applyCoupon,
    calculateDiscountedTotal,
    cashOnDelivery,
    applyCoup,
    walletPayment,
    updatePaymentStatus,
    razorpayOrder,
    returnOrder

}