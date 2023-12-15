const Coupon=require('../models/couponModel')
const User=require('../models/userModel')

const loadNewCoupon=async(req,res)=>{
    try{
        res.render('new-coupon')
    }catch(error){
        console.log(error.message);
    }
}

const addCoupon = async (req, res) => {
    let { couponCode, discount, expiryDate, limit, discountType, maxRedeemableAmt, minCartAmt } = req.body;

    try {
        if (!couponCode) {
            return res.render('new-coupon', { message: "coupon code cannot be empty" });
        }

        const existingCoupon = await Coupon.findOne({ code: new RegExp('^' + couponCode, 'i') });
        if (existingCoupon) {
            return res.render('new-coupon', { message: "coupon code already exists" });
        }

        const newCoupon = new Coupon({
            code: couponCode,
            discount: discount,
            limit: limit,
            type: discountType,
            expiry: expiryDate,
            maxRedeemableAmt: maxRedeemableAmt,
            minCartAmt: minCartAmt
        });
        console.log(newCoupon);

        await newCoupon.save();
        res.render('new-coupon',{message:"coupon added successfully"});
    } catch (err) {
        console.log("error adding coupon", err);
        res.status(500).send("error adding coupon");
    }
};

// const loadCoupon=async(req,res)=>{
//           try{
              

//              const coupon =await Coupon.find({});
        
        
//               res.render('viewCoupon',{coupon})
      
      
//           }catch(error){
//               console.log(error.message)
//           }
//       }
const loadCoupon = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; 
    const limitPerPage = 5; 

    const totalCoupons = await Coupon.countDocuments({});
    const totalPages = Math.ceil(totalCoupons / limitPerPage);
    

    const coupon = await Coupon.find({})
    .sort({expiry:1 })
      .skip((page - 1) * limitPerPage)
      .limit(limitPerPage);

    res.render('viewCoupon', { coupon, totalPages, currentPage: page });
  } catch (error) {
    console.log(error.message);
    
    res.status(500).send('Internal Server Error');
  }
};



      const editCoupon=async(req,res)=>{
        try{
            const id=req.query.id;
            const couponData=await Coupon.findById({_id:id})
         
            if(couponData){
                res.render('editCoupon',{coupon:couponData});
            }
            else{
            res.redirect('/admin/editCoupon');
    
        }}catch(error){
            console.log(error.message)
        }
    }

    const updateCoupon= async (req, res) => {
        try {
           
            const couponId = req.query._id 
            
      
      
            const coupon = await Coupon.findById(couponId);
         
            
      
            if (!coupon) {
             
                return res.render('editCoupon', { message: "coupon not founf",coupon:coupon});
            }
      
            
            const updateFields = {
               code: req.body.couponCode,
                discount: req.body.discount,
                limit: req.body.limit,
                minCartAmt:req.body.minCartAmt,
                maxRedeemableAmt: req.body.maxRedeemableAmt,
                expiry: new Date(req.body.expiryDate)
                
            };
      
       
            await Coupon.findByIdAndUpdate(couponId, { $set: updateFields });
      
            res.redirect('/admin/viewCoupon');
        } catch (error) {
            console.log(error.message);
      
      }
      }
    
    

    const unlistCoupon = async (req, res) => {
        try {
            const admin=  req.session.adminData
            const id = req.query.id;
      
      
            const coupon= await Coupon.findById(id);
      
            coupon.isListed = !coupon.isListed;
      
      
            await coupon.save();
      
            res.status(200).json({message:"succcess"})
        } catch (error) {
            console.log(error.message);
      
        }
      }


      const deleteCoupon= async(req,res)=>{

        try {
            
            const  couponId = req.query.couponId;

            if (couponId) {
                await Coupon.deleteOne({_id: couponId})
            res.status(200).json({message:'success'});
            } else {
                res.status(404).json({message:'success'});
            }
            
            const userId = req.query.userId;
            
                  
            
        } catch (error) {
            console.log(error.message);
            
        }
      
      
      };
    



module.exports={
    loadNewCoupon,
    addCoupon,
    loadCoupon,
    editCoupon,
    updateCoupon,
    unlistCoupon,
    deleteCoupon
}