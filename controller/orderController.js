const Order=require('../models/orderModel')
const User=require('../models/userModel')
const Address=require('../models/addressModel')
const Product=require('../models/productModel')
const mongoose = require('mongoose');
const Transaction=require('../models/transactionModel')

const loadOrderlist=async(req,res)=>{
    try{
        res.render('orderlist')
    }catch(error){
        error.message
    }
}
const loadOrderdetails=async(req,res)=>{
    try{
      const cartData=req.session.cartLength;
        res.render('orderDetails',{cartData})
    }catch(error){
        error.message
    }
}
const loadOrderdetailsuser=async(req,res)=>{
    try{
      const cartData=req.session.cartLength;
        res.render('userOrderdetails',{cartData})
    }catch(error){
        error.message
    }
}

const orderPlaced=async(req,res)=>{
  
    try{
      
        const mostRecentOrder=await Order.findOne().sort({orderDate:-1}).populate ('address user');
       const cartData=req.session.cartLength
        if(!mostRecentOrder){
            console.log('No order found');
        }
        const user=await User.findById(mostRecentOrder.user);
        
        res.render('order',{order:mostRecentOrder,user,cartData});
        
        }catch(error){
            console.log(error.message);
        }
    }
   
//get order details in the user side  
const  orderDetails= async (req, res) => {
    try {
      const userId= req.session.user_id
      const orderId = req.query.orderId;
      const user= await User.findById(userId); 
      const address1=await Address.find({user:userId})
     const cartData=req.session.cartData
  
  
      const orderData = await Order.findOne({ _id: orderId })
        .populate('user')
        .populate({
          path: 'address',
          model: 'Address',
        })
        .populate({
          path: 'items.product',
          model: 'Product',
        })
        console.log(orderData.items);
      res.render('orderDetails', { order: orderData, user ,address1,cartData});
      
  
    } catch (error) {
      console.error('Error fetching order details:', error);
      res.status(500).json({ error: 'Internal Server Error' });
 }
  };

  const cancelOrder = async (req, res) => {
    try {
      const orderId = req.params.orderId;
  
      let cancelledOrder = await Order.findById(orderId);
  
      if (!cancelledOrder) {
        return res.status(404).json({ error: 'Order not found' });
      }
  
      if (
        cancelledOrder.paymentMethod === 'Online Payment' ||
        cancelledOrder.paymentMethod === 'Wallet Payment'
      ) {
        const cancelled = await Order.findOne({ _id: orderId })
          .populate('user')
          .populate({ path: 'items.product', model: 'Product' });
  
        
        const user = await User.findOne({ _id: cancelled.user._id });
        
  
        await Order.findByIdAndUpdate(orderId, { status: 'Cancelled' }, { new: true });
  
        for (const item of cancelled.items) {
          const products = item.product;
         
  
          if (products instanceof mongoose.Types.ObjectId) {
            const foundProduct = await Product.findById(products);
  
            if (foundProduct) {
              foundProduct.quantity += item.quantity;
              await foundProduct.save();
            }
          } else {
           
            item.paymentStatus = 'Payment Declined';
          }
        }
  
        user.walletBalance += cancelled.totalAmount; 
        await user.save();
  
        const transactionCredit = new Transaction({
          user: cancelled.user._id,
          amount: cancelled.totalAmount,
          orderId: cancelled._id,
          paymentMethod: "Wallet Payment",
          type: 'credit',
          description: `Credited to wallet for order: ${orderId}`,
        });
  
        await transactionCredit.save();
      }
  
      res.redirect('/viewProfile');
    } catch (error) {
      console.log(error.message);
      res.status(500).send('Internal Server Error');
    }
  };



//   const  orderList= async (req, res) => {
//     try {
//       const userId= req.session.user_id
//       const orderId = req.query.orderId;
//       const user= await User.findById(userId); 
//       const address1=await Address.find({user:userId})
     
  
  
//       const orderData = await Order.find({})
//         .populate('user')
//         .populate({
//           path: 'address',
//           model: 'Address',
//         })
//         .populate({
//           path: 'items.product',
//           model: 'Product',
//         }) .sort({ orderDate: -1 });
       
        
//       res.render('orderlist', {  orderData, user ,address1,});
      

//     } catch (error) {
//       console.error('Error fetching order details:', error);
//       res.status(500).json({ error: 'Internal Server Error'});
// }
//   };


const orderList = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const filterBy = req.query.filterBy; 
    let search = '';
    if (req.query.search) {
      search = req.query.search;
    }
    console.log(search);
    
    const currentPage = parseInt(req.query.page) || 1;
    const perPage = 5;

    const user = await User.findById(userId);
    const address1 = await Address.find({ user: userId });

    let filter = {}; 
    if (filterBy) {
      filter.status = filterBy;
    }

    
    const totalCount = await Order.countDocuments({
      status: { $regex: new RegExp(search, 'i') } 
    });

    
    const totalOrders = await Order.countDocuments(filter);
    const orderData = await Order.find({
      $and: [
        filter,
        { status: { $regex: new RegExp(search, 'i') } } 
      ]
    })
      .populate('user')
      .populate({
        path: 'address',
        model: 'Address',
      })
      .populate({
        path: 'items.product',
        model: 'Product',
      })
      .sort({ orderDate: -1 })
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    const totalPages = Math.ceil(totalOrders / perPage);

    res.render('orderlist', { orderData, user, address1, currentPage, totalPages, filterBy, totalCount });

  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



const cancelOrderAdmin = async (req, res) => {
  try {
    const orderId = req.params.orderId;

    let cancelledOrder = await Order.findById(orderId);

    if (!cancelledOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (
      cancelledOrder.paymentMethod === 'Online Payment' ||
      cancelledOrder.paymentMethod === 'Wallet Payment'
    ) {
      const cancelled = await Order.findOne({ _id: orderId })
        .populate('user')
        .populate({ path: 'items.product', model: 'Product' });

      
      const user = await User.findOne({ _id: cancelled.user._id });
      

      await Order.findByIdAndUpdate(orderId, { status: 'Cancelled' }, { new: true });

      for (const item of cancelled.items) {
        const products = item.product;
       

        if (products instanceof mongoose.Types.ObjectId) {
          const foundProduct = await Product.findById(products);

          if (foundProduct) {
            foundProduct.quantity += item.quantity;
            await foundProduct.save();
          }
        } else {
         
          item.paymentStatus = 'Payment Declined';
        }
      }

      user.walletBalance += cancelled.totalAmount; 
      await user.save();

      const transactionCredit = new Transaction({
        user: cancelled.user._id,
        amount: cancelled.totalAmount,
        orderId: cancelled._id,
        paymentMethod: "Wallet Payment",
        type: 'credit',
        description: `Credited to wallet for order: ${orderId}`,
      });

      await transactionCredit.save();
    }

    res.redirect('/admin/orderlist');
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Internal Server Error');
  }
};

module.exports = cancelOrderAdmin;


  const  orderDetailsAdmin= async (req, res) => {
    try {
      const userId= req.session.user_id
      const orderId = req.query.orderId;
      const user= await User.findById(userId); 
      const address1=await Address.find({user:userId})
     
  
  
      const orderData = await Order.findOne({ _id: orderId })
        .populate('user')
        .populate({
          path: 'address',
          model: 'Address',
        })
        .populate({
          path: 'items.product',
          model: 'Product',
        })
        console.log(orderData.items);
      res.render('orderDetailsAdmin', { order: orderData, user ,address1,});
      
  
    } catch (error) {
      console.error('Error fetching order details:', error);
      res.status(500).json({ error: 'Internal Server Error'});
  }
  };
  

module.exports={
    
    loadOrderdetails,
    loadOrderdetailsuser,
    orderPlaced,
    orderDetails,
    cancelOrder,
    orderList,
    cancelOrderAdmin,
    orderDetailsAdmin
  
}




