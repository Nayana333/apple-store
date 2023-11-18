const User=require("../models/userModel");
const Product=require("../models/productModel");


const newProductLoad= async(req,res)=>{
    try{

        res.render('new-product');

    }catch(error){
        console.log(error.message)
    }
}
const insertProduct = async(req,res)=>{
    try {
        try {
         
            const existingProduct = await Product.findOne({ name: req.body.name });
          
            if (existingProduct) {
                return res.render('new-product', { message: "Product already exists" });
            }
          
     
            const newProduct = {};
          
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
            return res.render('new-product', { message: " Product added successfully" });
          } catch (error) {
           
            res.render('new-product', { error: error.message });
          }
          

        
    } catch (error) {
        console.log(error.message);

}
}



const loadProduct = async (req, res) => {
    try {
        var page = 1;
        var search = '';
        if (req.query.search) {
            search = req.query.search;
            console.log(search);
        }
        

        const adminData = await Product.find({
            $or:[
                { name:{$regex:'.*'+search+'.*',$options:'i'}},
                { category:{$regex:'.*'+search+'.*',$options:'i'}},
                { discountPrize:{$regex:'.*'+search+'.*',$options:'i'}},
                
            ]
          
        });
        res.render('viewProduct', {product: adminData });

    } catch (error) {
        console.log(error.message);
    }
}
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
        
        const id=req.query.id;
        const userData=await Product.findById({_id:id})
        
        if(userData){
            res.render('aboutProduct',{product:userData});
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

