const User=require('../models/userModel');
Address=require('../models/addressModel')

async function addAddress(userId, type, phone, houseName, name, street, city, state, pinCode) {
    try {
      const userAddress = new Address({
        user: userId,
        type,
        phone,
        houseName,
        name,
        street,
        city,
        state,
        pinCode,
      });
  
      await userAddress.save();
  
      return { success: true, message: 'Address added successfully' };
    } catch (error) {
      console.error('Error adding address:', error);
      return { success: false, message: 'An error occurred while adding address' };
    }
  }

  


module.exports = {
 
    addAddress,
   
};