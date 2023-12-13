const Transaction=require('../models/transactionModel')


// const loadTransaction = async (req, res) => {
//     try {
//         const transaction = await Transaction.find().populate({ path: 'user', model: 'User' });
       
//         res.render('viewTransaction', { transaction }); 
//     } catch (error) {
//         res.status(500).send(error.message); 
//     }
// };



const loadTransaction = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; 
        const limit = 5; 
        const skip = (page - 1) * limit; 

        const totalTransactionsCount = await Transaction.countDocuments();
        const totalPages = Math.ceil(totalTransactionsCount / limit);

        const transaction = await Transaction.find()
            .populate({ path: 'user', model: 'User' })
            .skip(skip)
            .limit(limit);

        res.render('viewTransaction', { transaction, totalPages, currentPage: page });
    } catch (error) {
        res.status(500).send(error.message);
    }
};




module.exports={
    loadTransaction
}