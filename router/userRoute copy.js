const express = require("express");
const user_route = express();
const userController = require("../controller/userController");
const productController=require("../controller/productController");
const cartController=require("../controller/cartController");

const session=require("express-session")
const config=require("../config/config")
user_route.use(session({
   secret: config.sessionSecret,
   resave: false, // Set resave to false
   saveUninitialized: true, // Set saveUninitialized to true or false based on your needs
}));

const auth=require('../middleware/auth')


user_route.set('view engine', 'ejs');


user_route.set('views', './views/user');
user_route.use(express.static('public'))
user_route.use(express.static(__dirname + "/public"))
user_route.use("/public", express.static("public", { "extensions": ["js"] }));
const bodyParser=require('body-parser');
user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({extended:true}))
const multer=require("multer");

const path=require("path")
const storage=multer.diskStorage({destination:function(req,res,cb){
    cb(null,path.join(__dirname,'../public/userImages'));
 },
 filename:function(req, file, cb){
    const name = Date.now() + '-' + file.originalname;
    cb(null,name)

 }

})
const upload=multer({storage:storage});
user_route.get('/registration', userController.loadRegister);
user_route.post('/registration', upload.single('image'),userController.insertUser);
user_route.get('/',userController.loadHome);
user_route.get('/login',auth.isLogout,userController.loginLoad);
user_route.post('/login',auth.isLogout,userController.varifyLogin);
user_route.get('/userhome',auth.isLogin,userController.loaduserHome);
user_route.get('/forgot',auth.isLogout,userController.forgotLoad);
user_route.post('/forgot',auth.isLogout,userController.forgotVarify);
user_route.get('/otp-page',userController.loadOTPpage);
user_route.post('/otp-page',userController.OTPVerification);
user_route.get('/logout',auth.isLogin,userController.userLogout);
user_route.get('/product',userController.product);
user_route.get('/aboutProduct',productController.productpageLOad)
user_route.get('/contact',userController.loadContact)
user_route.get('/home',userController.loadHome)
user_route.get('/logout',auth.isLogin,userController.logOut)
user_route.get('/viewprofile',auth.isLogin,userController.loadProfile)
user_route.get('/editprofile',auth.isLogin,userController.loadeditProfile)
user_route.post('/editprofile', upload.single('image'),userController.editProfile);
user_route.get('/userProfile',auth.isLogin,userController.loaduserProfile)
user_route.get('/cart',auth.isLogin,cartController.loadCart)


module.exports = user_route;