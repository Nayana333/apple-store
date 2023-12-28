const User = require("../models/userModel");
const Product = require("../models/productModel");
const Category = require('../models/categoryModel');
const { v4: uuidv4 } = require('uuid');
const sharp=require('sharp')
const path = require('path');
const tinycolor=require('tinycolor2');




const newProductLoad = async (req, res) => {
  try {
    const categories = await Category.find({})

    res.render('new-product', { categories });

  } catch (error) {
    console.log(error.message)
  }
}



const insertProduct = async (req, res) => {
 
  console.log(req.body.productColor);
  

  const categories = await Category.find();

  try {
    const existingProduct = await Product.findOne({ name: req.body.name });
    if (existingProduct) {
      return res.render('new-product', {
        message: 'Product already exists',
        category: categories,
      });
    }
    const newProduct = {
      p_id: uuidv4().split('-')[0].substring(0, 6),
      name: req.body.name,
      category: req.body.category,
      price: req.body.price,
      discountPrice: req.body.discountPrice,
      quantity: req.body.quantity,
      battery: req.body.battery,
      productColor: req.body.productColor,
      ram: req.body.ram,
      rom: req.body.rom,
      expandable: req.body.expandable,
      frontCam: req.body.frontCam,
      rearCam: req.body.rearCam,
      processor: req.body.processor,
      
      productImages: [], 
    };

    

    if (req.files) {
      for (let i = 1; i <= 4; i++) {
        const fieldName = `image${i}`;
       
        if (req.files[fieldName]) {
          const file = req.files[fieldName][0];

          const image = sharp(file.path);
          const metadata = await image.metadata();
          const { width, height } = metadata;
          const aspectRatio = width / height;
          const targetSize = { width: 679, height: 679 };

          if (width > targetSize.width || height > targetSize.height) {
            image.resize({ width: targetSize.width, height: targetSize.height, fit: 'cover' });
          } else {
            image.resize(targetSize.width, targetSize.height);
          }
         

          const tempFilename = `${file.filename.replace(/\.\w+$/, '')}_${Date.now()}.jpg`;
          const resizedImagePath = path.join(__dirname, '../public/productImages', tempFilename);

          await image.toFile(resizedImagePath);

          newProduct.productImages.push(tempFilename);
        }
      }
    }

    const savedProduct = await new Product(newProduct).save();
    return res.render('new-product', { message: 'Product added successfully', categories });
  } catch (error) {
    console.error('Error occurred while adding product:', error);
    res.render('new-product', { error: error.message, categories });
  }
};

const loadProduct = async (req, res) => {
  try {
    let query = {};


    if (req.query.filterBy) {
      const filterValue = req.query.filterBy;

      if (filterValue === 'listed') {
        query.list = true;
      } else if (filterValue === 'unlisted') {
        query.list = false;
      }
    }

    if (req.query.search) {
      const search = req.query.search.trim();
      const parsedSearch = parseFloat(search);

      query.$or = [
        { name: { $regex: new RegExp(search, 'i') } },
        { category: { $regex: new RegExp(search, 'i') } },
      ];

      if (!isNaN(parsedSearch)) {
        query.$or.push({ price: { $gte: parsedSearch } });
      }
    }

    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    const adminData = await Product.find(query)
      .skip(skip)
      .limit(limit);

    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limit);

    res.render('viewProduct', {
      product: adminData,
      totalPages: totalPages,
      currentPage: page,
      search: req.query.search || '',
      filterBy: req.query.filterBy || '',
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Error fetching products');
  }
};






const editProduct = async (req, res) => {
  try {
    const id = req.query.id;
    const categories = await Category.find()
    const adminData = await Product.findById({ _id: id })
    if (adminData) {
      res.render('edit-product', { product: adminData, categories });
    }
    else {
      res.redirect('/admin/dashboard');

    }
  } catch (error) {
    console.log(error.message)
  }
}


const updateProduct = async (req, res) => {
  try {
    const category = await Category.find(); 
    console.log(tinycolor(req.body.productColor).toName());
   
    const productId = req.query._id;
    const product = await Product.findById(productId);
    if (!product) {
      return res.render('edit-product', { message: "Product not found", product, category });
    }

    const updateFields = {
      name: req.body.name,
      category: req.body.category,
      price: req.body.price,
      discountPrice: req.body.discountPrice,
      battery: req.body.battery,
      productColor: tinycolor(req.body.productColor).toName(),
      ram: req.body.ram,
      rom: req.body.rom,
      expandable: req.body.expandable,
      frontCam: req.body.frontCam,
      rearCam: req.body.rearCam,
      processor:req.body.processor
    };

    if (req.files) {
      for (let i = 1; i <= 4; i++) {
        const fieldName = `image${i}`;
        if (req.files[fieldName]) {
          const file = req.files[fieldName][0];
          const image = sharp(file.path);
          const metadata = await image.metadata();
          const { width, height } = metadata;
          const aspectRatio = width / height;
          const targetSize = { width: 679, height: 679 };

          if (width > targetSize.width || height > targetSize.height) {
            image.resize({ width: targetSize.width, height: targetSize.height, fit: 'cover' });
          } else {
            image.resize(targetSize.width, targetSize.height);
          }

          const tempFilename = `${file.filename.replace(/\.\w+$/, '')}_${Date.now()}.jpg`;
          const resizedImagePath = path.join(__dirname, '../public/productImages', tempFilename);

          await image.toFile(resizedImagePath);
          product.productImages[i - 1] = tempFilename;
        }
      }
      await product.save();  
    }

    await Product.findByIdAndUpdate(productId, { $set: updateFields });
    res.redirect('/admin/viewProduct');

  } catch (error) {
    console.log(error.message);
    res.status(500).send('Internal Server Error');
  }
};



const unlistProduct = async (req, res) => {
  try {

    const id = req.query.id;

    const product = await Product.findById(id);
    product.list = !product.list;
    await product.save();

    res.status(200).json({ message: 'success' })
  } catch (error) {
    console.log(error.message);

  }
};


const productDetails = async (req, res) => {
  try {
    const id = req.query.id;
    const adminData = await Product.findById({ _id: id })
    if (adminData) {
      res.render('productDetail', { product: adminData });
    }
    else {
      res.redirect('/admin/productDetail');

    }
  } catch (error) {
    console.log(error.message)
  }
}


const productpageLOad = async (req, res) => {
  try {
    const userId = req.session.user_id
    const user = await User.findById(userId)
    const id = req.query.id;
    const userData = await Product.findById({ _id: id })

    if (userData) {
      res.render('aboutProduct', { product: userData, user });
    }
    else {
      res.redirect('/admin/aboutProduct');

    }
  } catch (error) {
    console.log(error.message)
  }
}



module.exports = {
  insertProduct,
  newProductLoad,
  loadProduct,
  editProduct,
  updateProduct,
  unlistProduct,
  productDetails,
  productpageLOad

}

