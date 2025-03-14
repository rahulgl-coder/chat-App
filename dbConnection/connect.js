const mongoose=require("mongoose")
require("dotenv").config();

const dBConnect = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL );
        console.log("Database connected successfully");
    } catch (error) {
        console.error("Database connection failed:", error.message);
     
    }
};


module.exports=dBConnect; 