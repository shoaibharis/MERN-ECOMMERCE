const express=require("express");
const { getAllProducts,createProduct,
     updateProducts, 
     deleteProduct, 
     getProductDetails, 
     createProductReview,
     getProductReviews,
     deleteReview} = require("../controllers/productController");
const router=express.Router();

const {isAuthenticatedUser, authorizeRoles}=require("../middleware/auth");

router.route("/products").get(getAllProducts)
router.route("/admin/product/new").post(isAuthenticatedUser,authorizeRoles("admin"),createProduct)

router.route("/admin/product/:id")
.put(isAuthenticatedUser,authorizeRoles("admin"),updateProducts)
.delete(isAuthenticatedUser,authorizeRoles("admin"),deleteProduct)

router.route("/product/:id").get(getProductDetails)

router.route("/review").put(isAuthenticatedUser,createProductReview);

router.route("/reviews").get(getProductReviews).patch(isAuthenticatedUser,deleteReview)
module.exports=router