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
    walletBalance: {
        type: Number,
        default: 0,
    },
    password:{
        type:String,
        required:true
    },
    cart:[]
        
     
    ,
   wishlist:[],

referralCode: {
    type: String,
    default: generateRandomReferralCode,
    unique: true, 
},
referredUsers: [{
    type: String
}],
    
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


function generateRandomReferralCode() {

    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const codeLength = 6;
    let referralCode = '';
    for (let i = 0; i < codeLength; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        referralCode += characters.charAt(randomIndex);
    }
    return referralCode;
}


module.exports= mongoose.model('User',userSchema);