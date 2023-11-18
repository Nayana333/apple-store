const Order=require('../models/orderModel')
const User=require('../models/userModel')
const Address=require('../models/addressModel')
const Product=require('../models/productModel')


const loadOrderlist=async(req,res)=>{
    try{
        res.render('orderlist')
    }catch(error){
        error.message
    }
}
const loadOrderdetails=async(req,res)=>{
    try{
        res.render('orderDetails')
    }catch(error){
        error.message
    }
}
const loadOrderdetailsuser=async(req,res)=>{
    try{
        res.render('userOrderdetails')
    }catch(error){
        error.message
    }
}

const orderPlaced=async(req,res)=>{
  
    try{
        const mostRecentOrder=await Order.findOne().sort({orderDate:-1}).populate ('address user');
       
        if(!mostRecentOrder){
            console.log('No order found');
        }
        const user=await User.findById(mostRecentOrder.user);
        
        res.render('order',{order:mostRecentOrder,user});
        
        }catch(error){
            console.log(error.message);
        }
    }
   
//get order details in the user side  
const  orderDetails= async (req, res) => {
    try {
      const userData = req.session.user
      const orderId = req.query.orderId;
      const user= await User.findById(id); 
      const address1=await Address.find({user:id})
  
  
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
      res.render('orderDetails', { order: orderData, userData,user ,address1});
  
    } catch (error) {
      console.error('Error fetching order details:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

module.exports={
    loadOrderlist,
    loadOrderdetails,
    loadOrderdetailsuser,
    orderPlaced,
    orderDetails
  
}




