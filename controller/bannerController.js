const Product=require('../models/productModel')
const Category=require('../models/categoryModel')
const Banner=require('../models/bannerModel')
const multer = require('multer');
const path = require('path');

const loadAddBanner=async(req,res)=>{
    const admin=req.session.adminData
    const product = await Product.find({})
    const categoryData = await Category.find({})
  
    res.render('banner-add',{admin:admin,product:product,category:categoryData})
};


const addBanner = async (req, res) => {
  try {
    const productData = await Product.find({});
    const categoryData = await Category.find({});
    const admin = req.session.adminData;

    const {
      bannerType,
      title,
      link,
      description,
      offer,
      subtitle,
      category,
      product,
      startDate,
      endDate,
    } = req.body;

    const image = req.file.filename; 

    const newBanner = new Banner({
      image,
      bannerType,
      title,
      link,
      description,
      offer,
      subtitle,
      category,
      product,
      startDate,
      endDate,
     
    });

    await newBanner.save();

    return res.render('banner-add', {
      admin: admin,
      message: 'Banner added Successfully',
      product: productData,
      category: categoryData,
    });
  } catch (error) {
    console.error(error);
    const admin = req.session.adminData;
    const productData = await Product.find({});
    const categoryData = await Category.find({});
    return res.render('banner-add', {
      admin: admin,
      error: 'An error occurred while adding the banner',
      product: productData,
      category: categoryData,
    });
  }
};




const loadEditBanner=async(req,res)=>{
    try{
        const bannerId=req.query.id;

        const banner=await Banner.findById(bannerId).populate('product').populate('category');
    const category=await Category.find({})
    const admin=req.session.adminData;
    const product=await Product.find({})
    const startDate=new Date(banner.startDate).toISOString().split('T')[0];
    const endDate=new Date(banner.endDate).toISOString().split('T')[0];
    res.render('editBanner',{banner,admin,product,category,startDate,endDate});
    }catch(error){
        console.log(error.message);
    }
}

const editBanner=async(req,res)=>{
    try{
        const id=req.query._id
        console.log(id+'bannerid');
        const bannerToUpdate=await Banner.findById(id);
        console.log(bannerToUpdate+'bannertoupdate');

        if(!bannerToUpdate){
            return res.render('editBanner',{error : 'Banner not found',banner:bannerToUpdate})
        }
        if(req.body.bannerType){
            bannerToUpdate.bannerType=req.body.bannerType;

        }
        if(req.body.title){
            bannerToUpdate.title=req.body.title;

        }
        if(req.body.link){
            bannerToUpdate.link=req.body.link;

        }
        if(req.body.category){
            bannerToUpdate.category=req.body.category;

        }
        if(req.body.subTitle){
            bannerToUpdate.subtitle=req.body.subTitle;

        }
        if(req.body.product){
            bannerToUpdate.product=req.body.product;

        }
        if(req.body.startDate){
            bannerToUpdate.startDate=req.body.startDate;

        }
        if (req.body.endDate) {
            bannerToUpdate.endDate = req.body.endDate;
          }
        if(req.body.offer){
            bannerToUpdate.offer=req.body.offer;

        }

        if (req.file) {
            bannerToUpdate.image = req.file.filename;
        }
        
        await bannerToUpdate.save();
        return res.redirect('/admin/viewBanner');
   
    }catch(error){
        console.log(error.message);
    }
}



// const loadBannerList=async(req,res)=>{
//     try{
//         const admin=req.session.adminData;
//         const banner=await Banner.find().populate('product').populate('category');
//         console.log('banner'+banner);
//         res.render('viewBanner',{banner,admin});
//     }catch(error){
//         console.log(error.message);
//     }

// }



const loadBannerList = async (req, res) => {
    try {
        const admin = req.session.adminData;
        const page = parseInt(req.query.page) || 1;
        const perPage = 5; // Number of items per page

        const totalBanners = await Banner.countDocuments(); // Get the total number of banners

        const banners = await Banner.find()
            .populate('product')
            .populate('category')
            .skip((page - 1) * perPage) // Skip the specified number of documents for the current page
            .limit(perPage); // Limit the number of documents per page

        res.render('viewBanner', {
            banner: banners,
            admin,
            currentPage: page, // Pass the currentPage variable to the view
            totalPages: Math.ceil(totalBanners / perPage) // Calculate total pages
        });
    } catch (error) {
        console.log(error.message);
    }
};




// const loadBannerList = async (req, res) => {
//     try {
//         const admin = req.session.adminData;
//         let search = '';
//         if (req.query.search) {
//             search = req.query.search;
//         }

//         const page = parseInt(req.query.page) || 1;
//         const limit = 5;

//         const skip = (page - 1) * limit;

//         const query = {
//             $or: [
//                 { name: { $regex: '.*' + search + '.*', $options: 'i' } },
//                 { category: { $regex: '.*' + search + '.*', $options: 'i' } },
//                 { price: { $regex: '.*' + search + '.*', $options: 'i' } },
//             ],
//         };

//         const bannerData = await Banner.find(query)
//             .skip(skip)
//             .limit(limit)
//             .populate('product'); 
//         console.log(bannerData+'bannerData');
//         const totalBanner = await Banner.countDocuments(query);
//         const totalPages = Math.ceil(totalBanner / limit);

//         res.render('viewBanner', {
//             banner: bannerData, 
//             admin,
//             totalPages,
//             currentPage: page,
//             search, 
//         });
       
//     } catch (error) {
//         console.log(error.message);
//     }
// };



const unlistBanner=async(req,res)=>{
    try{
        const id=req.query.id;
        const banner=await Banner.findById(id);
        banner.isListed=!banner.isListed;
        await banner.save();
        res.status(200).json({message:"success"})
    }catch(error){
        console.log(error.message);
    }
}

module.exports={
    loadAddBanner,
    addBanner,
    loadEditBanner,
    editBanner,
    loadBannerList,
    unlistBanner

}