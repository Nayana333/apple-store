const mongoose=require("mongoose");
const schema =mongoose.Schema;

const UserOTPVerificationSchema = new mongoose.Schema({
    userId:String,
    otp:String,
    createdAt:Date,
    expireAt:Date,

});
// const UserOTPVerification =mongoose.model(
//     "UserOTPVerification",
//     UserOTPVerificationSchema
//     );
    module.exports =mongoose.model ('UserOTPVerification',UserOTPVerificationSchema);