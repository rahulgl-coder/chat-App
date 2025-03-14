require("dotenv").config()
const jwt=require("jsonwebtoken")




const extractDataFromToken = async (req, res) => {
    try {
        const token = req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "");
     
        if (!token) {
            throw new Error("Access denied. No token provided.");
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        return decoded.userId
        
       

    } catch (error) {
        console.error("Token verification error:", error.message);
        throw new Error("Invalid or expired token."); 
    }
};


const createToken = async (userData, res) => {
    try {
   
        if (!userData || !userData._id || !userData.username) {
            throw new Error("Missing user data for token generation");
        }

       
        const tokenPayload = {
            userId: userData._id.toString(), 
            role: userData.role || "user",  
            name: userData.username
        };

    
        const token = jwt.sign(tokenPayload, process.env.SECRET_KEY, { expiresIn: "1h" });

        
        res.cookie("token", token, { 
            httpOnly: true,  
            secure: false,   
            maxAge: 3600000  
        });

       
        return token;
    } catch (error) {
        console.error("Token Generation Error:", error.message);
        return null;
    }
};




module.exports={extractDataFromToken,createToken}

