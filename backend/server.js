const app=require("./app")
const dotenv=require("dotenv")
const connectDatabase=require("./config/database")
const cloudinary=require("cloudinary");
//Handling uncaught Exception
process.on("uncaughtException",(err)=>{
    console.log(`Error: ${err.message}`);
    console.log("Shutting down due to unhandled exception");
    server.close(()=>{process.exit(1)})
})

//config
dotenv.config({path:"backend/config/config.env"});

//connect Database
connectDatabase()

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})

const server=app.listen(process.env.PORT,()=>{
    console.log(`server running on ${process.env.PORT}`)
})

//Unhandled Promise Rejection
process.on("unhandledRejection",(err)=>{
    console.log(`Error:${err.message}`);
    console.log(`shutting down server due to unhandled Rejection`);
    server.close(()=>{
        process.exit(1)
    });
});