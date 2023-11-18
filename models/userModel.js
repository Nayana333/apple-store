const mongoose=require("mongoose")

const userSchema = new mongoose.Schema({

    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    mobile:{
        type:String,
        required:true
    },
    username:{
        type:String,
        required:true
    },
    image:{
            type:String,
            required:true
    },
    password:{
        type:String,
        required:true
    },
    cart:[]
        
     
    ,
   wishlist:[],
    
    is_admin:{
        type:Number,
        required:true

    },
    is_verified:{
        type:Number,
        default:0
    },
    is_blocked:{
        type:Boolean,
        default:false
    }


});

module.exports= mongoose.model('User',userSchema);