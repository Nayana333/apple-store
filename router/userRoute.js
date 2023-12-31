const express = require("express");
const user_route = express();
//CONTROLLER//////////////////////////////////////////////////////////////

const userController = require("../controller/userController");
const productController=require("../controller/productController");
const cartController=require("../controller/cartController");
const checkoutController=require("../controller/checkoutController");
const wishlistController=require("../controller/wishlistController");
const orderController=require("../controller/orderController");
const addressController=require("../controller/addressController");
const pdfController=require("../controller/pdfController");


/////////////////////////////////////////////////////////////////////////

const session=require("express-session")
const config=require("../config/config")
user_route.use(session({
   secret: config.sessionSecret,
   resave: false, 
   saveUninitialized: true, 
}));

const auth=require('../middleware/auth')


user_route.set('view engine', 'ejs');


user_route.set('views', './views/user');
user_route.use(express.static('public'))
user_route.use(express.static(__dirname + "/public"))
user_route.use("/public", express.static("public", { "extensions":["js"]}));
const bodyParser=require('body-parser');
user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({extended:true}))

//USERMULTER//////////////////////////////////////////////////////////////

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



//GET////////////////////////////////////////////////////////////


user_route.get('/registration', userController.loadRegister);
user_route.get('/',userController.loadHome);
user_route.get('/login',userController.loginLoad);
user_route.get('/otp-page',userController.loadOTPpage);
user_route.get('/logout',auth.isLogin,userController.userLogout);
user_route.get('/product',userController.product);
user_route.get('/aboutProduct',productController.productpageLOad)
user_route.get('/contact',userController.loadContact)
user_route.get('/userhome',auth.isUserBlocked,userController.loadHome)
user_route.get('/logout',auth.isLogin,userController.logOut)
user_route.get('/viewprofile',auth.isLogin,userController.loadProfile)
user_route.get('/editprofile',auth.isLogin,userController.loadeditProfile)
user_route.get('/cart',auth.isLogin,cartController.loadCart)
user_route.get('/checkout',auth.isLogin,checkoutController.loadCheckout)
user_route.get('/wishlist',auth.isLogin,wishlistController.loadWishlist)
user_route.get('/addtoWishlist/:productId',auth.isLogin,wishlistController.addtoWishlist)
user_route.get('/userOrderdetails',auth.isLogin,orderController.loadOrderdetailsuser)
user_route.get('/getwishlist',auth.isLogin,wishlistController.addtoWishlist)
user_route.get('/removeWishlist/:productId',auth.isLogin,wishlistController.removeWishlist)
user_route.get('/removeCart/:productId',auth.isLogin,cartController.removeCart)
user_route.get('/addAddress',auth.isLogin,addressController.loaduserProfile)
user_route.get('/addAddresscheckOut',auth.isLogin,addressController.loadAddAddresscheckOut)
user_route.get('/orderPlaced',auth.isLogin,orderController.orderPlaced)
user_route.get('/orderDetails',auth.isLogin,orderController.orderDetails)
user_route.get('/cancelOrder/:orderId',auth.isLogin,orderController.cancelOrder)
user_route.get('/emptyCart',auth.isLogin,cartController.emptyCart)
user_route.get('/emptyWishlist',auth.isLogin,wishlistController.emptywishlist)
user_route.get('/generate-invoice/:orderId',auth.isLogin,pdfController.generateInvoice)
user_route.get('/deleteAddress',auth.isLogin,addressController.deleteAddress)
user_route.get('/resendotp-page',userController.loadresendOTPpage);''
user_route.get('/forgotEmail',auth.isLogout,userController.getForgotEmail)
user_route.get('/forgotOtp',auth.isLogout,userController.getForgotOtp)
user_route.get('/ForgotpswSet',auth.isLogout,userController.getForgotpswset)





//POST///////////////////////////////////////////////////////////////////////////


user_route.post('/registration', upload.single('image'),userController.insertUser);
user_route.post('/login',userController.varifyLogin);
user_route.post('/otp-page',userController.OTPVerification);
user_route.post('/editprofile', upload.single('image'),userController.editProfile);
user_route.post('/addtoCart/:productId',auth.isLogin,cartController.addtoCart)
user_route.put('/updateCart/', cartController.updateCart);
user_route.put('/updateCart',cartController.updateCartCount)
user_route.post('/postAddress',auth.isLogin,addressController.postAddress)
user_route.post('/postAddresscheckOut',auth.isLogin,addressController.postAddresscheckOut)
user_route.post('/cashondelivery',auth.isLogin,checkoutController.cashOnDelivery)
user_route.post('/walletPayment',auth.isLogin,checkoutController.walletPayment)
user_route.post('/applyCoupon',auth.isLogin,checkoutController.applyCoupon)
user_route.post('/updatePaymentStatus',checkoutController.updatePaymentStatus)
user_route.post('/razorpayOrder',checkoutController.razorpayOrder)
user_route.post('/returnOrder',auth.isLogin,checkoutController.returnOrder)
user_route.post('/resendotp-page',userController.OTPVerification);
user_route.post('/forgotEmail',auth.isLogout,userController.postForgotEmail)
user_route.post('/forgotOTP',auth.isLogout,userController.verifyForgotOTP)
user_route.post('/ForgotpswSet',auth.isLogout,userController.passwordSet)






/////////////////////////////////////////////////////////////////////////////////////

module.exports = user_route;