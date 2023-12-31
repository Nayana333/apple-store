const Cart = require("../models/cartModel");
const Wishlist = require("../models/wishlistModel");
const Product = require("../models/productModel");
const User = require("../models/userModel")






const addtoCart = async (req, res) => {
  const userId = req.session.user_id;

  const productId = req.params.productId;

  const { qty } = req.body
  console.log(qty+'uuuuu');
 

  const productData = await Product.find({});
  try {

    const user = await User.findById(userId)
    const existingCart = await Cart.findOne({ user: userId });
    let newCart = {};
    if (existingCart) {
      const existingCartItem = existingCart.items.find(item => item.product.toString() === productId);
      if (existingCartItem) {

        if (existingCartItem.quantity < 4) {

          existingCartItem.quantity += parseInt(qty);
        }else{
          console.log("its alredy 4 item");
        }

        console.log("////"+ existingCartItem.quantity);
        
      }
      else {
      
        existingCart.items.push({ product: productId, quantity: parseInt(qty) });

      }
      existingCart.total = existingCart.items.reduce((total, item) => total + (item.quantity || 0), 0);

      await existingCart.save();

    }
    else {
      newCart = new Cart({
        user: userId,
        items: [{ product: productId, quantity: parseInt(qty) }],
        total: parseInt(qty, 10)
      });
      await newCart.save();

    }
    const userWishlist = await Wishlist.findOne({ user: userId });
    if (userWishlist) {
      const wishlistItemIndex = userWishlist.items.findIndex(item => item.product.toString() === productId);
      if (wishlistItemIndex !== -1) {

        userWishlist.items.splice(wishlistItemIndex, 1)
        await userWishlist.save();
      }

    }
    const cart = await Cart.findOne({ user: req.session.user_id })
    if (cart) {
      req.session.cartLength = cart.total;
     
    }
    else {
      cart.total = 0;
    }

    // res.render('productpage', {product: productData ,user})
    res.redirect('/product')


  } catch (error) {
    console.log(error.message);
  }
}

const loadCart = async (req, res) => {
  const userId = req.session.user_id;
  const cartData = req.session.cartLength
  console.log(userId);
  try {
    const userCart = await Cart.findOne({ user: userId }).populate('items.product')


    const cart = userCart ? userCart.items : [];

    const subTotal = calculateSubTotal(cart);

    const producttotal = calculateProductTotal(cart);
    const subTotalWithShipping = subTotal + 100
    let outOfStockError = false;
    if (cart.length > 0) {
      for (const cartItem of cart) {
        const product = cartItem.product;
        if (product.quantity < cartItem.quantity) {
          outOfStockError = true;
          break;

        }
      }
    }
    let maxQuantityErr = false;
    if (cart.length > 0) {
      for (const cartItem of cart) {
        const product = cartItem.product;
        if (cartItem.quantity > 2) {
          maxQuantityErr = true;
          break;
        }
      }
    }
    if (cart.length === 0) {
      res.redirect('/emptyCart');
    } else {

      res.render('cart', { user: userId, cart, subTotal, outOfStockError, maxQuantityErr, producttotal, subTotalWithShipping, cartData });
    }


  } catch (error) {
    console.log(error.message);
  }
}

const removeCart = async (req, res) => {
  const userId = req.session.user_id;
  console.log(userId)
  const productId = req.params.productId;
  console.log(productId);
  try {
    const userCart = await Cart.findOne({ user: userId });
    if (!userCart) {
      // res.render('wishlist',{message:"wishlist not found"})
      res.send("cart error one")
    }
    const cartItemIndex = userCart.items.findIndex((item) => item.product.toString() === productId);

    userCart.items.splice(cartItemIndex, 1);
    userCart.total = userCart.items.reduce((total, item) => total + (item.quantity || 0), 0);
    if (userCart) {
      req.session.cartLength = userCart.total;
    }


    await userCart.save();



    res.redirect('/cart');

  } catch (error) {
    console.log(error.message);
  }

};

// const calculateSubTotal = (cart) => {



//   let subTotal = 0;
  
//   for (const cartItem of cart) {
//     let priceToConsider  = cartItem.product.price;
//     if(cartItem.product.discountStatus===true){
//       priceToConsider = cartItem.product.discountPrice;
//     }

//     console.log(priceToConsider)
//     subTotal += priceToConsider * cartItem.quantity;
//     console.log(subTotal+"Quantity"+cartItem.quantity)
//   }
//   return subTotal;

// };



const calculateSubTotal = (cart) => {
  let subtotal = 0;
  for (const cartItem of cart) {

      const isDiscounted = cartItem.product.discountStatus &&
          new Date(cartItem.product.startDate) <= new Date() &&
          new Date(cartItem.product.endDate) >= new Date();

      const priceToConsider = isDiscounted ? cartItem.product.discountPrice : cartItem.product.price;

      subtotal += priceToConsider * cartItem.quantity;
  }
  return subtotal;
};
// const calculateProductTotal = (cart) => {
//   const productTotals = [];
//   for (const cartItem of cart) {
//     let priceToConsider  = cartItem.product.price;
//     if(cartItem.product.discountStatus===true){
//       console.log(priceToConsider)
//       priceToConsider = cartItem.product.discountPrice;
//     }
//     const total = priceToConsider * cartItem.quantity;
//     productTotals.push(total);
//   }
//   return productTotals;
// }


const calculateProductTotal = (cart) => {
  const productTotals = [];
  for (const cartItem of cart) {

      const isDiscounted = cartItem.product.discountStatus &&
          new Date(cartItem.product.startDate) <= new Date() &&
          new Date(cartItem.product.endDate) >= new Date();

      const priceToConsider = isDiscounted ? cartItem.product.discountPrice : cartItem.product.price;

      const total = priceToConsider * cartItem.quantity;
      productTotals.push(total);
  }
  return productTotals;
};


const updateCart = async (req, res) => {
  const userId = req.session.user_id;
  const productId = req.query.productId;
  const newQuantity = req.body.quantity
  console.log(userId)
  console.log(productId, newQuantity)

  try {
    const maxQuantity = 3;
    const userCart = await Cart.findOne({ user: userId })
    if (!userCart) {
      return res.status(404).json({ error: 'user cart not found' });
    }
    const cartItem = userCart.items.find((item) => item.product.equals(productId));
    if (!cartItem) {
      return res.satus(404).json({ error: 'product not found in cart' });
    }
    if (newQuantity >= 0 && newQuantity <= 4) {
      cartItem.quantity = newQuantity;

      console.log(cartItem.quantity);
      userCart.total = userCart.items.reduce((total, item) => total + (item.quantity || 0), 0);

      await userCart.save();
      if (userCart) {
        req.session.cartLength = userCart.total;
        res.sendStatus(200);
      }


    }
    else {
      res.status(400).json({ error: 'An error occurred while updating quantity.' });
    }
  } catch (error) {
    console.error('Error updating quantity:', error);
    res.status(500).json({ error: 'An error occurred while updating quantity.' });


  }
};

//   const updateCartCount = async (req, res) => {
//     try {
//         const userId = req.session.user_id;
//         const productId = req.query.productId;
//         const newQuantity = parseInt(req.query.quantity);

//         const existingCart = await Cart.findOne({ user: userId });
//         if (existingCart) {
//             const existingCartItem = existingCart.items.find(
//                 (item) => item.product.toString() === productId
//             );

//             if (existingCartItem) {
//                 existingCartItem.quantity = newQuantity;
//                 existingCart.total = existingCart.items.reduce(
//                     (total, item) => total + (item.quantity || 0),
//                     0
//                 );

//                 await existingCart.save();
//                 res.json({ success: true });
//             } else {
//                 res.json({ success: false, error: "Item not found in cart" });
//             }
//         } else {
//             res.json({ success: false, error: "Cart not found" });
//         }
//     } catch (error) {
//         console.error("Error updating cart:", error);
//         res.json({ success: false, error: "Internal server error" });
//     }
// };


const updateCartCount = async (req, res) => {
  const userId = req.session.user_id;
  const productId = req.params.productId;
  const newQuantity = req.body.quantity;

  try {

    const maxQuantity = 4;

    const userCart = await Cart.findOne({ user: userId });

    if (!userCart) {
      return res.status(404).json({ error: 'User cart not found.' });
    }

    const cartItem = userCart.items.find((item) =>
      item.product.equals(productId)
    );

    if (!cartItem) {
      return res.status(404).json({ error: 'Product not found in cart.' });
    }


    if (newQuantity >= 0 && newQuantity <= 4) {
      cartItem.quantity = newQuantity;
      await userCart.save();
      res.sendStatus(200);

    } else {
      res.status(400).json({ error: `Quantity must be between 0 and ${maxQuantity}.` });
    }
  } catch (error) {
    console.error('Error updating quantity:', error);
    res.status(500).json({ error: 'An error occurred while updating quantity.' });
  }
};


const emptyCart = async (req, res) => {
  try {
    const user = req.session.user_id
    const cartData = req.session.cartLength
    console.log('session user' + user)
    res.render('emptyCart', { user, cartData })
  } catch (error) {
    console.log(error.message);
  }
}


module.exports = {
  loadCart,
  addtoCart,
  removeCart,
  updateCart,
  updateCartCount,
  emptyCart
}

