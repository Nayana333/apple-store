const Discount=require('../models/discountModel')
const Product=require('../models/productModel')
const Category=require('../models/categoryModel')







const loadOfferList = async (req, res) => {
  try {
    const admin = req.session.adminData;
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const totalOffersCount = await Discount.countDocuments();
    const totalPages = Math.ceil(totalOffersCount / limit);

    if (page < 1 || page > totalPages) {
      return res.status(404).json({ error: 'Page not found' });
    }

    const skip = (page - 1) * limit;

    const offer = await Discount.find()
      .populate({ path: 'discountedProduct', model: 'Product' })
      .skip(skip)
      .limit(limit).sort({endDate:1});

    res.render('offer-list', {
      offer,
      admin,
      totalPages,
      currentPage: page
    });

  } catch (error) {
    console.error('Error fetching offer list:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};




const loadAddOffer=async(req,res)=>{
    try{
    const admin=req.session.adminData;
    const product=await Product.find({})
    const categoryData=await Category.find({})

    res.render('new-offer',{admin:admin,product:product,category:categoryData})
}catch(error){
    console.log(error);
}
}


const addOffer = async (req, res) => {
  console.log(req.body);
  

    const admin = req.session.adminData;
    const product = await Product.find({});
    const categoryData = await Category.find({});
  
    try {
      const {
        name,
        discountType,
        discountValue,
        maxRedeemableAmt,
        startDate,
        endDate,
        discountedProduct,
       
      } = req.body;
      
     console.log(req.body);
  
      const existingNameOffer = await Discount.findOne({ name });
      const existingProductOffer = await Discount.findOne({ discountedProduct });

      if (existingNameOffer) {
        return res.render('new-offer', { admin, product, category: categoryData, message: 'Duplicate Discount Name not allowed.' });
      }
  
      
  
      if (discountedProduct && existingProductOffer) {
        return res.render('new-offer', { admin, product, category: categoryData, message: 'An offer for this product already exists.' });
      }
  
      const newOffer = new Discount({
        name,
        discountType,
        discountValue,
        maxRedeemableAmt,
        startDate,
        endDate,
        discountedProduct,
       
      });

      await newOffer.save();
 
      
       

      if (discountedProduct) {
        const discountedProductData = await Product.findById(discountedProduct);
  
        let discount = 0;
        if (discountType ==='percentage') {
          discount = (discountedProductData.price * discountValue) / 100;
        } else if (discountType === 'fixed Amount') {
          discount = discountValue;
        }
  
        await Product.updateOne(
          { _id: discountedProduct },
          {
            $set: {
              discountPrice: calculateDiscountPrice(
                discountedProductData.price,
                discountType,
                discountValue
              ),
              discount,
              startDate,
              endDate,
              discount: discount,
              discountStatus:true
            },
          }
        );
      } 
  
      res.redirect('/admin/loadOfferList');
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  function calculateDiscountPrice(originalPrice, discountType, discountValue) {
    if (discountType === 'fixed Amount') {

      return originalPrice - discountValue;
    } else if (discountType === 'percentage') {

      const discountAmount = (originalPrice * discountValue) / 100;
      return originalPrice - discountAmount;
    } else {

      throw new Error('Invalid discount type');
    }
  };
  const loadEditOffer = async (req, res) => {
    try {
      const admin = req.session.adminData;
      const product = await Product.find({});
      const categorydata = await Category.find({});
      const id = req.query.id;
  
     
      const offer = await Discount.findById(id).populate({ path: 'discountedProduct', model: 'Product' });
  
      const startDate = new Date(offer.startDate).toDateString().split('T')[0];
      const endDate = new Date(offer.endDate).toISOString().split('T')[0];
  
      res.render('edit-offer', { admin, product, category: categorydata, offer, startDate, endDate });
  
    } catch (error) {
      console.log(error);
     
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  const editOffer=async(req,res)=>{
    try{
      const admin=req.session.admindata;
      const product=await Product.find({});
      const categoryData=await Category.find({});
      const{
        name,
        discountType,
        discountValue,
        maxRedeemableAmt,
        startDate,
        endDate,
        discountedProduct
      }=req.body;

      const offerId=req.query.id;
      console.log(offerId);
      const existingOffer=await Discount.findById(offerId);
      if(!existingOffer){
         res.status(500).json({ error:"product error" });
      }
      if(name !==existingOffer.name){
        const existingNameOffer=await Discount.findOne({name});
        if(existingNameOffer){
          return res.render('edit-offer',{
            offer:null,
            admin,
            product,
            category:categoryData,
            message:'duplicate discount name not allowed'

          });
        }
      }
      existingOffer.name=name;
      existingOffer.discountType=discountType;
      existingOffer.discountValue=discountValue;
      existingOffer.maxRedeemableAmt=maxRedeemableAmt;
      existingOffer.startDate=startDate;
      existingOffer.endDate=endDate;
      existingOffer.discountedProduct=discountedProduct;
      await existingOffer.save();

      if(discountedProduct){
        const discountedProductData=await Product.findById(discountedProduct);
        let discount=0;
        if(discountType==='percentage'){
          discount=(discountedProductData.price * discountValue)/100;

        }else{
          discount=discountValue;
        }
        await Product.updateOne({_id:discountedProduct},{
          $set:{
            discountPrice:calculateDiscountPrice(discountedProductData.price,discountType,discountValue),
            discount,startDate,endDate,discount:discount,
            discountStatus:true
          }
        });
      }
      res.redirect('/admin/loadOfferList');
    }catch(error){
      console.log(error);
    }
  }

const unlisOffer=async(req,res)=>{
  try{
    const id=req.query.id;
    const offer=await Discount.findById(id);
    offer.isActive=!offer.isActive;

    if(offer.discountedProduct){
      const discountedProduct=await Product.findById(offer.discountedProduct);
      if(discountedProduct){
        discountedProduct.discountStatus=!discountedProduct.discountStatus;
        await discountedProduct.save();
      }
    }

    await offer.save();

    res.redirect('/admin/loadOfferList')
  }catch(error){
    console.log(error.message);
  }
}



module.exports={
    loadOfferList,
    loadAddOffer,
    addOffer,
    loadEditOffer,
    editOffer,
    unlisOffer
}