const mongoose=require("mongoose")

const userSchema=new mongoose.Schema({
username:{
    type:String,
    required:true
},
email:{
    type:String,
    required:true,
    
},
password:{
    type:String,
    required:true
},
chatname:{
    type:String
},
bio:{
    type:String
},
image:{
    type:String
},
otp:{
 type:String

},
otpExpires:{
    type:Date
}
})


module.exports=mongoose.model("user",userSchema)