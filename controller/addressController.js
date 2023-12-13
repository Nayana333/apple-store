const Address=require('../models/addressModel')
const User=require('../models/userModel');
const userHelper=require('../helpers/userHelper')
const Order=require('../models/orderModel')
const Transaction=require('../models/transactionModel')

const loadAddress=async(req,res)=>{
    try{
        const userId=req.session.user_id;
        const user=await User.findById(userId);
        const address=await Address.find({user:userId}).sort({createdDate:-1}).exec();
        res.render('address-load',{address,user})
    }catch(error){
        console.log(error.message);
    }

}
const loaduserProfile= async (req, res) => {
    try {
        const id = req.session.user_id; 
       
        const userData = await User.findById(id); 
        res.render('addAddress' ,{user:userData});

    } catch (error) {
        console.log(error.message);
    }
}
const postAddress=async(req,res)=>{

    const userId=req.session.user_id;
    const address=await Address.find({user:userId})
    const order=await Order.find({})
    const {type,phone,houseName,pinCode,name,street,city,state}=req.body
    const transaction=await Transaction.find({})

    const addAddressResult=await userHelper. addAddress(userId,type,phone,houseName,name,street,city,state,pinCode);
    if(!addAddressResult.success){
        return res.status(400).json({errorMessgae:addAddressResult.message});
    }
    const user = await User.findById(userId)
    const addresses = await Address.find({ user: userId,address,order }).sort({ createdDate: -1 }).exec();
    res.redirect('/viewprofile')
}
const postAddresscheckOut=async(req,res)=>{

    const userId=req.session.user_id;
    const address=await Address.find({user:userId})
    const order=await Order.find({})
    const transaction=await Transaction.find({})

    const {type,phone,houseName,pinCode,name,street,city,state}=req.body

    const addAddressResult=await userHelper. addAddress(userId,type,phone,houseName,name,street,city,state,pinCode);
    if(!addAddressResult.success){
        return res.status(400).json({errorMessgae:addAddressResult.message});
    }
    const user = await User.findById(userId)
    const addresses = await Address.find({ user: userId }).sort({ createdDate: -1 }).exec();
      res.redirect('/checkout')

}

const loadAddAddresscheckOut= async (req, res) => {
    try {
        const id = req.session.user_id; 
       
        const userData = await User.findById(id); 
        res.render('addAddressCheckOut' ,{user:userData});

    } catch (error) {
        console.log(error.message);
    }
}
const deleteAddress= async(req,res)=>{

    try {
        
        const  AddressId = req.query.addressId;
        const userId = req.query.userId;
        await Address.deleteOne({_id: AddressId})
      
        const order=await Order.find({});
        const user = await User.findById(userId)
          const addresses = await Address.find({ user: userId }).sort({ createdDate: -1 }).exec();
            res.redirect('/viewprofile')            
        
    } catch (error) {
        console.log(error.message);
        
    }
  
  
  };
module.exports={
    loadAddress,
    postAddress,
    loaduserProfile,
    postAddresscheckOut,
    loadAddAddresscheckOut,
    deleteAddress

}