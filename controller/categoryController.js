const categ=require("../models/categoryModel");
const User=require("../models/userModel");
const mongoose= require("mongoose")

const addCategory= async (req, res) => {
    try {
  
        const categoryExist = await categ.findOne({ category: req.body.category });
  
        if (categoryExist) {
            return res.render('new-category', { message: "Category already exists" });
        }
  
  
        const category = new categ({
            category: req.body.category,
            description: req.body.description,
            image: req.file.filename,
            isListed: true
        });
  
  
        const categoryData = await category.save();
  
        if (categoryData) {
            return res.render('new-category',{ message: "Category Registration succesful" });
        } else {
            return res.render('new-category', { message: "Category Registration Failed" });
        }
    } catch (error) {
        console.error(error.message);
        return res.render('new-category', { message: "An error occurred while creating the category" });
  }
  }
  
  
  const newCategoryLoad= async(req,res)=>{
      try{
  
          res.render('new-category');
  
      }catch(error){
          console.log(error.message)
      }
  }
//   const loadCategory=async(req,res)=>{
//       try{
//         const page = parseInt(req.query.page) || 1;
//           var search='';
//           const perPage = 5;
//           if(req.query.search){
//               search=req.query.search;
             
//           }
//           const totalCount = await categ.countDocuments({
//             $or: [
//                 { category: { $regex: '.*' + search + '.*', $options: 'i' } },
//                 { description: { $regex: '.*' + search + '.*', $options: 'i' } },
//             ],
//         });

  
//          const adminData =await categ.find({
//           $or:[
//               { category:{$regex:'.*'+search+'.*',$options:'i'}},
//               { description:{$regex:'.*'+search+'.*',$options:'i'}},
              
//           ]
         
//       }).skip((page - 1) * perPage).limit(perPage);;
    
//       res.render('viewCategory', {
//         categ: adminData,
//         currentPage: page,
//         totalPages: Math.ceil(totalCount / perPage),
//     });
  
  
//       }catch(error){
//           console.log(error.message)
//       }
//   }

const loadCategory = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        let search = '';
        let filterBy = ''; 

        const perPage = 5;
        if (req.query.search) {
            search = req.query.search;
        }

        if (req.query.filterBy) {
            filterBy = req.query.filterBy.toLowerCase(); 
        }

        const totalCount = await categ.countDocuments({
            $or: [
                { category: { $regex: '.*' + search + '.*', $options: 'i' } },
                { description: { $regex: '.*' + search + '.*', $options: 'i' } },
            ],
         
            isListed: filterBy === 'listed' ? true : filterBy === 'unlisted' ? false : { $exists: true },
        });

        const adminData = await categ
            .find({
                $or: [
                    { category: { $regex: '.*' + search + '.*', $options: 'i' } },
                    { description: { $regex: '.*' + search + '.*', $options: 'i' } },
                ],
                
                isListed: filterBy === 'listed' ? true : filterBy === 'unlisted' ? false : { $exists: true },
            })
            .skip((page - 1) * perPage)
            .limit(perPage).sort({category:1});

            res.render('viewCategory', {
                categ: adminData,
                currentPage: page,
                totalPages: Math.ceil(totalCount / perPage),
                filterBy: filterBy
            });
            
    } catch (error) {
        console.log(error.message);
    }
};



  
  
   
    const editCategory=async(req,res)=>{
      try{
          const id=req.query.id;
          const adminData=await categ.findById({_id:id})
       
          if(adminData){
              res.render('edit-category',{category:adminData});
          }
          else{
          res.redirect('/admin/edit-category');
  
      }}catch(error){
          console.log(error.message)
      }
  }
  
  const updateCategory= async (req, res) => {
    try {
       
        const categoryId = req.query._id 
        
  
  
        const category = await categ.findById(categoryId);
     
        
  
        if (!category) {
         
            return res.render('edit-category', { message: "Category not found",category:category});
        }
  
        
        const updateFields = {
            category: req.body.category,
            description: req.body.description,
            
        };
  
       
        if (req.file) {
            updateFields.image = req.file.filename;
        }
  
   
        await categ.findByIdAndUpdate(categoryId, { $set: updateFields });
  
        res.redirect('/admin/viewCategory');
    } catch (error) {
        console.log(error.message);
  
  }
  }
  const unlistCategory = async (req, res) => {
    try {
        const admin=  req.session.adminData;
        const id = req.query.id;
        console.log(id);
        console.log(typeof(id))
        const category= await categ.findById(id);
  
       
  
        category.isListed = !category.isListed;
  
  
        await category.save();
  
       res.status(200).json({message:"success"})
    } catch (error) {
        console.log(error.message);
  
    }
  }
  

module.exports={
    addCategory,
    newCategoryLoad,
    loadCategory,
    unlistCategory,
    updateCategory,
    editCategory,
  
}
  