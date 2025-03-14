const jwt = require("jsonwebtoken");
const User = require("../model/userSchema");

const authentication = async (req, res, next) => {
    try {
        const token = req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            if (req.xhr) {
                return res.status(401).render("error", { errorMessage: "Access Denied: No token provided" });
            }
            return res.redirect("/login");
        }


        const decoded = jwt.verify(token, process.env.SECRET_KEY);


        const user = await User.findById(decoded.userId);
        req.user = user; 
        next();

    } catch (error) {
        console.error("Token verification error:", error);

        if (req.xhr) {
            return res.status(400).render("error", { errorMessage: "Invalid or Expired Token" });
        }
        res.redirect("/login");
    }
};

const checkAuth = (req, res, next) => {
    const token = req.cookies.token || req.headers['authorization'];
    
    if (token) {
        return res.redirect('/home'); 
    }
    next(); 
};



module.exports={authentication,checkAuth}
