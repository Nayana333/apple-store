const express=require("express");
const config=require("../config/config");
const admin_route=express();
const session=require("express-session");

admin_route.use(session({
  secret: config.sessionSecret,
  resave: false, 
  saveUninitialized: true, 
}));



const fs = require('fs');

//category////////////////////////////////////////////////////////////////////////////////


const bodyParser=require("body-parser");
const path = require("path");
const multer = require("multer");
const categoryImageStorage = multer.diskStorage({destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/categoryImages'));
  },
  filename: function (req, file, cb) {
    const name = Date.now() + '-' + file.originalname;
    cb(null, name);
  }
});


//product multer/////////////////////////////////////////////////////////////////////////


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
 
    
    cb(null, path.join(__dirname, '../public/productImages'));
  },
  filename: function (req, file, cb) {
    const name = Date.now() + '_' + file.originalname;
    cb(null, name);
  },
});

// Create the Multer instance
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }

});

//banner multer//////////////////////////////////////////////////////////////////////

const bannerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../public/bannerImages');

    
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const name = Date.now() + '_' + file.originalname;
    cb(null, name);
  }
});

const bannerUpload = multer({ storage: bannerStorage });



//controller////////////////////////////////////////////////////////////////////////



const uploads= multer({ storage: categoryImageStorage });
admin_route.use(bodyParser.json());
admin_route.use(bodyParser.urlencoded({extended:true}));
admin_route .set('view engine','ejs');
admin_route.set('views', './views/admin');
admin_route.use(express.static('public'))
admin_route.use(express.static(__dirname + "/public"))
admin_route.use("/public", express.static("public", { "extensions":["js"]}));
admin_route.set('views','./views/admin')
const auth=require('../middleware/adminAuth');
const adminController=require("../controller/adminController");
const categoryController=require("../controller/categoryController");
const productController=require("../controller/productController");
const orderController=require("../controller/orderController");
const checkoutController=require('../controller/checkoutController')
const couponController=require('../controller/couponController')
const excelController=require('../controller/excelController')
const  bannerController=require('../controller/bannerController')

// admin////////////////////////////////////////////////////


admin_route.get('/',auth.isLogout,adminController.loadLogin);
admin_route.post('/',auth.isLogout,adminController.verifyLogin);
admin_route.get('/logout',auth.isLogin,adminController.logOut)
admin_route.get('/adminhome',auth.isLogin,adminController.loadDashboard);
admin_route.get('/dashboard',auth.isLogin,adminController.adminDashboard);

// user////////////////////////////////////////////////////////

admin_route.get('/unblockUser',auth.isLogin,adminController.unblockUser);
admin_route.get('/userDetails',auth.isLogin,adminController.loadUser);

//  category//////////////////////////////////////////////////


admin_route.get('/new-category',auth.isLogin,categoryController.newCategoryLoad);
admin_route.post('/new-category',auth.isLogin,uploads.single('image'),categoryController.addCategory);
admin_route.get('/viewCategory',auth.isLogin,categoryController.loadCategory)
admin_route.get('/unlistCategory',auth.isLogin,categoryController.unlistCategory)
admin_route.get('/editCategory',auth.isLogin,categoryController.editCategory);
admin_route.post('/editCategory', uploads.single('image'),categoryController.updateCategory);

//  product////////////////////////////////////////////////////////


admin_route.get('/new-product',auth.isLogin,productController.newProductLoad);
admin_route.post('/new-product',upload.array('productImages', 4),productController.insertProduct);
admin_route.get('/viewProduct',auth.isLogin,productController.loadProduct)
admin_route.get('/editProduct',auth.isLogin,productController.editProduct)
admin_route.post('/editProduct',upload.array('productImages', 4),productController.updateProduct);
admin_route.get('/unlistProduct', auth.isLogin,productController.unlistProduct);
admin_route.get('/productDetails',auth.isLogin,productController.productDetails);

//Order/////////////////////////////////////////////////////////////

admin_route.get('/orderlist',auth.isLogin,orderController.orderList);
admin_route.get('/orderDetailsAdmin',auth.isLogin,orderController.orderDetailsAdmin)
admin_route.get('/cancelOrderAdmin/:orderId',auth.isLogin,orderController.cancelOrderAdmin)
admin_route.get('/setStatus',auth.isLogin,checkoutController.setStatus)




//coupon////////////////////////////////////////////////////////////////////

admin_route.get('/new-coupon',auth.isLogin,couponController.loadNewCoupon)
admin_route.post('/addCoupon',auth.isLogin,couponController.addCoupon)
admin_route.get('/viewCoupon',auth.isLogin,couponController.loadCoupon)
admin_route.get('/editCoupon',auth.isLogin,couponController.editCoupon)
admin_route.post('/editCoupon',auth.isLogin,couponController.updateCoupon)
admin_route.get('/unlistCoupon', auth.isLogin,couponController.unlistCoupon);


// Sales//////////////////////////////////////////////////////////////////////

admin_route.get('/getSalesReport',auth.isLogin,adminController.getSalesReport)
admin_route.get('/excelsalesreport',auth.isLogin,excelController.getExcelSalesReport)



//Banner///////////////////////////////////////////////////////////////////////////


admin_route.get('/loadAddBanner',auth.isLogin,bannerController.loadAddBanner)
admin_route.post('/loadAddBanner', bannerUpload.single('image'),bannerController.addBanner);
admin_route.get('/viewBanner',auth.isLogin,bannerController.loadBannerList)
admin_route.get('/unlistBanner',auth.isLogin,bannerController.unlistBanner)
admin_route.get('/editBanner',auth.isLogin,bannerController.loadEditBanner)
admin_route.post('/editBanner', bannerUpload.single('image'),bannerController.editBanner);



module.exports = admin_route