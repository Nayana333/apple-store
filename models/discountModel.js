const mongoose = require("mongoose");

const discountSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
 
  discountType: {
    type: String,
    enum: ["percentage", "fixed Amount"],
    required: true,
  },
  discountValue: {
    type: Number,
    
  },
  maxRedeemableAmt: {
    type: Number,
    default: 0,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  discountedProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  
});


module.exports = mongoose.model("discount", discountSchema);
