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


// const addBanner=async(req,res)=>{
//     try{
//         const productData=await Product.find({})
//         const categoryData=await Category.find({})
//         const admin=req.session.adminData
//         const{bannerType,title,link,description,offer,subtitle,category,product,startDate,endDate}=req.body;

//         if(!req.file){
//             console.log(error);
//             return res.render('banner-add',{admin:admin,message:"Banner Image is required",product:productData,category:categoryData})

//         }
//         const image=req.file.filename;

//         const newBanner=new Banner({
        
//             image,
//             bannerType,
//             title,
//             link,
//             description,
//             offer,
//             subtitle,
//             category,
//             product,
//             startDate,
//             endDate,
//             subtitle,
            

//         });

//         await newBanner.save();

//         return res.render('banner-add',{admin:admin,message :"banner added Successfully",product:productData,category:categoryData});

//     }catch(error){
//         console.log(error);

//         const admin=req.session.adminData;
//         const productData=await Product.find({})
//         const categoryData=await Category.find({})
//         console.log('error in add banner');

//         return res.render('banner-add',{admin:admin,error:'An error ocuured while adding the banner',product:productData,category:categoryData,})
//     }
// };





// Multer setup for handling file upload



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

    const image = req.file.filename; // Assuming `req.file` contains the uploaded image

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
      // Add any other fields according to your schema
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

        const banner=await Banner.findById(bannerId).populate('product');
    const category=await Category.find({})
    const admin=req.session.adminData;
    const product=await Product.find({})
    const startDate=new Date(banner.startDate).toISOString().split('T')[0];
    const endDate=new Date(banner.endDate).toISOString().split('T')[0];
    res.render('banner-edit',{banner,admin,product,category,startDate,endDate});
    }catch(error){
        console.log(error.message);
    }
}

const editBanner=async(req,res)=>{
    try{
        const id=req.query.id
        const bannerToUpdate=await Banner.findById(id);

        if(!bannerToUpdate){
            return res.render('banner=edit',{error : 'Banner not found'})
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

        if(req.body.file){
            bannerToUpdate.image=req.file.filename;

        }
        await bannerToUpdate.save();
        return res.redirect('/admin/banner-list');
   
    }catch(error){
        console.log(error.message);
    }
}



const loadBannerList=async(req,res)=>{
    try{
        const admin=req.session.adminData;
        const page=parseInt(req.query.page) || 1;
        const perPage=5;

        const totalBannersCount=await Banner.countDocumenets();
        const totalPages=Math.ceil(totalBannersCount/page);
        const skip=(page-1) *perPage;

        const banner=await Banner.find().populate('product').skip(skip).limit(perPage);
        res.render(banner-list,{banner,admin,totalPages,currentPages:page});
    }catch(error){
        console.log(error.message);
    }

}



const unlistBanner=async(req,res)=>{
    try{
        const id=req.query.id;

        const banner=await Banner.findById(id);
        banner.isListed=!banner.isListed;
        await banner.save();
        res.redirect('/admin/banner-list');
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