const User = require('../models/userModel');
const Product=require("../models/productModel");
const Category=require("../models/categoryModel");
const Wishlist=require("../models/wishlistModel")




        const addtoWishlist = async (req, res) => {
            const userId = req.session.user_id;
            console.log(userId);
            const productId = req.params.productId;
            console.log(productId);
            const productData= await Product.find({});
        
    
            try {
              const user=await User.findById(userId)
              let userWishlist = await Wishlist.findOne({ user: userId });
          
              if (!userWishlist) {
                userWishlist = new Wishlist({
                  user: userId,
                  items: [{ product: productId }],
                });
              } else {
                const existingWishlistItem = userWishlist.items.find(
                  (item) => item.product.toString() === productId
                );
          
                if (existingWishlistItem) {
             
                  res.render('productpage', {product: productData ,user,message: 'product is already on your wishlist'})

                } else {
                  userWishlist.items.push({ product: productId });
                }
              }
          
              await userWishlist.save();
              // res.render('productpage', {product: productData,user })
              res.redirect('/product')
            } catch (error) {
              console.log(error.message);
            }
          };
          const loadWishlist = async (req, res) => {
            const cartData=req.session.cartData
            const userId = req.session.user_id;
            const data=await User.findById(userId)
        
            try {
                const userWishlist = await Wishlist.findOne({ user: userId }).populate('items.product');
        
                const wishlist = userWishlist ? userWishlist.items : [];
                if(wishlist.length === 0){
                  res.redirect('/emptyWishlist');
                } else {
              
                res.render('wishlist', { user:data, wishlist,cartData });
                }
            } catch (err) {
                console.error('Error fetching user wishlist:', err);
        
        }
        };
        

        const removeWishlist = async (req, res) => {
          const userId = req.session.user_id;
          const productId = req.params.productId;
          try{
            const userWishlist=await Wishlist.findOne({user:userId});
            if(!userWishlist){
              // res.render('wishlist',{message:"wishlist not found"})
              res.send("whishlist error one")
            }
            const wishlistItemIndex = userWishlist.items.findIndex((item) => item.product.toString() === productId);
            
            userWishlist.items.splice(wishlistItemIndex , 1);
            await userWishlist.save();
            res.redirect('/wishlist');
           
          }catch(error){
            console.log(error.message);
          }
          
        };

      
const emptywishlist=async(req,res)=>{
  try{
    const user=req.session.user_id;
    res.render('emptyWishlist',{user})
  }catch(error){
    console.log(error.message);
  }
}


module.exports={
    loadWishlist,
    addtoWishlist,
    removeWishlist,
    emptywishlist

   
   
}
