const Cart=require("../models/cartModel");
const Wishlist=require("../models/wishlistModel");
const Product=require("../models/productModel");





const addtoCart=async(req,res)=>{
    userId=req.session.user_id;
   const productId=req.params.productId;
    console.log(productId)
    const {qty}=req.body
    console.log(qty);
    const productData= await Product.find({});
    try{
        const existingCart=await Cart.findOne({user:userId});
        let newCart={};
        if(existingCart){
            const existingCartItem = existingCart.items.find(item => item.product.toString() === productId);
            if(existingCartItem){
                existingCartItem.quantity += parseInt(qty);

            }
            else{
                existingCart.items.push({ product: productId, quantity: parseInt(qty) });

            }
            existingCart.total = existingCart.items.reduce((total, item) => total + (item.quantity || 0), 0);

            await existingCart.save()

        }
        else{
            newCart=new Cart({
                user:userId,
                items:[{product:productId,quantity:parseInt(qty)}],
                total:parseInt(qty,10)
            });
            await newCart.save();

        }
        const userWishlist=await Wishlist.findOne({user:userId});
        if(userWishlist){
            const wishlistItemIndex = userWishlist.items.findIndex(item => item.product.toString() === productId);
            if (wishlistItemIndex !== -1){

                userWishlist.items.splice(wishlistItemIndex,1)
                await userWishlist.save();
            }

        }
        
        res.render('productpage', {product: productData })


    }catch(error){
        console.log(error.message);
    }
}
const loadCart=async(req,res)=>{
    userId=req.session.user_id;
    try{
        const userCart=await Cart.findOne({user:userId}).populate('items.product')
     
        const cart=userCart ? userCart.items:[];
       
       const subTotal=calculateSubTotal(cart);
      
       const producttotal=calculateProductTotal(cart);
       const subTotalWithShipping=subTotal+100
       let outOfStockError=false;
       if(cart.length > 0){
        for(const cartItem of cart){
            const product=cartItem.product;
            if(product.quantity<cartItem.quantity){
                outOfStockError=true;
                break;

            }
        }
       }
       let maxQuantityErr=false;
       if(cart.length > 0){
        for (const cartItem of cart){
            const product=cartItem.product;
            if(cartItem.quantity > 2){
                maxQuantityErr=true;
                break;
            }
        }
       }
      

        res.render('cart',{user: req.session.user,cart,subTotal,outOfStockError,maxQuantityErr,producttotal,subTotalWithShipping})
    }catch(error){
        console.log(error.message);
    }
}

const removeCart = async (req, res) => {
    const userId = req.session.user_id;
    console.log(userId)
    const productId = req.params.productId;
    console.log(productId);
    try{
      const userCart=await Cart.findOne({user:userId});
      if(!userCart){
        // res.render('wishlist',{message:"wishlist not found"})
        res.send("cart error one")
      }
      const cartItemIndex = userCart.items.findIndex((item) => item.product.toString() === productId);
      
      userCart.items.splice(cartItemIndex , 1);
      await userCart.save();
      res.redirect('/cart');
     
    }catch(error){
      console.log(error.message);
    }
    
  };

  const calculateSubTotal=(cart)=>{
    let subTotal=0;
    for(const cartItem of cart){
        subTotal += cartItem.product.discountPrice * cartItem.quantity;

    }
    return subTotal;

  };
  const calculateProductTotal=(cart)=>{
    const productTotals=[];
    for(const cartItem of cart){
        const total= cartItem.product.discountPrice * cartItem.quantity;
        productTotals.push(total);
    }
    return productTotals;
  }
  const updateCart =async(req,res)=>{
    const userId=req.session.user_id;
   const productId=req.query.productId;
    const newQuantity=req.body.quantity
    console.log(userId)
    console.log(productId,newQuantity)
    
    try{
        const maxQuantity=3;
        const userCart=await Cart.findOne({user:userId})
        if(!userCart){
            return res.status(404).json({error:'user cart not found'}) ; 
        }
        const cartItem=userCart.items.find((item)=>item.product.equals(productId));
        if(!cartItem){
            return res.satus(404).json({error:'product not found in cart'});
        }
        if(newQuantity >= 0 && newQuantity <= 4) {
            cartItem.quantity=newQuantity;
            ;
            console.log(cartItem.quantity)
            await userCart.save();
            res.sendStatus(200);

        }
        else{
            res.send('error')
    }
}catch(error){
    console.error('Error updating quantity:', error);
    res.status(500).json({ error: 'An error occurred while updating quantity.' });


}
  };
  const updateCartCount = async (req, res) => {
    try {
      const userId = req.session.user_id;
      const productId = req.query.productId;
      const newQuantity = parseInt(req.query.quantity);
  
      const existingCart = await Cart.findOne({ user: userId });
      if (existingCart) {
        const existingCartItem = existingCart.items.find(
          (item) => item.product.toString() === productId
        );
  
        if (existingCartItem) {
          existingCartItem.quantity = newQuantity;
          existingCart.total = existingCart.items.reduce(
            (total, item) => total + (item.quantity || 0),
            0
          );
  
          await existingCart.save();
        }
  
        res.json({ success: true });
      } else {
        res.json({ success: false, error: "Cart not found" });
      }
    } catch (error) {
      console.error("Error updating cart:", error);
      res.json({ success: false, error: "Internal server error" });
}};



module.exports={
    loadCart,
    addtoCart,
    removeCart,
    updateCart,
    updateCartCount
}

