const Transaction=require('../models/transactionModel')


const loadTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.find().populate({ path: 'user', model: 'User' });
       
        res.render('viewTransaction', { transaction }); // Ensure you pass the transaction data properly
    } catch (error) {
        res.status(500).send(error.message); // Properly handle the error, sending a response in case of an error
    }
};



module.exports={
    loadTransaction
}