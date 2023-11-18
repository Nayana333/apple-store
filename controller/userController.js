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
     res.render('registration');
  } catch (error) {
        console.log(error.message);
     }                              
}




// const insertUser=async(req,res)=>{
//     try{
//         const spassword = await securePassword(req.body.password);
//         const user=new User({
//             name:req.body.name,
//             email:req.body.email,
//             mobile:req.body.mobile,
//             username:req.body.username,
//             image: req.file.filename,
//             address:req.body.address,
//             password:spassword,
//             is_admin:0,
//             is_blocked:0
         
    

//         });
//         const userData=await user.save();
//         req.session.id2=userData._id
//             console.log(req.session.id2);
         
//             sentOTPVerificationEmail(req, res, req.body.name, req.body.email, userData._id);

//             if (userData) {
               
                
//                 res.render('otp-page', { user: userData });
//             } else {
//                 res.render('registration', { message: "Registration Failed" });
//     }

//     }catch(error){
//         console.log(error.message)
//     }
// }

const insertUser = async (req, res) => {
    try {
        // Check if email already exists
        const emailExists = await User.exists({ email: req.body.email });
        if (emailExists) {
            return res.render('registration', { message: 'Email already exists', isError: true });
        }

        // Check if phone number already exists
        const phoneExists = await User.exists({ mobile: req.body.mobile });
        if (phoneExists) {
            return res.render('registration', { message: 'Phone number already exists', isError: true });
        }

        // Continue with user registration
        const spassword = await securePassword(req.body.password);
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mobile,
            username: req.body.username,
            image: req.file.filename,
            address: req.body.address,
            password: spassword,
            is_admin: 0,
            is_blocked: 0
        });

        const userData = await user.save();
        req.session.id2 = userData._id;
        console.log(req.session.id2);

        sentOTPVerificationEmail(req, res, req.body.name, req.body.email, userData._id);

        if (userData) {
            res.render('otp-page', { user: userData, isError: false });
        } else {
            res.render('registration', { message: "Registration Failed", isError: true });
        }

    } catch (error) {
        console.log(error.message);
        res.render('registration', { message: "Registration Failed", isError: true });
    }
};

const loginLoad =async(req,res)=>{
    try{
        
        res.render('login')


    }catch(error){
        console.log(error.message)
    }

}
const varifyLogin=async(req,res)=>{
    try{
        const productData= await Product.find({});
        const categoryData=await Category.find({})

        const email=req.body.email;
        const password=req.body.password
        const userData= await User.findOne({email:email})
       
        if(userData){
                const passwordMatch=await bcrypt.compare(password,userData.password)
             
            if(passwordMatch){
                if(userData.is_verified === 0){
                    
                   {
                       
                        res.render('login',{message:"please varify your mail"})

                }
            }
                else{
                    if(userData.is_blocked ===false)
                    {
                        req.session.user_id=userData._id;
                        res.redirect('/userhome')
                    }else{
                        res.render('login',{message:"Your account hasbeen temperrorly suspended"})
                    }
                
                }

            }
            else{
                res.render('login',{message:"Email and password do not match"});
            }

        }else{
            res.render('login',{message:"login invalid"})
        }

    }catch(error){
        console.log(error.message)
    }

}
const loadHome=async(req,res)=>{
    try{
        const userData= await Product.find({});
        const categoryData=await Category.find({})
        
        res.render('home',{product:userData,category:categoryData})


    }catch(error){
        console.log(error.message)
    }
}
const loaduserHome=async(req,res)=>{
    try{
        const userData= await Product.find({});
        const categoryData=await Category.find({})
        
        res.render('home1',{product:userData,category:categoryData})


    }catch(error){
        console.log(error.message)
    }
}
const forgotLoad=async(req,res)=>{
    try{
        res.render('forgot');

    }catch(error){
        console.log(error.message)
    }
}
//forgot password
const forgotVarify=async(req,res)=>{
    try{
        const email=req.body.email
        const userData=await User.findOne({email:email})
        if(userData){
            if(userData.is_verified=== 0){
                res.render('forgot',{message:"please varify your mail"})

 
            }
            else{
                const randomString = randomstring.generate();
                const updatedData=await User.updateOne({email:email},{$set:{token:randomstring}});
                sendResetPasswordMail(userData.name,userData.email,randomString);
                res.render('forgot',{message:"please check your mail to reset your password"})
            }
        }
        else
        {
            res.render('forgot',{message:"E-mail is incorrect"})
        }

    }catch(error){
        console.group(error.message)
    }
}
// const sendOTPVerificationEmail =async(req,res,name,email,_id)=>{
//     try{

//         const otp=`${Match.floor(1000 + Match.random()*9000)}`;
//         //mail option
//         const mailOption={
//             from:"nrnayana1@gmail.com",
//             to:email,
//             subject:"verify your email",
//             html: <p> enter ${otp} in the app to verify your email </p>


//         };
//         //hash the otp
//         const hashOTP=await bcrypt.hash(otp,10)
//         new UserOTPVerification({
//             userId:_id,
//             otp:hashedOTP,
//             created:Date.now(),
//             expireAt:Date.now()+ 3600000,
//         });
//         //save otp record
//         await newOTPVerification.save();
//         await transporter.sendMail(mailOptions,async(err,status)=>{
//             if(err){
//                 console.log('Err',err);

//             }
//             else{

//             }
//         });                                         

//     }catch(error){
//         console.log(error.message)
//     }
// }
const logOut=async(req,res)=>{

    try{
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
        
        console.log(req.session.otp);
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


//varifyOTP
const OTPVerification = async (req, res) => {
    try {
        const userId = req.session.id2;
        const otp = req.body.fullOTP;

        if (!otp) {
            const errorMessage = "Empty OTP details are not allowed";
            return res.redirect('/otp-page?error=${errorMessage}');
        } else {
            const userOTPVerificationRecords = await UserOTPVerification.find({
                userId
            });

            if (userOTPVerificationRecords.length <= 0) {
                const errorMessage = "Account record doesn't exist or has been verified already. Please sign up or...";
                return res.redirect('/otp-page?error=${errorMessage}');
            } else {
                const { expiresAt } = userOTPVerificationRecords[0];
                const hashedOTP = userOTPVerificationRecords[0].otp;

                if (expiresAt < Date.now()) {
                    await UserOTPVerification.deleteMany({ userId });
                    const errorMessage = "Code has expired. Please request again.";
                    return res.redirect('/otp-page?error=${errorMessage}');
                } else {
                    const validOTP = await bcrypt.compare(otp, hashedOTP);

                    if (!validOTP) {
                        const errorMessage = "Invalid code passed. Check your inbox";
                        return res.redirect('/otp-page?error=${errorMessage}');
                    } else {
                        await User.updateOne({ _id: userId }, { is_verified: 1 });
                        await UserOTPVerification.deleteMany({ userId });
                       res.render("login")
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
const product =async(req,res)=>{
    try{
        const userData= await Product.find({});
        
        res.render('productpage', {product: userData })


    }catch(error){
        console.log(error.message)
    }

}

  const loadContact= async(req,res)=>{
    try{
        res.render('contact');

    }catch(error){
        console.log(error.message)
    }
}


const loadProfile = async (req, res) => {
    try {
        
       
        const id = req.session.user_id; 
      
        const userData = await User.findById(id); 
      
       const address=await Address.find({user:id})
       const order=await Order.find({user:id})
        console.log(order);
       

        res.render('viewprofile', { user: userData ,address,order});

    } catch (error) {
        console.log(error.message);
    }
}
const loadeditProfile= async (req, res) => {
    try {
        const id = req.session.user_id; 
       
        const userData = await User.findById(id); 
        res.render('editprofile' ,{user:userData});

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
  


  
module.exports={
   
    loadRegister,
    insertUser,
    loginLoad,
    varifyLogin,
    loadHome,
    forgotLoad,
    forgotVarify,
    sentOTPVerificationEmail,
    loadOTPpage,
    OTPVerification,
    userLogout,
    product,
    loaduserHome,
 
    loadContact,
    logOut,
    loadProfile,
    loadeditProfile,
    editProfile,
    
   
   
    
    
}
