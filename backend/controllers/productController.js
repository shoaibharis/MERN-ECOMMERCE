const Product=require("../models/productModels");
const mongooose=require("mongoose");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors=require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apiFeatures");

//Create Product--->FOR ADMIN
exports.createProduct=catchAsyncErrors(async(req,res,next)=>{

      req.body.user=req.user.id

    const product =await Product.create(req.body);
    res.status(201).json({
        success:true,
        product
    })
});

//GET PRODUCTS
exports.getAllProducts=catchAsyncErrors(async(req,res,next)=>{
    const resultPerPage=8;
    const productCount=await Product.countDocuments();
      
   const apiFeature=new ApiFeatures(Product.find(),req.query)
   .search()
   .filter()
   .pagination(resultPerPage)
    // let products= apiFeature.query

    // const filteredProductCount=products.length;
   
    //const products = await Product.find();
     products =await apiFeature.query
    res.status(200).json({
        success:true,
        products,
        productCount,
        resultPerPage,
    })
})

//GET SINGLE PRODUCT
exports.getProductDetails=catchAsyncErrors(async(req,res,next)=>{
    const product=await Product.findById(req.params.id);
    if(!product){
        return next(new ErrorHandler("Product not found",404))
    }
    res.status(200).json({
        success:true,
        product
    })
})

//UPDATE PRODUCTS----->FOR ADMIN
exports.updateProducts=catchAsyncErrors(async(req,res,next)=>{
    let products=Product.findById(req.params.id);
    if(!products){
        return next(new ErrorHandler("Product not found",404))
    }
    products=await Product.findByIdAndUpdate(req.params.id,req.body,{new:true,
    runValidators:true,
       useFindAndModify:false})
       
     res.status(200).json({
        success:true,
        products
     })
});

//DELETE PRODUCT
exports.deleteProduct=catchAsyncErrors(async(req,res,next)=>{
    const product=await Product.findById(req.params.id)
    if(!product){
        return next(new ErrorHandler("Product not found",404))
    }
    await product.remove();
    res.status(200).json({
        success:true,
        message:"Product Deleted Successfully"
    })
})

//Create new Review or Update the review
exports.createProductReview=catchAsyncErrors(async(req,res,next)=>{

    const {rating,comment,productId}=req.body
    const review={
        user:req.user._id,
        name:req.user.name,
        ratings:Number(rating),
        comment
    }
    const product=await Product.findById(productId);
    
   const isReviewed=product.reviews.find(rev=> rev.user.toString()===req.user._id.toString())

   if(isReviewed){
         
         product.reviews.forEach(rev=> {
           if(rev.user.toString()===req.user._id.toString()){
             rev.ratings=rating
             rev.comment=comment
           }      
         }) 
        }

else{
        product.reviews.push(review)
        product.numOfReviews=product.reviews.length
}

    let avg=0

    product.ratings=product.reviews.forEach(rev=>{
     avg+=rev.ratings
    })

    product.ratings =avg
    / product.reviews.length;

    await product.save({
        validateBeforeSave:false});

   res.status(200).json({
        success:true
        })
})

//Get All reviews of a product
exports.getProductReviews=catchAsyncErrors(async(req,res,next)=>{
    const product=await Product.findById(req.query.id);
    if(!product){
        return next(new ErrorHandler(`Product not find`,404))
    }
    res.status(200).json({
        sucess:true,
        reviews:product.reviews
    })
})

//Delete Review
exports.deleteReview=catchAsyncErrors(async(req,res,next)=>{
    const product=await Product.findById(req.query.productId);
    if(!product){
        return next(new ErrorHandler(`Product not found`,404))
    }

    //to filter out the review and create a new variable 
    const review = product.reviews.filter(rev=> rev._id.toString()!==req.query.id.toString())
  
    //To remove the review
    Product.updateOne({}, {$pull: {reviews: {_id: req.query.id}}})
    console.log(review)
    let avg=0

    review.forEach(rev=>{
     avg+=rev.ratings
    })

     const ratings=avg/review.length
    const numOfReviews=review.length
    await Product.findByIdAndUpdate(req.query.productId,{
        review,
        ratings,
        numOfReviews
    },{
        new:true,
        runValidators:true,
        useFindAndModify:false
    })
    res.status(200).json({
        success:true
    })
})