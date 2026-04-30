const router=require("express").Router();
const User=require("../models/User");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");


router.post("/register",async(req,res)=>{

try{

const hashed=await bcrypt.hash(
 req.body.password,
 10
);

const user=await User.create({
 name:req.body.name,
 email:req.body.email,
 password:hashed
});

res.json(user);

}catch(err){
 res.status(500).json({
  error:err.message
 });
}

});



router.post("/login",async(req,res)=>{

try{

const user=await User.findOne({
 where:{
  email:req.body.email
 }
});

if(!user){
 return res.status(400)
 .json({message:"User not found"});
}

const valid=
await bcrypt.compare(
 req.body.password,
 user.password
);

if(!valid){
 return res.status(400)
 .json({
  message:"Wrong password"
 });
}

const token=jwt.sign(
{
 id:user.id,
 role:user.role
},
"secret123"
);

res.json({token});

}catch(err){
 res.status(500).json({
 error:err.message
});
}

});

module.exports=router;