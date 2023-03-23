const Order=require("../models/orderModel")
const Product=require("../models/productModels");
const mongooose=require("mongoose");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors=require("../middleware/catchAsyncErrors");

//Create new Order
exports.newOrder=catchAsyncErrors(async(req,res,next)=>{
  console.log("orders")
    const {
       shippingInfo,
       orderItems,
       paymentInfo,
       itemsPrice,
       taxPrice,
       shippingPrice,
       totalPrice
    }=req.body
    const order=await Order.create({
    
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paidAt:Date.now(),
        user:req.user._id     
    })
    res.status(200).json({
        success:true,
        order
    })
})

//Get logged in user Orders
exports.myOrder=catchAsyncErrors(async(req,res,next)=>{
    
   const order=await Order.find({user:req.user.id})
   res.status(200).json({
       sucess:true,
       order
   })
})

//get Single order
exports.getSingleOrder=catchAsyncErrors(async(req,res,next)=>{

    //populate function will fetch the user name and email through its id 
    const order=await Order.findById(req.params.id).populate("user","name email")
    if(!order){
        return next(new ErrorHandler("order not found",404));
    }
    res.status(200).json({
        sucess:true,
        order
    })
})

//GET ALL ORDERS---ADMIN
exports.getAllOrders=catchAsyncErrors(async(req,res,next)=>{
    const orders=await Order.find()
    let totalAmount=0
    orders.forEach(order=>{
        totalAmount+=order.totalPrice
    })
    res.status(200).json({
        success:true,
        totalAmount,
        orders
    })
})

//UPDATE ORDER STATUS ---ADMIN
exports.updateOrder=catchAsyncErrors(async(req,res,next)=>{
    const order=await Order.findById(req.params.id)
    if(order.orderStatus=="Delivered"){
        return next(new ErrorHandler("Order delivered",400))
    }
    if(!order){
        return next(new ErrorHandler("Order Not Found",401))
    }

    order.orderItems.forEach(async o=>{
        await updateStock(o.product,o,quantity)
    })
    order.orderStatus=req.body.status;
    if(req.body.status==="Delivered"){
        order.deliveredAt=Date.now()
    }
    await order.save({
        validateBeforeSave:false
    })
    res.status(200).json({
        success:true,
    })
})


async function updateStock(id,quantity){
const product=await Product.findById(id);
product.stock-=quantity
await product.save({validateBeforeSave:false})}

//DELETE ORDER ---ADMIN
exports.deleteOrder=catchAsyncErrors(async(req,res,next)=>{
    const order=await Order.findById(req.params.id)
    if(!order){
        return next(new ErrorHandler("order not found",404))
    }
    await order.remove()
    
    res.status(200).json({
        success:true,
        order
    })
})
