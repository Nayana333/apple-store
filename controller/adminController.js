const User=require("../models/userModel");
const Product=require("../models/productModel");
const categ=require("../models/categoryModel");

const bcrypt=require('bcrypt');
const randomstring=require('randomstring')
const nodemailer=require('nodemailer');
const validator = require('validator');
const { product } = require("./userController");


const securePassword=async(password)=>{
    try{
        const passwordHash=await bcrypt.hash(password, 10); 
        return passwordHash;
    }catch(error){
        console.log(error.message);
        
    }
}


const loadLogin= async(req,res)=>{
   
    try{
       
        res.render('adminlogin');

    }catch(error){
        console.log(error.message)
    }
}



const verifyLogin=async(req,res)=>{
    try{

        const email=req.body.email;
        const password=req.body.password
       const adminData= await User.findOne({email:email})
   if(adminData){

           const passwordMatch=await bcrypt.compare(password,adminData.password)
      if(passwordMatch){
        if(adminData.is_admin=== 0){
        
            res.render('adminlogin',{message:"please varify your mail"})  
    }
        else{
            
            req.session.admin_id=adminData._id;
            res.redirect('/admin/dashboard')
       
    }

      }
      else{
        res.render('adminlogin',{message:"Email and password do not match"});
      }

   }else{
    res.render('adminlogin',{message:"login invalid"})
   }

    }catch(error){
        console.log(error.message)
    }

}
const logOut=async(req,res)=>{

  try{
      req.session.admin_id = null;
      res.redirect('/'); 

  }catch(error){
      console.log(error.message)

  }

}

const adminDashboard=async(req,res)=>{
    try{
       
        var search='';
        if(req.query.search){
            search=req.query.search;
        }

       const adminData =await User.find({is_admin:0,
        $or:[
            { name:{$regex:'.*'+search+'.*',$options:'i'}},
            { email:{$regex:'.*'+search+'.*',$options:'i'}},
            { mobile:{$regex:'.*'+search+'.*',$options:'i'}},
        ]
               
    });
        res.render('dashboard',{user:adminData})


    }catch(error){
        console.log(error.message)
    }
}
const loadDashboard = async(req,res)=>{

    try{
        const adminData=await User.findById({_id:req.session.admin_id});
        res.render('adminhome',{admin:adminData})

    }catch(error){
        console.log(error.message);
    }
}


  
  const loadUser=async(req,res)=>{
    try{
        var page=1
        var search='';
        if(req.query.search){
            search=req.query.search;
            console.log(search)
        }

       const adminData =await User.find({is_admin:0,
        $or:[
            { name:{$regex:'.*'+search+'.*',$options:'i'}},
            { email:{$regex:'.*'+search+'.*',$options:'i'}},
            { mobile:{$regex:'.*'+search+'.*',$options:'i'}},
        ]
               
    });
        res.render('userDetails',{user:adminData})


    }catch(error){
        console.log(error.message)
    }
}


const unblockUser= async (req, res) => {
    try {
        const admin = req.session.adminData;
        const id = req.query.id;

       
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).send("User not found");
        }

        
        user.is_blocked = !user.is_blocked;

        await user.save();

        res.redirect('/admin/userDetails');
    } catch (error) {
        console.log(error.message);
    }
};








const loadeditProfile= async (req, res) => {
    try {
        const id = req.session.admin_id; 
       
        const adminData = await User.findById(id); 
        res.render('editprofile' ,{user:adminData});

    } catch (error) {
        console.log(error.message);
    }
}
const editProfile= async (req, res) => {
    try {
        const id = req.session.admin_id; 
        
        const adminData = await User.findById(id); 
     
        
  
        if (!adminData) {
         
            return res.render('editProfile', { message: "user not found",user:adminData});
        }
  
        
        const updateFields = {
            name: req.body.name,
            email: req.body.email,
            mobile:req.body.mobile,
            username:req.body.username,
           
            
        };
 
       
        if (req.file) {
            updateFields.image = req.file.filename;
        }
  
   
        await User.findByIdAndUpdate(id, { $set: updateFields });
  
        res.redirect('/user/editProfile',{ message: "Category Registration succesful" });

    } catch (error) {
        console.log(error.message);
  
  }
  }




module.exports={
    loadLogin,
    verifyLogin,
    adminDashboard,
    loadDashboard,
    unblockUser,
    loadUser,
    logOut,
    loadeditProfile,
    editProfile,
    unblockUser
}
