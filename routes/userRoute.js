const express=require("express")
const route=express.Router()
const controller=require("../controller/userController")
const multer=require("multer")
const path=require("path")
const {authentication,checkAuth}=require("../middleware/auth")




const storage = multer.diskStorage({
    destination: (req,file,cb)=>{
        cb(null,"public/uploads")
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (req,file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true); 
    } else {
        cb(new Error("Only JPEG and PNG files are allowed."));
       
        
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter
});





route.get("/",checkAuth,controller.signUp)
route.get("/login",checkAuth,controller.logIn)
route.get("/profile/:id",authentication,controller.viewProfile)
route.get("/home",authentication,controller.getHome)
route.get("/profileupdate",authentication,controller.renderEdit)
route.get("/logout",controller.logout)


route.post("/profileupdate",upload.single("profilePic"),authentication,controller.updateProfile)
route.post("/login",controller.loginUser)
route.post("/signup",controller.registerUser)
route.post("/profile", upload.single("profilePic"), authentication,controller.profileSetUp);
route.post("/verify-otp/:id",controller.otpVerification)









module.exports=route