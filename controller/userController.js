const User=require("../model/userSchema")
const bcrypt=require("bcrypt")
const {extractDataFromToken,createToken}=require("./token")
const { render } = require("ejs")
const Chat=require("../model/chat")
const crypto=require("crypto")
const nodemailer=require("nodemailer")
const fs = require('fs');
const path = require('path');
require("dotenv").config()





const signUp=async(req,res)=>{
    try {
        res.render("signup")
    } catch (error) {
        return res.status(400).render("error", { errorMessage: "server error" });
    }

}



const registerUser=async(req,res)=>{
   
    try {
        const {username,email,password,confirmPassword}=req.body
        const user=await User.findOne({email})
     
        
        if(!username || !email || !password || !confirmPassword){
            return res.status(400).render("error", { errorMessage: "all fields required" });
         }
         else if(user){
            return res.status(400).render("error", { errorMessage: "user exists" });
         }
        else if(password!==confirmPassword){
            return res.status(400).render("error", { errorMessage: "password donot match" });
        }
        else{
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const otp=crypto.randomInt(100000,999999).toString()
         
            
            const otpExpires=Date.now()+10*60*1000
            
            const newUser= new User({
                username,
                email,
                password:hashedPassword,
                otp,
                otpExpires

            })

            await newUser.save();

             await sendOtp(email,otp)

             res.redirect(`/verify-otp?userId=${newUser._id}`);
 }

        } catch (error) {
            return res.status(500).render("error", { errorMessage: "Server error" });
         }
         
}
const transporter=nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:process.env.EMAIL_USER,
        pass:process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false 
    }
})





const sendOtp=async(email,otp)=>{
      
    try {
        const info =await transporter.sendMail({
            from: `ChatApp <${process.env.EMAIL_USER}>`,
            to:email,
            subject:"otp verification",
            text:`your otp code is :${otp}`
        })
        
    } catch (error) {
        return res.status(400).render("error", { errorMessage: "failed to send mail" });
    }



}

const otpVerification=async(req,res)=>{
  const id=req.params.id
  
   const otp=req.body.otp
try {

    const user=await User.findById(id)
    if(user.otp===otp){
     await User.findByIdAndUpdate(id,{$unset:{otp:1,otpExpires:1}},{new:true})
        
     await createToken(user,res)
 
    res.redirect("/profile")
}

    
} catch (error) {
    return res.status(400).render("error", { errorMessage: "server error" });
}
     
      }


const renderOtp=async(req,res)=>{

try {

    const userId = req.query.userId;
    res.render("otpVerification",{id:userId})
    
} catch (error) {
    return res.status(400).render("error", { errorMessage: "Server error" });
}



}
const renderProfile=async(req,res)=>{
try {
    res.render("profileSetUp")
} catch (error) {
    
}



}


const profileSetUp=async(req,res)=>{
    try {
        const _id=await extractDataFromToken(req,res)
        const {chatname,bio }= req.body 
        const profilePic = req.file.filename
        
        const updatedUser = await User.findOneAndUpdate(
            { _id},
            { chatname: chatname, bio: bio, image: profilePic },
            { new: true, runValidators: true }
        );

        res.redirect("/home")

    } catch (error) {
        return res.status(400).render("error", { errorMessage: "server error" });
    }
}

const logIn=async(req,res)=>{

try {
    res.render("login")
} catch (error) {
    return res.status(400).render("error", { errorMessage: "server error" });
}
}


const loginUser = async(req,res)=>{
    try {
        const {email,password}=req.body
        const user= await User.findOne({email})
        if(user){
            const isMatch = await bcrypt.compare(password, user.password);
            if(isMatch){
                await createToken(user,res)
                res.redirect("/home")
            }
            else{
            console.log("wrong password");
            return res.status(400).render("error", { errorMessage: "wrong password" });
            }
        }else{
            console.log("user not found");
            return res.status(400).render("error", { errorMessage: "user not found " });
        }
        
    } catch (error) {
        return res.status(400).render("error", { errorMessage: "server error" });
    }
}


const getHome=async (req,res)=>{
     
    try {
        const userId=await extractDataFromToken(req,res)
        const user=await User.findById(userId)
        const contacts = await User.find({ _id: { $ne: userId }})

        res.render("home", { contacts: contacts,user:user}); 
    } catch (error) {
        console.error("Error loading home page:", error);
        res.status(500).send("Internal ");
        
    }
       
        } 
        
    
   




   const renderEdit=async(req,res)=>{
   try {
    const userId= await extractDataFromToken(req,res)
    const user=await User.findById(userId)
    res.render("edit",{user:user})
    
   } catch (error) {
    return res.status(400).render("error", { errorMessage: "server error" });
   }
 }


//  const updateProfile=async(req,res)=>{
// try {
//     const {bio,chatname}=req.body

//     const _id=await extractDataFromToken(req,res)
    
//     let updateFields = { chatname, bio };

//     if (req.file) {
//         updateFields.image = req.file.filename; 
//     }

//     const updatedUser = await User.findOneAndUpdate(
//         { _id },
//         updateFields,
//         { new: true, runValidators: true }
//     );
//         res.redirect("/home")

//     }
        
  

// catch (error) {
//     return res.status(400).render("error", { errorMessage: "server error" });
// }}

const updateProfile = async (req, res) => {
    try {
        const { bio, chatname } = req.body;
        const _id = await extractDataFromToken(req, res);

        let updateFields = { chatname, bio };

    
        const user = await User.findById(_id);

   
        if (req.file) {
           
            if (user && user.image) {
                const oldImagePath = path.join(__dirname, "../public/uploads", user.image);
               if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath); 
                }
            }

            updateFields.image = req.file.filename;
        }

        const updatedUser = await User.findOneAndUpdate(
            { _id },
            updateFields,
            { new: true, runValidators: true }
        );

        res.redirect("/home");

    } catch (error) {
        return res.status(400).render("error", { errorMessage: "Server error" });
    }
};


const logout=async(req,res)=>{
try {

    res.clearCookie("token");
    res.redirect("/login")

    
} catch (error) {
    return res.status(400).render("error", { errorMessage: "server error" }); 
}



}

const viewProfile=async(req,res)=>{

const id=req.params.id
const user=await User.findById(id)

res.render("showinfo",{user:user})
}




module.exports = {signUp,
    logIn,
    registerUser,
    loginUser,
    viewProfile,
    profileSetUp,
    getHome,
    renderEdit,
    updateProfile,
    logout,
    otpVerification,
    renderOtp,
    renderProfile
    }