const express=require("express");
const config=require("../config/config");
const admin_route=express();
const session=require("express-session");

admin_route.use(session({
  secret: config.sessionSecret,
  resave: false, // Set resave to false
  saveUninitialized: true, // Set saveUninitialized to true or false based on your needs
}));

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

admin_route.get('/orderlist',auth.isLogin,orderController.loadOrderlist);
admin_route.get('/orderDetails',auth.isLogin,orderController.loadOrderdetails);


module.exports = admin_route;