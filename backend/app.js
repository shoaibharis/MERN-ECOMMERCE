const express=require("express");
const cors = require('cors');
const app=express();
const cookieParser=require("cookie-parser");
const errorMiddleWare=require("./middleware/error");
const bodyParser=require("body-parser")
const fileupload=require("express-fileupload")

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(fileupload());
app.use(bodyParser.urlencoded({extented:true}))
//Route imports
const product=require("./routes/productRoute");
const user=require("./routes/userRoute");
const order=require("./routes/orderRoute")
app.use("/api/v1",product)
app.use("/api/v1",user)
app.use("/api/v1",order);

//Middleware for error
app.use(errorMiddleWare)
module.exports=app