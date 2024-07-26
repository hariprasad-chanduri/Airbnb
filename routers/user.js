const express = require("express")
const router = express.Router()
const User = require("../models/user.js")
const wrapasync = require("../utils/wrapasync.js")
const passport = require("passport")
const { saveUrl } = require("../middleware.js")


router.get("/signup",(req,res)=>{
    res.render("users/signup.ejs")
})

router.post("/signup",wrapasync( async(req,res,next)=>{
    try{
        let {username ,email,password} = req.body
        const  newRegister = new User({username,email});
         const regidterdUser = await User.register(newRegister,password)
         req.login(regidterdUser,(err)=>{
            if(err){
                next(err)
            }
            req.flash("success","You have successfully registered")
            res.redirect("/listings")
         })     
    }catch(e){
        req.flash("error","You have already registered")
res.redirect("/signup")
    }
}))

router.get("/login",(req,res)=>{
    res.render("users/login.ejs");
})

router.post("/login", saveUrl,passport.authenticate("local",{failureRedirect:"/login",failureFlash:true}), async(req,res)=>{
    req.flash("success","You are successfully login")
    const redirectUrl = res.locals.redirectUrl || "/listings"  ;
    res.redirect(redirectUrl);
    
})

router.get("/logout",(req,res,next)=>{
    req.logout((err)=>{
        if(err){
            next(err)
        }
        req.flash("success","you have successfully logout")
        res.redirect("/listings")
  
    });
        
     
})

module.exports= router;