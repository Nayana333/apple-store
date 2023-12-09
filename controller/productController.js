const User=require("../models/userModel");
const Product=require("../models/productModel");
const Category=require('../models/categoryModel');
const { v4: uuidv4 } = require('uuid');



const newProductLoad= async(req,res)=>{
    try{
      const categories=await Category.find({})

        res.render('new-product',{categories});

    }catch(error){
        console.log(error.message)
    }
}
const insertProduct = async(req,res)=>{
    try {
        try {
          const categories= await Category.find({})
         
            const existingProduct = await Product.findOne({ name: req.body.name });
          
            if (existingProduct) {
                return res.render('new-product', { message: "Product already exists" });
            }
          
     
            const newProduct = {};

            newProduct.p_id= uuidv4().split('-')[0].substring(0, 6);
          
            if (req.body.name) {
              newProduct.name = req.body.name;
            }
            if (req.body.category) {
              newProduct.category = req.body.category;
            }
            if (req.body.price) {
              newProduct.price = req.body.price;
            }
            if (req.body.discountPrice) {
              newProduct.discountPrice = req.body.discountPrice;
            }
            if (req.body.quantity) {
              newProduct.quantity = req.body.quantity;
            }

            if (req.files && req.files.length > 0) {
                newProduct.productImages = req.files.map((file) =>file.filename);
              } 
          
            if (req.body.battery) {
              newProduct.battery = req.body.battery;
            }
            if (req.body.productColor) {
              newProduct.productColor = req.body.productColor;
            }
            if (req.body.ram) {
              newProduct.ram = req.body.ram;
            }
            if (req.body.rom) {
              newProduct.rom = req.body.rom;
            }
            if (req.body.expandable) {
              newProduct.expandable = req.body.expandable;
            }
            if (req.body.frontCam) {
              newProduct.frontCam = req.body.frontCam;
            }
            if (req.body.rearCam) {
              newProduct.rearCam = req.body.rearCam;
            }
            if (req.body.processor) {
              newProduct.processor = req.body.processor;
            }
          
            const savedProduct = await new Product(newProduct).save();
            return res.render('new-product',{categories, message: " Product added successfully" });
          } catch (error) {
           
            res.render('new-product', { error: error.message });
          }
          

        
    } catch (error) {
        console.log(error.message);

}
}



// const loadProduct = async (req, res) => {
//   try{
          
//     var search='';
//     if(req.query.search){
//         search=req.query.search;
       
//     }

//    const adminData =await Product.find({
//     $or:[
//       { name:{$regex:'.*'+search+'.*',$options:'i'}},
//         { category:{$regex:'.*'+search+'.*',$options:'i'}},
//         { price:{$regex:'.*'+search+'.*',$options:'i'}},
        
//     ]
   
// });
//       res.render('viewProduct', {product: adminData });

//   } catch (error) {
//       console.log(error.message);
//   }
// }

const loadProduct = async (req, res) => {
  try {
    var search = '';
    if (req.query.search) {
      search = req.query.search;
    }

    const page = parseInt(req.query.page) || 1; 
    const limit = 5; 

    const skip = (page - 1) * limit; 
    const parsedSearch = parseFloat(search);
const query = {
  $or: [
    { name: { $regex: '.*' + search + '.*', $options: 'i' } },
    { category: { $regex: '.*' + search + '.*', $options: 'i' } },
    !isNaN(parsedSearch) ? { price: { $gte: parsedSearch } } : {}, // Check if parsedSearch is a valid number
  ],
};
if (!isNaN(parsedSearch)) {
  query.$or.push({ price: parsedSearch });
}
    const adminData = await Product.find(query)
      .skip(skip) 
      .limit(limit);

    const totalProducts = await Product.countDocuments(query);

    const totalPages = Math.ceil(totalProducts / limit); 

    res.render('viewProduct', {
      product: adminData,
      totalPages: totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Error fetching products');
  }
};


// const loadProduct = async (req, res) => {
//   try {
//     var search = '';
//     if (req.query.search) {
//       search = req.query.search;
//     }

//     const adminData = await Product.find({
//       $or: [
//         { name: { $regex: '.*' + search + '.*', $options: 'i' } },
//         { category: { $regex: '.*' + search + '.*', $options: 'i' } },
      
//       ],
//     });
//     res.render('viewProduct', { product: adminData });

//   } catch (error) {
//     console.log(error.message);
//   }
// };

const editProduct=async(req,res)=>{
    try{
        const id=req.query.id;
        const adminData=await Product.findById({_id:id})
        if(adminData){
            res.render('edit-product',{product:adminData});
        }
        else{
        res.redirect('/admin/dashboard');

    }}catch(error){
        console.log(error.message)
    }
}


const updateProduct= async (req, res) => {
  try {
     
    const category=await Category.find
      const productId = req.query._id 
    
      const product= await Product.findById(productId);
      if (!product) {
          return res.render('edit-product', { message: "Product not found",product:product});
      }

      
      const updateFields = {
          name: req.body.name,
          category:req.body.category,
          price: req.body.price,
          discountPrice:req.body.discountPrice,
          battery:req.body.battery,
          productColor:req.body.productColor,
          ram:req.body.ram,
          rom:req.body.rom,
          expandable:req.body.expandable,
          frontCam:req.body.frontCam,
          rearCam:req.body.rearCam  
      };
      
      if (req.files && req.files.length > 0) {
        updateFields.productImages = req.files.map((file) =>file.filename);
      } 

 
      await Product.findByIdAndUpdate(productId, { $set: updateFields });

      res.redirect('/admin/viewProduct');
  } catch (error) {
      console.log(error.message);

}
}


const unlistProduct = async (req, res) => {
  try {
      const admin=  req.session.adminData
      const id = req.query.id;

      const product = await Product.findById(id);
      product.list = !product.list;
      await product.save();

      res.redirect('/admin/viewProduct');
  } catch (error) {
      console.log(error.message);

  }
};


const productDetails=async(req,res)=>{
  try{
      const id=req.query.id;
      const adminData=await Product.findById({_id:id})
      if(adminData){
          res.render('productDetail',{product:adminData});
      }
      else{
      res.redirect('/admin/productDetail');

  }}catch(error){
      console.log(error.message)
  }
}


const productpageLOad=async(req,res)=>{
    try{
       const userId=req.session.user_id
       const user=await User.findById(userId)
        const id=req.query.id;
        const userData=await Product.findById({_id:id})
        
        if(userData){
            res.render('aboutProduct',{product:userData,user});
        }
        else{
        res.redirect('/admin/aboutProduct');
  
    }}catch(error){
        console.log(error.message)
    }
  }


  
module.exports={
    insertProduct,
    newProductLoad,
    loadProduct,
    editProduct,
    updateProduct,
    unlistProduct,
    productDetails,
    productpageLOad

}

