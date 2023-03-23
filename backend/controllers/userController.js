const mongooose=require("mongoose");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors=require("../middleware/catchAsyncErrors");
const User=require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const sendEmail=require("../utils/sendEmail.js");
const { isErrored } = require("nodemailer/lib/xoauth2");
const crypto=require("crypto")
const cloudinary=require("cloudinary")

//User Registeration
exports.registerUser=catchAsyncErrors(async(req,res,next)=>{
  const myCloud=await cloudinary.v2.uploader.upload(req.body.avatar,{
    folder:"avatars",
    width:150,
    crop:"scale"
  })  

  
  const {name,email,password}=req.body;
    const user=await User.create({
      name,email,password, 
      avatar:{
        public_id:myCloud.public_id,
        url:myCloud.secure_url
      }   
    });
    sendToken(user,201,res)
});

//Login User
exports.loginUser=catchAsyncErrors(async(req,res,next)=>{
  const{email,password}=req.body;
  //
  if(!email || !password){
    return next(new ErrorHandler("Please Enter email and password",400))
  }
  const user=await User.findOne({email}).select("+password");
  if(!user){
    return next(new ErrorHandler("Invalid email or password",401));
  }
  const isPasswordMatched=await user.comparePassword(password);

//   isPasswordMatched.then(function(result){
//    if(!result){
//     return next(new ErrorHandler("Invalid Email or Password",401)) ;
//    }
//   else{
//     sendToken(user,200,res);
//   }
// })    

   if(!isPasswordMatched){
     return next(new ErrorHandler("Invalid Email or Password",401))  
 }
   
 sendToken(user,200,res);
  
})

//logout
exports.logout=catchAsyncErrors(async(req,res,next)=>{
  
res.cookie("token",null,{
  expires:new Date(Date.now()),
  httpOnly:true,
})
  res.status(200).json({
    success:true,
    message:"Logged Out"
  })
})

//Forget Password
exports.forgetPassword=catchAsyncErrors(async(req,res,next)=>{
  const user=await User.findOne({email:req.body.email})
 
  if(!user){
    return next(new ErrorHandler("user not found",400));
  }
  
  const resetToken = user.getResetPasswordToken();
 
  await user.save({validateBeforeSave: false});

  const resetPasswordUrl= `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`

const message= `Your password reset Token is: \n\n  ${resetPasswordUrl} \n\n  if you have not requested this then ignore it`;

 try{
    await sendEmail({
     email:user.email,
     subject:`Ecommerce Password Recovery`,
     message,
    
    })
    res.status(200).json({
      success:true,
      message:`Email sent to ${user.email} sucessfully`
    })
   
} catch(error){
  user.resetPasswordToken=undefined;
  user.resetPasswordExpire=undefined;
  await user.save({validateBeforeSave:false});
  return next(new ErrorHandler(error.message,500))

}})

//Reset Password
exports.resetPassword=catchAsyncErrors(async(req,res,next)=>{


//creating has
  const resetPasswordToken=crypto
  .createHash("sha256")
  .update(req.params.token)
  .digest("hex")
  
  const user=await User.findOne({
    resetPasswordToken,
    resetPasswordExpire:{$gt:Date.now()},
  });
  if(!user){
    return next(new ErrorHandler("Reset Password Token is invalid or expired",400));
  }
  
  if(req.body.password!==req.body.confirmPassword){
    return next(new ErrorHandler("Password Does not Match",400))
  }

    user.password=req.body.password;
    user.resetPasswordToken=undefined;
    user.resetPasswordExpire=undefined;
    await user.save();
    sendToken(user,200,res);
})

//GET USER DETAIL
exports.getUserDetail=catchAsyncErrors(async(req,res,next)=>{
  const user= await User.findById(req.user.id);
  

  res.status(200).json({
    sucess:true,
    user
  })
})

//Update User Password
exports.updatePassword=catchAsyncErrors(async(req,res,next)=>{
  const user= await User.findById(req.user.id).select("+password");
  
  const isPasswordMatched=await user.comparePassword(req.body.oldPassword);

 if(!isPasswordMatched){
    return next(new ErrorHandler("Invalid Email or Password",401)) ;  
  }
  if(req.body.newPassword!==req.body.confirmPassword){
    return next(new ErrorHandler("Password does not match",400))
  }

  user.password=req.body.newPassword;
  
  await user.save()
  sendToken(user,200,res);
})

//Update user Profile
exports.updateProfile=catchAsyncErrors(async(req,res,next)=>{
  
  const newUserData={
    name:req.body.name,
    email:req.body.email
  }

  const user=await User.findByIdAndUpdate(req.user.id,newUserData,{
    new:true,
    runValidators:true,
    useFindAndModify:false
  })
  res.status(200).json({
    success:true
  })

})

//GET ALL USERS------ADMIN
exports.getAllUsers=catchAsyncErrors(async(req,res,next)=>{
  const users=await User.find();
  res.status(200).json({
    success:true,
    users
  })
})

//GET SNGLE USER-----ADMIN
exports.getSingleUser=catchAsyncErrors(async(req,res,next)=>{
  const user=await User.findById(req.params.id);
  
  if(!user){
    return next(new ErrorHandler(`user does not exist with id :${req.params.id} `,400))
  }

  res.status(200).json({
    success:true,
    user
  })
})

//Update User Role ----ADMIN
exports.updateUserRole=catchAsyncErrors(async(req,res,next)=>{
  
  const newUserData={
    name:req.body.name,
    email:req.body.email,
    role:req.body.role,
  }

  const user=await User.findByIdAndUpdate(req.params.id,newUserData,{
    new:true,
    runValidators:true,
    useFindAndModify:false
  })

  if(!user){
    return next(new ErrorHandler(`User does not exist with id : ${req.params.id}`))
  }
  res.status(200).json({
    success:true
  })

})

//DELETE USER---ADMIN
exports.deleteUser=catchAsyncErrors(async(req,res,next)=>{

  const user=await User.findById(req.params.id);
  
  //will remove cloudinary later
  
  if(!user){
    return next(new ErrorHandler(`User does not exist with id : ${req.params.id}`))
  }

  await user.remove()


  res.status(200).json({
    success:true,
    message:"User Deleted Successfully"
  })

})