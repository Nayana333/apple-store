const mongoose = require('mongoose');


const bannerSchema = new mongoose.Schema({
  image: String,
  bannerType:String,
  title: String,
  link: String,
  description:String,
  subtitle: String,
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
}, 
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
},  
  offer:String,
  
startDate: {
  type: Date, 
  default: Date.now,
},
endDate: {
  type: Date,
  required: true,
  default: Date.now,
},
  isListed : {
    type : Boolean,
    default : true
}
  
});



module.exports = mongoose.model('Banner', bannerSchema); ;
