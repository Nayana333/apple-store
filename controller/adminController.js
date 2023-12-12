const User=require("../models/userModel");
const Product=require("../models/productModel");
const categ=require("../models/categoryModel");
const Order=require("../models/orderModel")
const bcrypt=require('bcrypt');
const randomstring=require('randomstring')
const nodemailer=require('nodemailer');
const validator = require('validator');
const  dateUtils = require('../helpers/dateUtils')
const charData=require('../helpers/charData')
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
       const [totalRevenue,totalUsers,totalOrders,totalProducts,totalCategories,orders,monthlyEarnings,newUsers]=await Promise.all
       ([Order.aggregate([
        {$match:{status:"payment successfull"}},
        {$group:{_id:null,totalAmount:{$sum:"$totalAmount"}}},

       ]),
       
       User.countDocuments({isBlocked:false,is_verified:true}),
       Order.countDocuments(),
       Product.countDocuments(),
       categ.countDocuments(),
       Order.find().limit(10).sort({orderDate:-1}).populate('user'),
       Order.aggregate([
        {
        $match: {
            status:"payment successfull",
            orderDate:{$gte:new Date(new Date().getFullYear(),new Date().getMonth(),1)},

        },
    },
    {$group: {_id: null, monthlyAmount: { $sum: "$totalAmount" }}},
        
       ]),
       User.find({isBlocked:false,is_verified:true}).sort({date:-1}).limit(5)
    ]);


    console.log('monthlyEarnings'+monthlyEarnings);
    const adminData=req.session.adminData
    const totalRevenueValue=totalRevenue.length > 0 ?totalRevenue[0].totalAmount : 0;
    const monthlyEarningsValue=monthlyEarnings.length > 0 ?monthlyEarnings[0].monthlyAmount : 0;
    console.log(monthlyEarningsValue);
    const monthlyDataArray=await charData.getMonthlyDataArray();
    const dailyDataArray=await charData.getDailyDataArray();
    const yearlyDataArray=await charData.getYearlyDataArray();
    

        var search='';
        if(req.query.search){
            search=req.query.search;
        }

       const data =await User.find({is_admin:0,
        $or:[
            { name:{$regex:'.*'+search+'.*',$options:'i'}},
            { email:{$regex:'.*'+search+'.*',$options:'i'}},
            { mobile:{$regex:'.*'+search+'.*',$options:'i'}},
        ]
               
    });
    console.log(totalRevenueValue+'total');
        res.render('dashboard',{admin: adminData,
        orders,
        newUsers,
        totalRevenue: totalRevenueValue,
        totalOrders,
        totalProducts,
        totalCategories,
        totalUsers,
        monthlyEarnings: monthlyEarningsValue,
        monthlyMonths: monthlyDataArray.map(item => item.month),
        monthlyOrderCounts: monthlyDataArray.map(item => item.count),
        dailyDays: dailyDataArray.map(item => item.day),
        dailyOrderCounts: dailyDataArray.map(item => item.count),
        yearlyYears: yearlyDataArray.map(item => item.year),
        yearlyOrderCounts: yearlyDataArray.map(item => item.count),
        })


    }catch(error){
        console.log(error)
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
        const page = req.query.page || 1;
        const perPage = 5; 
        let filterBy = '';
        const skip = (page - 1) * perPage; 
        
        var search='';
        if(req.query.search){
            search=req.query.search;
            console.log(search)
        }
        if (req.query.filterBy) {
            filterBy = req.query.filterBy.toLowerCase(); 
        }

        const totalUsers = await User.countDocuments({
            is_admin: 0,
            $or: [
                { name: { $regex: '.*' + search + '.*', $options: 'i' } },
                { email: { $regex: '.*' + search + '.*', $options: 'i' } },
                { mobile: { $regex: '.*' + search + '.*', $options: 'i' } },
            ],
            is_blocked: filterBy === 'blocked' ? true : filterBy === 'unblocked' ? false : { $exists: true },
        });

        const totalPages = Math.ceil(totalUsers / perPage);

       const adminData =await User.find({is_admin:0,
        $or:[
            { name:{$regex:'.*'+search+'.*',$options:'i'}},
            { email:{$regex:'.*'+search+'.*',$options:'i'}},
            { mobile:{$regex:'.*'+search+'.*',$options:'i'}},
        ],
        is_blocked: filterBy === 'blocked' ? true : filterBy === 'unblocked' ? false : { $exists: true },
               
    }).sort({ name: 1 }) .skip(skip)
    .limit(perPage);;
        res.render('userDetails',{user:adminData,totalPages, currentPage: page , filterBy: filterBy})


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
  const getSalesReport=async(req,res)=>{
    try{
        const admin=req.session.adminData

        const page=parseInt(req.query.page) || 1;
        const perPage=10;


        let query={status:"payment successfull"};
        
        if (req.query.paymentMethod) {
            if (req.query.paymentMethod === "Online Payment") {
              query.paymentMethod = "Online Payment";
            } else if (req.query.paymentMethod === "Wallet") {
              query.paymentMethod = "Wallet Payment";
            } else if (req.query.paymentMethod === "Cash On Delivery") {
              query.paymentMethod = "Cash on delivery";
            }
      
          }

        if (req.query.status) {
            if (req.query.status === "Daily") {
              query.orderDate = dateUtils.getDailyDateRange();
            } else if (req.query.status === "Weekly") {
              query.orderDate = dateUtils.getWeeklyDateRange();
            } else if (req.query.status === "Yearly") {
              query.orderDate = dateUtils.getYearlyDateRange();
            }
          }
        if(req.query.status){
            if(req.query.status=== "Daily"){
                query.orderDate=dateUtils.getDailyDateRange();

            }
            
                else if(req.query.status==="Weekly"){
                    query.orderDate=dateUtils.getWeeklyDateRange();

                }
            
            else if(req.query.status === "Yearly")
            {
                query.orderDate= dateUtils.getYearlyDateRange();
            }
        }
        if(req.query.startDate && req.query.endDate){
            query.orderDate={
                $gte:new Date(req.query.startDate),
                $lte:new Date(req.query.endDate),
            };
        }
      
        const totalOrdersCount = await Order.countDocuments(query);
        const totalPages=Math.ceil(totalOrdersCount/perPage);
        const skip=(page-1) * perPage;

        const orders = await Order.find(query)
      .populate("user")
      .populate({
        path: "address",
        model: "Address",
      })
      .populate({
        path: "items.product",
        model: "Product",
      })
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(perPage);


  


        const totalRevenue=orders.reduce((acc,order)=>acc + order.totalAmount,0);

        const returnedOrders = orders.filter(order => order.status === "Return confirmed");


console.log("Count of orders with 'Return Confirmed' status:", );


        const totalSales=orders.length;


        const totalProductSold=orders.reduce((acc,order)=>acc + order.items.length,0);

        res.render("salesReport",{
            orders,admin,totalRevenue,returnedOrders,totalSales,totalProductSold,req,totalPages,currentPage:page});
      


    }catch(error){
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
    unblockUser,
    getSalesReport
}
