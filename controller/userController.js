const User = require('../models/userModel');
const bcrypt=require("bcrypt");
const randomstring=require("randomstring")
const nodemailer=require("nodemailer")
const config=require("../config/config")
const Product=require("../models/productModel");
const Category=require("../models/categoryModel");
const UserOTPVerification = require("../models/UserOTPVerificationModel");
const Address=require('../models/addressModel')
const Order=require('../models/orderModel')
const Coupon=require('../models/couponModel')
const Cart=require('../models/cartModel')
const sharp = require('sharp')
const Transaction=require('../models/transactionModel')
const Banner=require('../models/bannerModel')





const securePassword=async(password)=>{
    try{
        const passwordHash= await bcrypt.hash(password,10);
        return passwordHash;    

    }catch(error){
        console.log(error.message)
    }

}



//forgot password varify
const sendResetPasswordMail = async (name, email, token) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            requireTLS: true,
            auth: {
                user: config.emailUser,
                pass: config.emailPassword
            }
        });
        const verificationURL = `http://localhost:3005/forgot-password?token=${token}`;
        const mailOptions = {
            from: config.emailUser,
            to: email,
            subject: 'Reset Password',
            html: `<p>Hi ${name}, please click here to <a href="${verificationURL}">reset your password.</a></p>`
        }
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log("Email has been sent:", info.response);
            }
        });
    } catch (error) {
        console.log(error.message);
    }
}


const loadRegister = async (req, res) => {
  try {
   const  user=req.session.user_id
     res.render('registration',{user});
  } catch (error) {
        console.log(error.message);
     }                              
}






const insertUser = async (req, res) => {
    try {

        const userExist = await User.findOne({ email: req.body.email });
       req.session.referralCode = req.body.referralCode || null;
       const referralCode = req.session.referralCode;
       
       if (userExist) {
        res.render('registration', { message: "User already exists" });
    } else{
        let referrer;

        if(referralCode){
            referrer=await User.findOne({referralCode});
            if(!referrer){
                res.render('registration',{message:'Invalid Refferral Code'});
            }
            if(referrer.referredUsers.includes(req.body.email)){
                res.render('registration',{message:'Refferal code has Already been used by this email '})


            }
        }
    
        const password=req.body.password;
        const confirmPassword=req.body.confirm;
       if(password===confirmPassword){
        const spassword = await securePassword(req.body.password);
       
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mobile,
            username: req.body.username,
            address: req.body.address,
            password: spassword,
            is_admin: 0,
            is_blocked: 0
        });
    
       


  
        const emailExists = await User.exists({ email: req.body.email });
        if (emailExists) {
            return res.render('registration', {user,message: 'Email already exists' });
        }

       
        const phoneExists = await User.exists({ mobile: req.body.mobile });
        if (phoneExists) {
            return res.render('registration',{user, message: 'Phone number already exists' });
        }

        const userData = await user.save();
        req.session.id2 = userData._id;
      

        sentOTPVerificationEmail(req, res, req.body.name, req.body.email, userData._id);

        if (userData) {
            res.render('otp-page', { user: userData, isError: false });
        } else {
            res.render('registration', { message: "Registration Failed" });
        }
    }
}

    } catch (error) {
        console.log(error.message);
        res.render('registration', { message: "Registration Failed" });
    }
};

const loginLoad =async(req,res)=>{
    try{
        const user=req.session.user_id;
       
        res.render('login',{user:null})


    }catch(error){
        console.log(error.message)
    }

}
// const varifyLogin=async(req,res)=>{
//     try{
//         const productData= await Product.find({});
//         const categoryData=await Category.find({})

//         const email=req.body.email;
//         const password=req.body.password
//         const userData= await User.findOne({email:email})
//         const user=userData;
//         if(!user){
//             res.render('login',{message:"user does not exist,signup for login",user:null})
//         }
        

       
//         if(userData){

            
//                 const passwordMatch=await bcrypt.compare(password,userData.password)
             
//             if(passwordMatch){
//                 if(userData.is_verified === 0){''
                    
//                    {
                       
//                         res.render('login',{message:"please varify your mail",user:null})

//                 }
//             }
//                 else{
//                     if(userData.is_blocked ===false)
//                     {
//                         req.session.user_id=userData._id;
//                      console.log('sessioni'+req.session.user_id);
//                      const cart=await Cart.findOne({user:req.session.user_id})
//                      if(cart){
//                         console.log(cart);
//                      req.session.cartLength = cart.total;
//                      console.log('cart'+req.session.cartLength)
//                      }
                     
             
//                         res.redirect('/userhome')
//                     }else{
//                         res.render('login',{message:"Your account hasbeen temperrorly suspended",user:null})
//                     }
                
//                 }

//             }
//             else{
//                 res.render('login',{message:"Email and password do not match",user:null},);
//             }

//         }else{
//             res.render('login',{message:"login invalid",user:null})
//         }

//     }catch(error){
//         console.log(error.message)
//     }

// }

const varifyLogin = async (req, res) => {
    try {
        const productData = await Product.find({});
        const categoryData = await Category.find({});

        const email = req.body.email;
        const password = req.body.password;
        const userData = await User.findOne({ email: email });
        const user = userData;

        if (!user) {
            return res.render('login', { message: "User does not exist, sign up to login", user: null });
        }

        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);

            if (passwordMatch) {
                if (userData.is_verified === 0) {
                    return res.render('login', { message: "Please verify your mail", user: null });
                } else {
                    if (userData.is_blocked === false) {
                        req.session.user_id = userData._id;
                        console.log('sessioni' + req.session.user_id);
                        const cart = await Cart.findOne({ user: req.session.user_id });
                        if (cart) {
                            console.log(cart);
                            req.session.cartLength = cart.total;
                            console.log('cart' + req.session.cartLength);
                        }

                        return res.redirect('/userhome');
                    } else {
                        return res.render('login', { message: "Your account has been temporarily suspended", user: null });
                    }
                }
            } else {
                return res.render('login', { message: "Email and password do not match", user: null });
            }
        } else {
            return res.render('login', { message: "Login invalid", user: null });
        }
    } catch (error) {
        console.log(error.message);
        return res.status(500).send("Internal Server Error");
    }
};


const loadHome=async(req,res)=>{
    try{
        const banner=await Banner.find({isListed:true})
        const cartData=req.session.cartLength;
        const userId=req.session.user_id;
        console.log(userId);
        const user=await User.findOne({_id:userId})
        const userData= await Product.find({is_list:true});
        const categoryData=await Category.find({})
        if(user){
            res.render('home1',{product:userData,category:categoryData,user:user,cartData,banner})

        }
        else{
            res.render('home1',{product:userData,category:categoryData,user:null,cartData:null,banner})

        }

    }catch(error){
        console.log(error.message)
    }
}
// const forgotLoad=async(req,res)=>{
//     try{
//         res.render('forgot');

//     }catch(error){
//         console.log(error.message)
//     }
// }
//forgot password
// const forgotVarify=async(req,res)=>{
//     try{
//         const email=req.body.email
//         const userData=await User.findOne({email:email})
//         if(userData){
//             if(userData.is_verified=== 0){
//                 res.render('forgot',{message:"please varify your mail"})

 
//             }
//             else{
//                 const randomString = randomstring.generate();
//                 const updatedData=await User.updateOne({email:email},{$set:{token:randomstring}});
//                 sendResetPasswordMail(userData.name,userData.email,randomString);
//                 res.render('forgot',{message:"please check your mail to reset your password"})
//             }
//         }
//         else
//         {
//             res.render('forgot',{message:"E-mail is incorrect"})
//         }

//     }catch(error){
//         console.group(error.message)
//     }
// }

const logOut=async(req,res)=>{

    try{`   `
        req.session.user_id = null;
        res.redirect('/login'); 
  
    }catch(error){
        console.log(error.message)
  
    }
  
  }
const sentOTPVerificationEmail = async (req, res, name, email, _id) => {
    try {
        const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
        req.session.otp = otp;

        console.log(otp);
////create transporter/////////////////////////////////////////

    const transporter=nodemailer.createTransport({
            host:'smtp.gmail.com',
            port:465,
            secure:true,
            requireTLS:true,
        auth:{
                user:'nrnayana1@gmail.com',
                pass:'ztlp ioyl itlx bzoi'
        }       
    });

       

        const mailOptions = {
            from: "nrnayana1gmail.com",
            to: email,
            subject: "Verify your email",
            html: `<p> Enter <b>${otp}</b> in the app to verify your email </p>`,
        };
       

        // Hash password
        const hashedOTP = await bcrypt.hash(otp, 10);

        const newOTPVerification = new UserOTPVerification({
            userId: _id,
            otp: hashedOTP,
            createdAt: Date.now(),
            expiresAt: Date.now() +120000,
        });

        await newOTPVerification.save();

        await transporter.sendMail(mailOptions, async (err, status) => {
            if (err) {
                console.log('Err', err);
            } else {
                
               
             
                
            }
        });

    } catch (error) {
        console.log(error.message);
}
}


const OTPVerification = async (req, res) => {
    try {
        const userId = req.session.id2;
        
        let otp = req.body.otp;
        otp = otp.join('')
        console.log(otp+"body otp");

        

        if (!otp) {
            const errorMessage = "Empty OTP details are not allowed";
            return res.redirect(`/otp-page?error=${errorMessage}`);
        } else {
            const userOTPVerificationRecords = await UserOTPVerification.find({ userId });

            if (userOTPVerificationRecords.length <= 0) {
                const errorMessage = "Account record doesn't exist or has been verified already. Please sign up or...";
                return res.redirect(`/otp-page?error=${errorMessage}`);
            } else {
               
                const latestRecord = userOTPVerificationRecords[userOTPVerificationRecords.length - 1];
                const { expiresAt, otp: hashedOTP } = latestRecord;
                console.log(hashedOTP)
                if (expiresAt < Date.now()) {
                    await UserOTPVerification.deleteMany({ userId });
                    const errorMessage = "Code has expired. Please request again.";
                    return res.redirect(`/otp-page?error=${errorMessage}`);
                } else {
                    const validOTP =await bcrypt.compare(otp, hashedOTP);
                    console.log(validOTP+"validity")
                    if (!validOTP) {
                        const errorMessage = "Invalid code passed. Check your inbox";
                        console.log("invalid otp");
                        return res.redirect(`/otp-page?error=${errorMessage}`);
                    } else {
                      
                        latestRecord.used = true;
                        await latestRecord.save();
                        if (req.session.referralCode) {
                            await User.updateOne({ _id: userId }, { is_verified: 1, walletBalance: 50 });
                            const referrer = await User.findOne({ referralCode: req.session.referralCode });
                            const user = await User.findOne({ _id: userId });
                            referrer.referredUsers.push(user.email);
                            referrer.walletBalance += 100;
                            await referrer.save();

                            const referredUserTransaction = new Transaction({
                                user: referrer._id,
                                amount: 100,
                                type: 'credit',
                                date: Date.now(),
                                paymentMethod: "Wallet Payment",
                                description: 'Referral Bonus',
                            });
                            const referrerTransaction = new Transaction({
                                user: userId,
                                amount: 50,
                                type: 'credit',
                                date: Date.now(),
                                paymentMethod: "Wallet Payment",
                                description: 'Referral Bonus',
                            });
                            await referredUserTransaction.save();
                            await referrerTransaction.save();
                           




                        } else {
                            await User.updateOne({ _id: userId }, { is_verified: 1 });
                        }

                        delete req.session.referralCode;
                        delete req.session.otp;
                        

                        res.redirect('/login');

                        
                    }
                  
                }
            }
        }
    } catch (error) {
        const errorMessage = "An error occurred during OTP verification";
        return res.redirect('/otp-page?error=${errorMessage}');
    }
};






const loadOTPpage = async (req, res) => {
    const errorMessage = req.query.error;
    const user = req.user;
    req.session.user = user

    try {
        res.render('otp-page', { user, errorMessage });
    } catch (error) {
        console.log(error.message);
}
};


const userLogout =async(req,res)=>{
    try{
        req.session.destroy();
        res.redirect('/');

    }catch(error){
        console.log(error.message)

    }

}


const product = async (req, res) => {
    try {
      const page = req.query.page || 1;
      const limit = 4;
      const skip = (page - 1) * limit;
      const cartData = req.session.cartLength;
  
      const category = await Category.find({});
  
      const categories = Array.isArray(req.query.category) ? req.query.category : [req.query.category];
      const priceRange = req.query.price || 'all';
      const colors = Array.isArray(req.query.color) ? req.query.color : [req.query.color];
      var search = '';
      if (req.query.search) {
        search = req.query.search;
      }
      const sortBy = req.query.sortBy || 'priceLowToHigh';
  
      const userId = req.session.user_id;
      const user = await User.findById(userId);
  
      let minPrice = 0;
      let maxPrice = Number.MAX_VALUE;
      switch (priceRange) {
        case 'under25':
          minPrice = 0;
          maxPrice = 20000;
          break;
        case '25to50':
          minPrice = 20000;
          maxPrice = 40000;
          break;
        case '50to100':
          minPrice = 40000;
          maxPrice = 60000;
          break;
        case '100to200':
          minPrice = 60000;
          maxPrice = 80000;
          break;
        case '100above':
          minPrice = 80000;
          break;
        default:
          break;
      }
  
      let sortQuery = {};
  
      if (sortBy === 'priceLowToHigh') {
        sortQuery = { price: 1 };
      } else if (sortBy === 'priceHighToLow') {
        sortQuery = { price: -1 };
      }
  
      const filter = {
        $and: [
          { list: true }, 
          { $or: [{ category: { $in: categories.map(c => new RegExp(c, 'i')) } }] },
          { price: { $gte: minPrice, $lte: maxPrice } },
          { productColor: { $in: colors.map(c => new RegExp(c, 'i')) } },
        ],
      };
  
      const searchFilter = {
        $or: [
          { name: { $regex: '.*' + search + '.*', $options: 'i' } },
          { category: { $regex: '.*' + search + '.*', $options: 'i' } },
          { discountPrize: { $regex: '.*' + search + '.*', $options: 'i' } },
        ],
      };
  
      const totalProducts = await Product.countDocuments({
        $and: [
          filter,
          searchFilter,
        ],
      });
  
      const adminData = await Product.find({
        $and: [
          filter,
          searchFilter,
        ],
      }).sort(sortQuery).skip(skip).limit(limit);
  
      const selectedCategories = categories;
      const selectedPriceRange = priceRange;
      selectedColors = colors;
  
      res.render('productpage', {
        product: adminData,
        user,
        sortBy,
        category,
        selectedCategories,
        selectedPriceRange,
        selectedColors,
        currentPage: parseInt(page),
        cartData,
        totalPages: Math.ceil(totalProducts / limit),
      });
  
    } catch (error) {
      console.log(error.message);
    }
  };
   

  const loadContact= async(req,res)=>{
    
    try{
       const userId=req.session.user_id;
       const user=await User.findById(userId)
        res.render('contact',{user});

    }catch(error){
        console.log(error.message)
    }
}


const loadProfile = async (req, res) => {
    try {
        
       
        const id = req.session.user_id; 
        const transaction=await Transaction.find({user:id}).sort({date:-1})
        const currentDate = new Date();
        // const coupon = await Coupon.find({ isListed: true }).sort({ expiry:1 });
        const coupon = await Coupon.find({
            isListed: true,
            expiry: { $gt: currentDate } 
          }).sort({ expiry: 1 });

        console.log(coupon);
      
        const userData = await User.findById(id); 
      
       const address=await Address.find({user:id})
       const order = await Order.find({ user: id }).sort({ orderDate: -1});
       
       

        res.render('viewprofile', { user: userData ,address,order,coupon,transaction});

    } catch (error) {
        console.log(error.message);
    }
}
const loadeditProfile= async (req, res) => {
    try {
        const id = req.session.user_id; 
       
        const userData = await User.findById(id); 
        res.render('editProfile' ,{user:userData});

    } catch (error) {
        console.log(error.message);
    }
}
const editProfile= async (req, res) => {
    try {
        const id = req.session.user_id; 
        
        const userData = await User.findById(id); 
     

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
    
  
        res.redirect('/viewprofile');

    } catch (error) {
        console.log(error.message);
  
  }
  }
  



const loadresendOTPpage = async (req, res) => {
    const errorMessage = req.query.error;
    const user = req.user;
    req.session.user = user
    

    try {
    const userId = req.session.id2
    const userData=await  User.findById(userId)
    const name=userData.name;
    const email=userData.email;
    
    
        res.render('resend-otp', { user, errorMessage });
+

        sentOTPVerificationEmail(req, res, name, email,userData._id);

    } catch (error) {
        console.log(error.message);
}
};




const getForgotEmail=async(req,res)=>{
    try{

      const user =req.session.forgotPasswordUser;
      if(req.query.error){
       return res.render('forgot',{user:null,errorMessage:req.query.error})

      }
      res.render('forgot',{user:null})
        
    }catch(error){
        console.log(error.message);
    }
}

const postForgotEmail=async(req,res)=>{
    try{
        const email=req.body.email;
        const user=await User.findOne({email:email})
        if(user){
        req.session.forgotPasswordUser=user._id;
        const name=user.name;
        sentOTPVerificationEmail(req, res, name, email,user._id);
        res.redirect('/forgotOtp')
        }
        else{
           res.render('forgot',{message:'User does not exist',user:null})
        }


    }catch(error){
        console.log(error.message);
    }
}


const getForgotOtp = async(req,res)=>{
    try{

        const user=req.session.forgotPasswordUser;
        
        if(req.query.error){
            console.log(req.query.error)
            let errorMessage = req.query.error
            return res.render('forgotOTP',{user:null,errorMessage})
        }
        res.render('forgotOTP',{user:null})
    }catch(error){
        console.log(error.message)
    }
}

const verifyForgotOTP=async(req,res)=>{
    try{
       
                const userId = req.session.forgotPasswordUser;
                let otp = req.body.otp;
                let forgotOTP = req.session.otp;
                otp = otp.join('');
                console.log(otp + "body otp");
        
                if (!otp) {

                    const errorMessage = "Empty OTP details are not allowed";
                    return res.redirect(`/forgotOtp?error=${errorMessage}`);
                } else {
        
                   
                        console.log(forgotOTP+"VERIFIED");
                      
                            const validOTP = otp==forgotOTP?true:false;
                            console.log(validOTP + "validity");
                            if (!validOTP) {
                                const errorMessage = "otp incorrect";
                                return res.redirect(`/forgotOtp?error=${errorMessage}`);
                            } else {
        
                                delete req.session.fortgotOTP;
        
                               res.redirect('/forgotpswSet')
                            }
                        
                    
                }
            } catch (error) {
                const errorMessage = "An error occurred during OTP verification";
                return res.redirect(`/forgotOtp?error=${errorMessage}`);
            }
        };

        const getForgotpswset=async(req,res)=>{
            try{
                const user=req.session.forgotPasswordUser;
                res.render('forgotpswset',{user:null})
            }catch(error){
                console.log(error.message);
            }
        }

        const passwordSet=async(req,res)=>{
            try{
                const user=req.session.forgotPasswordUser;
                const password=req.body.confirmPassword;
                console.log(password+'reset');
                const secure_password = await securePassword(password);
                const updatedData = await User.findByIdAndUpdate(
                    { _id: user },
                    { $set: { password: secure_password } }
                  );
                  if(updatedData){
                    delete req.session.forgotPasswordUser;
                    res.redirect("/login");
                  }
                  
                } catch (error) {
                  console.log(error.message);
                }
              };


  
module.exports={
   
    loadRegister,
    insertUser,
    loginLoad,
    varifyLogin,
    loadHome,
    sentOTPVerificationEmail,
    loadOTPpage,
    OTPVerification,
    userLogout,
    product,
    loadContact,
    logOut,
    loadProfile,
    loadeditProfile,
    editProfile,
    loadresendOTPpage,
    getForgotEmail,
    postForgotEmail,
    verifyForgotOTP,
    getForgotpswset,
    getForgotOtp,
    passwordSet
    
   
   
    
    
}
